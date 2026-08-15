import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const styles = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');
const documentShell = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const appShell = readFileSync(resolve(process.cwd(), 'src/components/AppShell.tsx'), 'utf8');
const app = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');
const dashboard = readFileSync(resolve(process.cwd(), 'src/pages/DashboardPage.tsx'), 'utf8');
const viteConfig = readFileSync(resolve(process.cwd(), 'vite.config.ts'), 'utf8');
const quickLink = readFileSync(
  resolve(process.cwd(), 'src/components/CompanionQuickLink.tsx'),
  'utf8',
);
const bodyDiagnostic = readFileSync(
  resolve(process.cwd(), 'src/components/BodyDiagnosticPanel.tsx'),
  'utf8',
);
const voiceLink = readFileSync(resolve(process.cwd(), 'src/hooks/useAiVoiceLink.ts'), 'utf8');
const realtimeLink = readFileSync(resolve(process.cwd(), 'src/hooks/useAiRealtimeLink.ts'), 'utf8');
const mediaSecurity = readFileSync(resolve(process.cwd(), 'src/utils/mediaSecurity.ts'), 'utf8');
const audio = readFileSync(resolve(process.cwd(), 'src/utils/audio.ts'), 'utf8');
const worker = readFileSync(resolve(process.cwd(), 'worker/index.js'), 'utf8');

describe('mobile keyboard viewport safety', () => {
  it('keeps touch-device editors at the WebKit-safe 16px focus size', () => {
    expect(styles).toContain('@media (max-width: 900px) and (hover: none) and (pointer: coarse)');
    expect(styles).toMatch(/select,\s*textarea\s*{\s*font-size: 16px !important;/);
    expect(styles).toMatch(/\.ai-composer textarea\s*{\s*resize: none;/);
  });

  it('preserves user-controlled pinch zoom for accessibility', () => {
    expect(documentShell).not.toMatch(/user-scalable\s*=\s*no/i);
    expect(documentShell).not.toMatch(/maximum-scale/i);
  });

  it('keeps AI Headquarters beside the separate Quick Link control', () => {
    expect(appShell).toContain('Open AI Headquarters');
    expect(appShell).toContain('<CompanionQuickLink />');
    expect(appShell).toContain('Open Status and Class progression');
    expect(appShell).toContain("{ to: '/creator-forge', label: 'Creator', icon: Video }");
    expect(appShell).not.toContain("{ to: '/status', label: 'Status'");
  });

  it('mounts the voice sheet above the sticky header with its own touch scrolling', () => {
    expect(quickLink).toContain('createPortal(');
    expect(quickLink).toContain('Listening now. Tap the square when you finish speaking.');
    expect(styles).toMatch(/\.quick-link__panel\s*{[^}]*overflow-y: auto;/s);
    expect(styles).toMatch(/\.quick-link__panel > header\s*{[^}]*position: sticky;/s);
  });

  it('never lets the offline navigation fallback intercept secure API routes', () => {
    expect(viteConfig).toContain('navigateFallbackDenylist: [/^\\/api\\//]');
  });

  it('opens the normal phone photo library for every Body Diagnostic image', () => {
    expect(bodyDiagnostic).toContain('Choose from Photo Library');
    expect(bodyDiagnostic).toContain('Add from library');
    expect(bodyDiagnostic).not.toContain('capture="environment"');
    expect(documentShell).toContain("img-src 'self' data: blob:");
  });

  it('seals the hosted app against camera access while preserving deliberate audio links', () => {
    expect(worker).toContain("APP_PERMISSIONS_POLICY = 'camera=(), microphone=(self)'");
    expect(worker).toContain(`APP_LEGACY_FEATURE_POLICY = "camera 'none'; microphone 'self'"`);
    expect(worker).toContain('sealAppMediaPermissions(response)');
    expect(mediaSecurity).toContain("action: 'audio-requested' | 'audio-opened' | 'video-blocked'");
    expect(mediaSecurity).toContain('video: false');
    expect(mediaSecurity).toContain("'video-blocked'");
    expect(voiceLink).toContain('getUserMedia({ audio: true, video: false })');
    expect(realtimeLink).toContain('audio: { echoCancellation: true');
    expect(realtimeLink).toContain('video: false');
    expect(voiceLink).not.toMatch(/video\s*:\s*true/);
    expect(realtimeLink).not.toMatch(/video\s*:\s*true/);
    expect(bodyDiagnostic).not.toMatch(/capture\s*=/i);
  });

  it('opens Quick Link without silently starting the microphone', () => {
    expect(quickLink).toContain('async function openQuickLink()');
    expect(quickLink).toContain('Quick Link ready. Tap the microphone when you want me to listen.');
    expect(quickLink).toContain('onClick={openQuickLink}');
    expect(quickLink).not.toContain('async function openAndListen()');
  });

  it('releases both voice pathways whenever iOS hides or exits the app', () => {
    expect(voiceLink).toContain('installMediaReleaseGuard(releaseMedia)');
    expect(voiceLink).toContain('discardRecordingRef.current = true');
    expect(voiceLink).toContain("document.visibilityState === 'hidden'");
    expect(realtimeLink).toContain('installMediaReleaseGuard(stop)');
    expect(realtimeLink).toContain('startGeneration !== releaseGenerationRef.current');
  });

  it('stops continuous background rendering on phones while preserving the visible Core', () => {
    expect(appShell).toContain("performanceProfile === 'full'");
    expect(dashboard).toContain('new IntersectionObserver(');
    expect(dashboard).toContain("'is-energy-suspended'");
    expect(dashboard).toContain("data-core-visibility={coreVisible ? 'visible' : 'suspended'}");
    expect(styles).toMatch(
      /\.ascension-core\.is-energy-suspended[\s\S]*animation-play-state: paused !important;/,
    );
    expect(styles).toMatch(
      /html\[data-performance='balanced'\][\s\S]*\.ambient-orb[\s\S]*display: none;/,
    );
    expect(styles).toContain(
      "html[data-performance='balanced'] .ascension-core__plasma-arcs span:nth-child(even)",
    );
    expect(styles).toContain(
      "html[data-performance='balanced'] .ascension-core__reactor-facets span:nth-child(even)",
    );
  });

  it('lets an idle phone enter Deep Sleep without disabling functional progress', () => {
    expect(appShell).not.toContain('primeAudioOutput');
    expect(audio).toContain('context.suspend()');
    expect(audio).toContain('scheduleAudioSuspend');
    expect(styles).toContain("html[data-render-activity='idle'][data-performance='balanced']");
    expect(styles).toMatch(/\.is-spinning[\s\S]*animation-play-state: running !important;/);
    expect(app).toContain("window.matchMedia('(hover: none), (pointer: coarse)').matches");
  });
});
