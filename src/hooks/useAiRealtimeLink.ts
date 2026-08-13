import { useCallback, useEffect, useRef, useState } from 'react';
import {
  estimateRealtimeCostUsd,
  estimateTranscriptionCostUsd,
  recordAiUsage,
} from '@/game/aiVoice';
import type { AiProgressContext } from '@/services/aiHeadquarters';
import type { AiVoiceProfile, CompanionId } from '@/types/game';

export type AiRealtimeState =
  'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error';

interface RealtimeUsage {
  input_tokens?: number;
  cached_input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  input_token_details?: {
    audio_tokens?: number;
    cached_tokens?: number;
    cached_tokens_details?: { audio_tokens?: number };
  };
  output_token_details?: { audio_tokens?: number };
}

const REALTIME_SESSION_ID = crypto.randomUUID();
const MICROPHONE_WARMUP_MS = 900;

function numberValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function responseTranscript(response: Record<string, unknown>) {
  const output = Array.isArray(response.output) ? response.output : [];
  for (const itemValue of output) {
    if (!itemValue || typeof itemValue !== 'object') continue;
    const item = itemValue as Record<string, unknown>;
    const content = Array.isArray(item.content) ? item.content : [];
    for (const contentValue of content) {
      if (!contentValue || typeof contentValue !== 'object') continue;
      const part = contentValue as Record<string, unknown>;
      if (typeof part.transcript === 'string' && part.transcript.trim()) {
        return part.transcript.trim();
      }
    }
  }
  return '';
}

export function useAiRealtimeLink(input: {
  onHunterTranscript: (text: string) => void | Promise<void>;
  onCompanionTranscript: (companionId: CompanionId, text: string) => void | Promise<void>;
  onNotice: (message: string) => void;
}) {
  const [state, setState] = useState<AiRealtimeState>('idle');
  const [muted, setMuted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [model, setModel] = useState<string>();
  const peerRef = useRef<RTCPeerConnection>();
  const channelRef = useRef<RTCDataChannel>();
  const streamRef = useRef<MediaStream>();
  const audioRef = useRef<HTMLAudioElement>();
  const companionIdRef = useRef<CompanionId>();
  const modelRef = useRef('gpt-realtime-2.1-mini');
  const activeRef = useRef(false);
  const timerRef = useRef<number>();
  const warmupTimerRef = useRef<number>();
  const mutedRef = useRef(false);
  const startedAtRef = useRef(0);
  const speechStartedAtRef = useRef(0);
  const lastSpeechSecondsRef = useRef(0);
  const transcriptByItemRef = useRef(new Map<string, string>());
  const deliveredTranscriptIdsRef = useRef(new Set<string>());

  const stop = useCallback(() => {
    activeRef.current = false;
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (warmupTimerRef.current) window.clearTimeout(warmupTimerRef.current);
    timerRef.current = undefined;
    warmupTimerRef.current = undefined;
    channelRef.current?.close();
    peerRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
    }
    channelRef.current = undefined;
    peerRef.current = undefined;
    streamRef.current = undefined;
    audioRef.current = undefined;
    companionIdRef.current = undefined;
    transcriptByItemRef.current.clear();
    deliveredTranscriptIdsRef.current.clear();
    mutedRef.current = false;
    setMuted(false);
    setElapsedSeconds(0);
    setState('idle');
  }, []);

  useEffect(() => stop, [stop]);

  const trackRealtimeUsage = useCallback(async (usage: RealtimeUsage, currentModel: string) => {
    const inputTokens = numberValue(usage.input_tokens);
    const cachedInputTokens = numberValue(
      usage.cached_input_tokens ?? usage.input_token_details?.cached_tokens,
    );
    const outputTokens = numberValue(usage.output_tokens);
    const audioInputTokens = numberValue(usage.input_token_details?.audio_tokens);
    const cachedAudioInputTokens = numberValue(
      usage.input_token_details?.cached_tokens_details?.audio_tokens,
    );
    const audioOutputTokens = numberValue(usage.output_token_details?.audio_tokens);
    if (!inputTokens && !outputTokens) return;
    await recordAiUsage({
      kind: 'realtime',
      sessionId: REALTIME_SESSION_ID,
      model: currentModel,
      companionId: companionIdRef.current,
      inputTokens,
      cachedInputTokens,
      outputTokens,
      audioInputTokens,
      cachedAudioInputTokens,
      audioOutputTokens,
      totalTokens: numberValue(usage.total_tokens) || inputTokens + outputTokens,
      characters: 0,
      audioSeconds: lastSpeechSecondsRef.current,
      estimatedCostUsd: estimateRealtimeCostUsd({
        model: currentModel,
        inputTokens,
        cachedInputTokens,
        outputTokens,
        audioInputTokens,
        cachedAudioInputTokens,
        audioOutputTokens,
      }),
      exactUsage: true,
    });
    lastSpeechSecondsRef.current = 0;
  }, []);

  const handleEvent = useCallback(
    async (event: Record<string, unknown>) => {
      const type = String(event.type ?? '');
      if (type === 'input_audio_buffer.speech_started') {
        speechStartedAtRef.current = performance.now();
        setState('listening');
        return;
      }
      if (type === 'input_audio_buffer.speech_stopped') {
        lastSpeechSecondsRef.current = Math.max(
          0,
          (performance.now() - speechStartedAtRef.current) / 1_000,
        );
        setState('thinking');
        return;
      }
      if (type === 'conversation.item.input_audio_transcription.completed') {
        const transcript = typeof event.transcript === 'string' ? event.transcript.trim() : '';
        if (transcript) await input.onHunterTranscript(transcript);
        const usage =
          event.usage && typeof event.usage === 'object'
            ? (event.usage as RealtimeUsage)
            : undefined;
        if (usage) {
          const inputTokens = numberValue(usage.input_tokens);
          const outputTokens = numberValue(usage.output_tokens);
          await recordAiUsage({
            kind: 'transcription',
            sessionId: REALTIME_SESSION_ID,
            model: 'gpt-4o-mini-transcribe',
            companionId: companionIdRef.current,
            inputTokens,
            outputTokens,
            totalTokens: numberValue(usage.total_tokens) || inputTokens + outputTokens,
            characters: transcript.length,
            audioSeconds: lastSpeechSecondsRef.current,
            estimatedCostUsd: estimateTranscriptionCostUsd(lastSpeechSecondsRef.current) / 2,
            exactUsage: true,
          });
        }
        return;
      }
      if (type === 'response.output_audio.delta') {
        setState('speaking');
        return;
      }
      if (type === 'response.output_audio_transcript.delta') {
        const itemId = String(event.item_id ?? event.response_id ?? 'current');
        const current = transcriptByItemRef.current.get(itemId) ?? '';
        transcriptByItemRef.current.set(itemId, current + String(event.delta ?? ''));
        return;
      }
      if (type === 'response.output_audio_transcript.done') {
        const itemId = String(event.item_id ?? event.response_id ?? 'current');
        const responseId = String(event.response_id ?? '');
        const transcript =
          (typeof event.transcript === 'string' ? event.transcript : undefined) ??
          transcriptByItemRef.current.get(itemId) ??
          '';
        if (
          transcript.trim() &&
          !deliveredTranscriptIdsRef.current.has(itemId) &&
          companionIdRef.current
        ) {
          deliveredTranscriptIdsRef.current.add(itemId);
          if (responseId) deliveredTranscriptIdsRef.current.add(responseId);
          await input.onCompanionTranscript(companionIdRef.current, transcript.trim());
        }
        return;
      }
      if (type === 'response.done') {
        const response =
          event.response && typeof event.response === 'object'
            ? (event.response as Record<string, unknown>)
            : {};
        const fallbackTranscript = responseTranscript(response);
        const responseId = String(response.id ?? event.event_id ?? 'response');
        if (
          fallbackTranscript &&
          !deliveredTranscriptIdsRef.current.has(responseId) &&
          companionIdRef.current
        ) {
          deliveredTranscriptIdsRef.current.add(responseId);
          await input.onCompanionTranscript(companionIdRef.current, fallbackTranscript);
        }
        if (response.usage && typeof response.usage === 'object') {
          await trackRealtimeUsage(response.usage as RealtimeUsage, modelRef.current);
        }
        if (activeRef.current) setState('listening');
        return;
      }
      if (type === 'error') {
        const error =
          event.error && typeof event.error === 'object'
            ? (event.error as Record<string, unknown>)
            : {};
        input.onNotice(
          typeof error.message === 'string'
            ? error.message
            : 'The live voice channel reported an error. Command Link remains available.',
        );
        stop();
        setState('error');
      }
    },
    [input, stop, trackRealtimeUsage],
  );

  const start = useCallback(
    async (session: {
      companionId: CompanionId;
      profile: AiVoiceProfile;
      context: AiProgressContext;
    }) => {
      if (!window.RTCPeerConnection || !navigator.mediaDevices?.getUserMedia) {
        input.onNotice('Live Link is not supported by this browser. Command Link still works.');
        setState('error');
        return false;
      }
      stop();
      setState('connecting');
      setElapsedSeconds(0);
      setModel(undefined);
      companionIdRef.current = session.companionId;
      transcriptByItemRef.current.clear();
      deliveredTranscriptIdsRef.current.clear();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        stream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
        const peer = new RTCPeerConnection();
        const audio = new Audio();
        audio.autoplay = true;
        audio.setAttribute('playsinline', '');
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));
        peer.ontrack = (event) => {
          audio.srcObject = event.streams[0];
          void audio
            .play()
            .catch(() =>
              input.onNotice(
                'Tap the live channel once more if your phone blocks companion audio.',
              ),
            );
        };
        const channel = peer.createDataChannel('oai-events');
        channel.onopen = () => {
          if (activeRef.current) setState('listening');
        };
        channel.onmessage = (message) => {
          try {
            const event = JSON.parse(String(message.data)) as Record<string, unknown>;
            void handleEvent(event);
          } catch {
            // Ignore non-JSON transport messages.
          }
        };
        peer.onconnectionstatechange = () => {
          if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
            input.onNotice('Live Link disconnected. Your local transcript is safe.');
            stop();
            setState('error');
          }
        };
        streamRef.current = stream;
        peerRef.current = peer;
        channelRef.current = channel;
        audioRef.current = audio;

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        const response = await fetch('/api/ai/realtime/session', {
          method: 'POST',
          headers: { accept: 'application/sdp', 'content-type': 'application/json' },
          body: JSON.stringify({
            sdp: offer.sdp,
            companionId: session.companionId,
            profile: session.profile,
            context: session.context,
          }),
        });
        if (!response.ok) {
          const payload = (await response.json().catch(() => undefined)) as
            { message?: string } | undefined;
          throw new Error(payload?.message || 'That companion could not open Live Link.');
        }
        const answer = await response.text();
        await peer.setRemoteDescription({ type: 'answer', sdp: answer });
        const currentModel = response.headers.get('x-ai-model') ?? 'gpt-realtime-2.1-mini';
        modelRef.current = currentModel;
        setModel(currentModel);
        activeRef.current = true;
        startedAtRef.current = performance.now();
        timerRef.current = window.setInterval(
          () => setElapsedSeconds((performance.now() - startedAtRef.current) / 1_000),
          250,
        );
        warmupTimerRef.current = window.setTimeout(() => {
          warmupTimerRef.current = undefined;
          if (!activeRef.current) return;
          stream.getAudioTracks().forEach((track) => {
            track.enabled = !mutedRef.current;
          });
          setState('listening');
        }, MICROPHONE_WARMUP_MS);
        return true;
      } catch (error) {
        stop();
        setState('error');
        input.onNotice(
          error instanceof Error
            ? error.message
            : 'Live Link could not start. Command Link remains available.',
        );
        return false;
      }
    },
    [handleEvent, input, stop],
  );

  const toggleMute = useCallback(() => {
    const next = !muted;
    mutedRef.current = next;
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !next;
    });
    setMuted(next);
  }, [muted]);

  return {
    state,
    active: state !== 'idle' && state !== 'error',
    muted,
    elapsedSeconds,
    model,
    start,
    stop,
    toggleMute,
  };
}
