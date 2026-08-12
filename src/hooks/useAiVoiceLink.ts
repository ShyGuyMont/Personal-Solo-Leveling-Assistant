import { useCallback, useEffect, useRef, useState } from 'react';
import { CANON_VOICE_PROFILES } from '@/config/aiVoices';
import { db } from '@/db/database';
import {
  estimateSpeechCostUsd,
  estimateTextCostUsd,
  estimateTranscriptionCostUsd,
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
} from '@/services/aiHeadquarters';
import type { AiConversationMessage, AiVoiceProfile, CompanionId, Settings } from '@/types/game';

type NoticeHandler = (message: string) => void;

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
  onTranscript: (text: string) => void;
  onNotice: NoticeHandler;
}) {
  const sessionIdRef = useRef(crypto.randomUUID());
  const [profiles, setProfiles] = useState<Record<CompanionId, AiVoiceProfile>>();
  const [usage, setUsage] = useState<AiUsageSummary>();
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
  const audioRef = useRef<HTMLAudioElement>();
  const playbackResolverRef = useRef<() => void>();
  const playbackGenerationRef = useRef(0);
  const audioCacheRef = useRef(new Map<string, string>());

  const refreshUsage = useCallback(async () => {
    setUsage(await getAiUsageSummary(sessionIdRef.current));
  }, []);

  useEffect(() => {
    void getAiVoiceProfiles().then(setProfiles);
    void refreshUsage();
  }, [refreshUsage]);

  const stopPlayback = useCallback(() => {
    playbackGenerationRef.current += 1;
    audioRef.current?.pause();
    audioRef.current = undefined;
    playbackResolverRef.current?.();
    playbackResolverRef.current = undefined;
    setPlayingMessageId(undefined);
    setVoiceBusyMessageId(undefined);
    setPlaybackPaused(false);
    setRoundtableActive(false);
  }, []);

  useEffect(
    () => () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
      if (recordingLimitRef.current) window.clearTimeout(recordingLimitRef.current);
      audioRef.current?.pause();
      for (const url of audioCacheRef.current.values()) URL.revokeObjectURL(url);
    },
    [],
  );

  const updateVoiceSettings = useCallback(
    async (changes: Partial<Settings>) => {
      await db.settings.update('primary', changes);
      await input.refresh();
    },
    [input],
  );

  const enableVoiceOutput = useCallback(async () => {
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
        outputTokens: reply.usage.outputTokens,
        totalTokens: reply.usage.totalTokens,
        characters: 0,
        audioSeconds: 0,
        estimatedCostUsd: estimateTextCostUsd(
          reply.model,
          reply.usage.inputTokens,
          reply.usage.outputTokens,
        ),
        exactUsage: true,
      });
      await refreshUsage();
    },
    [refreshUsage],
  );

  const getSpeechUrl = useCallback(
    async (
      companionId: CompanionId,
      text: string,
      cacheKey: string,
      profileOverride?: AiVoiceProfile,
    ) => {
      const cached = audioCacheRef.current.get(cacheKey);
      if (cached) return cached;
      const profile = profileOverride ?? profiles?.[companionId];
      if (!profile) throw new Error('That companion voice is still initializing.');
      setVoiceBusyMessageId(cacheKey);
      const result = await requestAiSpeech({ companionId, text, profile });
      const url = URL.createObjectURL(result.audio);
      audioCacheRef.current.set(cacheKey, url);
      await recordAiUsage({
        kind: 'speech',
        sessionId: sessionIdRef.current,
        model: result.model,
        companionId,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        characters: result.characters,
        audioSeconds: result.estimatedAudioSeconds,
        estimatedCostUsd: result.estimatedCostUsd || estimateSpeechCostUsd(result.characters),
        exactUsage: false,
      });
      await refreshUsage();
      setVoiceBusyMessageId(undefined);
      return url;
    },
    [profiles, refreshUsage],
  );

  const playOne = useCallback(
    async (
      message: Pick<AiConversationMessage, 'id' | 'message' | 'companionId'>,
      generation: number,
      profileOverride?: AiVoiceProfile,
    ) => {
      if (!message.companionId) return;
      const url = await getSpeechUrl(
        message.companionId,
        message.message,
        message.id,
        profileOverride,
      );
      if (generation !== playbackGenerationRef.current) return;
      const audio = new Audio(url);
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
        audio.addEventListener('ended', finish, { once: true });
        audio.addEventListener('error', () => reject(new Error('Audio playback failed.')), {
          once: true,
        });
        void audio.play().catch(reject);
      });
    },
    [getSpeechUrl],
  );

  const playMessages = useCallback(
    async (
      messages: Array<Pick<AiConversationMessage, 'id' | 'message' | 'companionId'>>,
      profileOverride?: AiVoiceProfile,
    ) => {
      if (!input.settings?.aiVoiceOutputEnabled) {
        input.onNotice('Enable Voice Link first. Spoken companion voices are AI-generated.');
        return;
      }
      stopPlayback();
      const generation = playbackGenerationRef.current;
      setRoundtableActive(messages.length > 1);
      try {
        for (const message of messages) {
          if (generation !== playbackGenerationRef.current) break;
          await playOne(message, generation, profileOverride);
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
      void audio.play();
      setPlaybackPaused(false);
    } else {
      audio.pause();
      setPlaybackPaused(true);
    }
  }, []);

  const skipCurrent = useCallback(() => {
    audioRef.current?.pause();
    playbackResolverRef.current?.();
  }, []);

  const previewProfile = useCallback(
    async (profile: AiVoiceProfile) => {
      const canon = CANON_VOICE_PROFILES[profile.id];
      const cacheKey = `preview:${profile.id}:${profile.voice}:${profile.accent}:${profile.pace}:${profile.warmth}:${profile.energy}:${profile.expressiveness}`;
      await playMessages(
        [{ id: cacheKey, companionId: profile.id, message: canon.audition }],
        profile,
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        setRecording(false);
        const seconds = Math.min(
          60,
          Math.max(0.2, (Date.now() - recordingStartedAtRef.current) / 1_000),
        );
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        chunksRef.current = [];
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
          input.onTranscript(result.text);
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
            'Voice captured. Review the transcript, edit anything you want, then send.',
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
    saveProfile,
    resetProfile,
    trackTextUsage,
    playMessages,
    previewProfile,
    stopPlayback,
    togglePause,
    skipCurrent,
    startRecording,
    stopRecording,
  };
}
