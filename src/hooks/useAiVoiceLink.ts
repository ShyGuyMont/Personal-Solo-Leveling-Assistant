import { useCallback, useEffect, useRef, useState } from 'react';
import { CANON_VOICE_PROFILES } from '@/config/aiVoices';
import { db } from '@/db/database';
import {
  estimateSpeechCostUsd,
  estimateTextCostUsd,
  estimateTranscriptionCostUsd,
  getAiSpokenText,
  getAiUsageSummary,
  getAiVoiceProfiles,
  recordAiUsage,
  resetAiVoiceProfile,
  saveAiVoiceProfile,
  type AiUsageSummary,
} from '@/game/aiVoice';
import {
  requestAiSpeech,
  requestAiTranscription,
  type AiHeadquartersReply,
  type CartesiaVoiceOption,
  requestCartesiaVoiceCatalog,
} from '@/services/aiHeadquarters';
import type {
  AiCartesiaPlan,
  AiConversationMessage,
  AiVoiceProfile,
  AiVoiceProvider,
  AiVoiceTake,
  CompanionId,
  Settings,
} from '@/types/game';
import { AppAudioPlayer, decodeAudioBlob, playSpeakerTest, primeAudioOutput } from '@/utils/audio';
import { installMediaReleaseGuard } from '@/utils/mediaLifecycle';

type NoticeHandler = (message: string) => void;
const APP_AI_SESSION_ID = crypto.randomUUID();

function chooseRecorderType() {
  if (typeof MediaRecorder === 'undefined') return '';
  return (
    ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'].find((type) =>
      MediaRecorder.isTypeSupported(type),
    ) ?? ''
  );
}

function fileExtension(mimeType: string) {
  if (mimeType.includes('mp4')) return 'm4a';
  if (mimeType.includes('ogg')) return 'ogg';
  return 'webm';
}

export function useAiVoiceLink(input: {
  settings?: Settings;
  refresh: () => Promise<void>;
  onTranscript: (text: string) => void | Promise<void>;
  onNotice: NoticeHandler;
  autoSubmitTranscript?: boolean;
}) {
  const sessionIdRef = useRef(APP_AI_SESSION_ID);
  const [profiles, setProfiles] = useState<Record<CompanionId, AiVoiceProfile>>();
  const [usage, setUsage] = useState<AiUsageSummary>();
  const [cartesiaVoices, setCartesiaVoices] = useState<CartesiaVoiceOption[]>([]);
  const [cartesiaCatalogLoading, setCartesiaCatalogLoading] = useState(false);
  const [cartesiaCatalogError, setCartesiaCatalogError] = useState('');
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingMessageId, setPlayingMessageId] = useState<string>();
  const [voiceBusyMessageId, setVoiceBusyMessageId] = useState<string>();
  const [playbackPaused, setPlaybackPaused] = useState(false);
  const [roundtableActive, setRoundtableActive] = useState(false);
  const recorderRef = useRef<MediaRecorder>();
  const streamRef = useRef<MediaStream>();
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef(0);
  const recordingTimerRef = useRef<number>();
  const recordingLimitRef = useRef<number>();
  const audioRef = useRef<AppAudioPlayer>();
  const playbackResolverRef = useRef<() => void>();
  const playbackGenerationRef = useRef(0);
  const audioCacheRef = useRef(new Map<string, AudioBuffer>());
  const fallbackNoticeShownRef = useRef(false);
  const discardRecordingRef = useRef(false);

  const refreshUsage = useCallback(async () => {
    setUsage(await getAiUsageSummary(sessionIdRef.current));
  }, []);

  useEffect(() => {
    void getAiVoiceProfiles().then(setProfiles);
    void refreshUsage();
  }, [refreshUsage]);

  useEffect(() => {
    const refresh = () => void refreshUsage();
    window.addEventListener('system:ai-usage-changed', refresh);
    return () => window.removeEventListener('system:ai-usage-changed', refresh);
  }, [refreshUsage]);

  const stopPlayback = useCallback(() => {
    playbackGenerationRef.current += 1;
    audioRef.current?.stop();
    audioRef.current = undefined;
    playbackResolverRef.current?.();
    playbackResolverRef.current = undefined;
    setPlayingMessageId(undefined);
    setVoiceBusyMessageId(undefined);
    setPlaybackPaused(false);
    setRoundtableActive(false);
  }, []);

  useEffect(() => {
    const audioCache = audioCacheRef.current;
    const releaseMedia = () => {
      discardRecordingRef.current = true;
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
      if (recordingLimitRef.current) window.clearTimeout(recordingLimitRef.current);
      audioRef.current?.stop();
      playbackResolverRef.current?.();
      playbackResolverRef.current = undefined;
    };
    const removeReleaseGuard = installMediaReleaseGuard(releaseMedia);

    return () => {
      removeReleaseGuard();
      releaseMedia();
      audioCache.clear();
    };
  }, []);

  const updateVoiceSettings = useCallback(
    async (changes: Partial<Settings>) => {
      await db.settings.update('primary', changes);
      await input.refresh();
    },
    [input],
  );

  const enableVoiceOutput = useCallback(async () => {
    primeAudioOutput();
    await updateVoiceSettings({
      aiVoiceOutputEnabled: true,
      aiVoiceDisclosureAcknowledged: true,
    });
    input.onNotice('Voice Link enabled. Every spoken companion voice is AI-generated.');
  }, [input, updateVoiceSettings]);

  const setVoiceOutputEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        await enableVoiceOutput();
      } else {
        stopPlayback();
        await updateVoiceSettings({ aiVoiceOutputEnabled: false, aiVoiceAutoPlay: false });
        input.onNotice('Companion voices muted. Text Mode remains fully available.');
      }
    },
    [enableVoiceOutput, input, stopPlayback, updateVoiceSettings],
  );

  const setAutoPlay = useCallback(
    async (enabled: boolean) => {
      await updateVoiceSettings({ aiVoiceAutoPlay: enabled });
      input.onNotice(
        enabled
          ? 'Automatic voiced replies enabled. Party Council will speak one companion at a time.'
          : 'Automatic voiced replies paused. Manual play controls remain available.',
      );
    },
    [input, updateVoiceSettings],
  );

  const setUsageWarning = useCallback(
    async (value: number) => {
      await updateVoiceSettings({ aiUsageWarningUsd: Math.min(1_000, Math.max(0, value)) });
    },
    [updateVoiceSettings],
  );

  const loadCartesiaVoices = useCallback(async () => {
    setCartesiaCatalogLoading(true);
    setCartesiaCatalogError('');
    try {
      const voices = await requestCartesiaVoiceCatalog();
      setCartesiaVoices(voices);
      return voices;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'The Cartesia casting library is unavailable.';
      setCartesiaCatalogError(message);
      return [];
    } finally {
      setCartesiaCatalogLoading(false);
    }
  }, []);

  const setVoiceProvider = useCallback(
    async (provider: AiVoiceProvider) => {
      stopPlayback();
      audioCacheRef.current.clear();
      fallbackNoticeShownRef.current = false;
      await updateVoiceSettings({ aiVoiceProvider: provider });
      if (provider === 'cartesia') {
        const voices = cartesiaVoices.length ? cartesiaVoices : await loadCartesiaVoices();
        input.onNotice(
          voices.length
            ? 'Cartesia Realistic selected. Uncast companions will use their OpenAI fallback.'
            : 'Cartesia is not connected yet. OpenAI fallback remains active.',
        );
      } else {
        input.onNotice('OpenAI Standard selected. Every saved Cartesia casting remains preserved.');
      }
    },
    [cartesiaVoices, input, loadCartesiaVoices, stopPlayback, updateVoiceSettings],
  );

  const setCartesiaPlan = useCallback(
    async (plan: AiCartesiaPlan) => {
      await updateVoiceSettings({ aiCartesiaPlan: plan });
    },
    [updateVoiceSettings],
  );

  const saveProfile = useCallback(async (profile: AiVoiceProfile) => {
    const saved = await saveAiVoiceProfile(profile);
    setProfiles((current) => (current ? { ...current, [saved.id]: saved } : current));
    return saved;
  }, []);

  const resetProfile = useCallback(async (companionId: CompanionId) => {
    const reset = await resetAiVoiceProfile(companionId);
    setProfiles((current) => (current ? { ...current, [companionId]: reset } : current));
    return reset;
  }, []);

  const trackTextUsage = useCallback(
    async (reply: Pick<AiHeadquartersReply, 'model' | 'usage'>) => {
      if (!reply.usage) return;
      await recordAiUsage({
        kind: 'text',
        sessionId: sessionIdRef.current,
        model: reply.model,
        inputTokens: reply.usage.inputTokens,
        cachedInputTokens: reply.usage.cachedInputTokens,
        outputTokens: reply.usage.outputTokens,
        reasoningTokens: reply.usage.reasoningTokens,
        totalTokens: reply.usage.totalTokens,
        characters: 0,
        audioSeconds: 0,
        estimatedCostUsd: estimateTextCostUsd(
          reply.model,
          reply.usage.inputTokens,
          reply.usage.outputTokens,
          reply.usage.cachedInputTokens,
        ),
        exactUsage: true,
      });
      await refreshUsage();
    },
    [refreshUsage],
  );

  const getSpeechBuffer = useCallback(
    async (
      companionId: CompanionId,
      text: string,
      cacheKey: string,
      profileOverride?: AiVoiceProfile,
      busyMessageId = cacheKey,
    ) => {
      const profile = profileOverride ?? profiles?.[companionId];
      if (!profile) throw new Error('That companion voice is still initializing.');
      const preferredProvider = input.settings?.aiVoiceProvider ?? 'openai';
      const effectiveSpeed =
        preferredProvider === 'cartesia' ? (profile.cartesiaSpeed ?? 1) : profile.pace;
      const effectiveCacheKey = [
        preferredProvider,
        profile.cartesiaVoiceId ?? profile.voice,
        effectiveSpeed,
        cacheKey,
      ].join(':');
      const cached = audioCacheRef.current.get(effectiveCacheKey);
      if (cached) return cached;
      setVoiceBusyMessageId(busyMessageId);
      try {
        const result = await requestAiSpeech({
          companionId,
          text,
          profile,
          provider: preferredProvider,
        });
        await recordAiUsage({
          kind: 'speech',
          sessionId: sessionIdRef.current,
          model: result.model,
          provider: result.provider,
          companionId,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          characters: result.characters,
          audioSeconds: result.estimatedAudioSeconds,
          estimatedCostUsd:
            result.provider === 'cartesia'
              ? 0
              : result.estimatedCostUsd || estimateSpeechCostUsd(result.characters),
          exactUsage: false,
        });
        if (
          preferredProvider === 'cartesia' &&
          result.fallbackUsed &&
          !fallbackNoticeShownRef.current
        ) {
          fallbackNoticeShownRef.current = true;
          input.onNotice(
            'Cartesia could not complete that voice. The OpenAI fallback spoke instead; no message or progress was lost.',
          );
        } else if (result.provider === 'cartesia') {
          fallbackNoticeShownRef.current = false;
        }
        await refreshUsage();
        const buffer = await decodeAudioBlob(result.audio);
        audioCacheRef.current.set(effectiveCacheKey, buffer);
        return buffer;
      } finally {
        setVoiceBusyMessageId(undefined);
      }
    },
    [input, profiles, refreshUsage],
  );

  const playOne = useCallback(
    async (
      message: Pick<AiConversationMessage, 'id' | 'message' | 'voiceSummary' | 'companionId'>,
      generation: number,
      profileOverride?: AiVoiceProfile,
      fullText = false,
    ) => {
      if (!message.companionId) return;
      const spokenText = getAiSpokenText(message, fullText);
      const speechMode = spokenText === message.message.trim() ? 'full' : 'briefing';
      const buffer = await getSpeechBuffer(
        message.companionId,
        spokenText,
        `${message.id}:${speechMode}`,
        profileOverride,
        message.id,
      );
      if (generation !== playbackGenerationRef.current) return;
      const audio = new AppAudioPlayer(buffer, () => playbackResolverRef.current?.());
      audioRef.current = audio;
      setPlayingMessageId(message.id);
      setPlaybackPaused(false);
      await new Promise<void>((resolve, reject) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          playbackResolverRef.current = undefined;
          resolve();
        };
        playbackResolverRef.current = finish;
        void audio.play().catch((error) => {
          playbackResolverRef.current = undefined;
          reject(error);
        });
      });
    },
    [getSpeechBuffer],
  );

  const playMessages = useCallback(
    async (
      messages: Array<
        Pick<AiConversationMessage, 'id' | 'message' | 'voiceSummary' | 'companionId'>
      >,
      profileOverride?: AiVoiceProfile,
      options?: { fullText?: boolean },
    ) => {
      if (!input.settings?.aiVoiceOutputEnabled) {
        input.onNotice('Enable Voice Link first. Spoken companion voices are AI-generated.');
        return;
      }
      primeAudioOutput();
      stopPlayback();
      const generation = playbackGenerationRef.current;
      setRoundtableActive(messages.length > 1);
      try {
        for (const message of messages) {
          if (generation !== playbackGenerationRef.current) break;
          await playOne(message, generation, profileOverride, options?.fullText === true);
        }
      } catch (error) {
        input.onNotice(error instanceof Error ? error.message : 'Voice playback failed.');
      } finally {
        if (generation === playbackGenerationRef.current) {
          setPlayingMessageId(undefined);
          setVoiceBusyMessageId(undefined);
          setPlaybackPaused(false);
          setRoundtableActive(false);
        }
      }
    },
    [input, playOne, stopPlayback],
  );

  const togglePause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio
        .play()
        .then(() => setPlaybackPaused(false))
        .catch(() => input.onNotice('Speaker playback is blocked. Tap Test speaker, then resume.'));
    } else {
      audio.pause();
      setPlaybackPaused(true);
    }
  }, [input]);

  const skipCurrent = useCallback(() => {
    audioRef.current?.stop();
    playbackResolverRef.current?.();
  }, []);

  const testSpeakerOutput = useCallback(async () => {
    const ready = await playSpeakerTest(input.settings?.soundVolume ?? 0.7);
    input.onNotice(
      ready
        ? 'Speaker test sent: you should hear three rising System tones.'
        : 'This browser is still blocking speaker output. Check the phone volume and site sound permission.',
    );
  }, [input]);

  const previewProfile = useCallback(
    async (profile: AiVoiceProfile, takeOverride?: AiVoiceTake) => {
      const auditionProfile = takeOverride
        ? { ...profile, performanceTake: takeOverride }
        : profile;
      const canon = CANON_VOICE_PROFILES[auditionProfile.id];
      const cacheKey = [
        'preview',
        auditionProfile.id,
        auditionProfile.voice,
        auditionProfile.cartesiaVoiceId ?? 'uncast',
        auditionProfile.cartesiaSpeed ?? 1,
        auditionProfile.accent,
        auditionProfile.delivery,
        auditionProfile.cadence,
        auditionProfile.texture,
        auditionProfile.register,
        auditionProfile.resonance,
        auditionProfile.performanceTake,
        auditionProfile.pace,
        auditionProfile.warmth,
        auditionProfile.energy,
        auditionProfile.expressiveness,
        auditionProfile.naturalism,
        auditionProfile.pauseDiscipline,
        auditionProfile.intonation,
        auditionProfile.articulation,
        auditionProfile.emotionalRange,
      ].join(':');
      await playMessages(
        [{ id: cacheKey, companionId: auditionProfile.id, message: canon.audition }],
        auditionProfile,
      );
    },
    [playMessages],
  );

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
  }, []);

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      input.onNotice('This browser does not expose a compatible microphone recorder.');
      return;
    }
    try {
      discardRecordingRef.current = false;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      if (document.visibilityState === 'hidden' || discardRecordingRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        discardRecordingRef.current = false;
        return;
      }
      const mimeType = chooseRecorderType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      recordingStartedAtRef.current = Date.now();
      setRecordingSeconds(0);
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      });
      recorder.addEventListener('stop', async () => {
        if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
        if (recordingLimitRef.current) window.clearTimeout(recordingLimitRef.current);
        stream.getTracks().forEach((track) => track.stop());
        recorderRef.current = undefined;
        streamRef.current = undefined;
        recordingTimerRef.current = undefined;
        recordingLimitRef.current = undefined;
        setRecording(false);
        setRecordingSeconds(0);
        const discardRecording = discardRecordingRef.current;
        discardRecordingRef.current = false;
        const seconds = Math.min(
          60,
          Math.max(0.2, (Date.now() - recordingStartedAtRef.current) / 1_000),
        );
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        chunksRef.current = [];
        if (discardRecording) return;
        if (!blob.size) {
          input.onNotice('No microphone audio was captured.');
          return;
        }
        setTranscribing(true);
        try {
          const result = await requestAiTranscription({
            audio: blob,
            fileName: `hunter-voice.${fileExtension(blob.type)}`,
            audioSeconds: seconds,
          });
          await input.onTranscript(result.text);
          await recordAiUsage({
            kind: 'transcription',
            sessionId: sessionIdRef.current,
            model: result.model,
            inputTokens: result.usage.inputTokens,
            outputTokens: result.usage.outputTokens,
            totalTokens: result.usage.totalTokens,
            characters: result.text.length,
            audioSeconds: result.audioSeconds,
            estimatedCostUsd:
              result.estimatedCostUsd || estimateTranscriptionCostUsd(result.audioSeconds),
            exactUsage: result.usage.exact,
          });
          await refreshUsage();
          input.onNotice(
            input.autoSubmitTranscript
              ? 'Voice captured. Quick Link is routing your transmission.'
              : 'Voice captured. Review the transcript, edit anything you want, then send.',
          );
        } catch (error) {
          input.onNotice(error instanceof Error ? error.message : 'Transcription failed.');
        } finally {
          setTranscribing(false);
        }
      });
      recorder.start(250);
      setRecording(true);
      recordingTimerRef.current = window.setInterval(
        () => setRecordingSeconds((Date.now() - recordingStartedAtRef.current) / 1_000),
        250,
      );
      recordingLimitRef.current = window.setTimeout(stopRecording, 60_000);
      input.onNotice('Listening… tap the microphone again when you are finished.');
    } catch (error) {
      input.onNotice(
        error instanceof Error && error.name === 'NotAllowedError'
          ? 'Microphone permission was not granted. You can enable it in this site’s browser settings.'
          : 'The microphone could not be opened.',
      );
    }
  }, [input, refreshUsage, stopRecording]);

  return {
    profiles,
    usage,
    cartesiaVoices,
    cartesiaCatalogLoading,
    cartesiaCatalogError,
    recording,
    transcribing,
    recordingSeconds,
    playingMessageId,
    voiceBusyMessageId,
    playbackPaused,
    roundtableActive,
    enableVoiceOutput,
    setVoiceOutputEnabled,
    setAutoPlay,
    setUsageWarning,
    setVoiceProvider,
    setCartesiaPlan,
    loadCartesiaVoices,
    saveProfile,
    resetProfile,
    trackTextUsage,
    playMessages,
    previewProfile,
    stopPlayback,
    togglePause,
    skipCurrent,
    testSpeakerOutput,
    startRecording,
    stopRecording,
  };
}
