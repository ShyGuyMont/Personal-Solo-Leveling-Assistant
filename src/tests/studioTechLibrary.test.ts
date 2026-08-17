import { describe, expect, it } from 'vitest';
import {
  buildStudioTechPrompt,
  searchStudioTechLibrary,
  STUDIO_TECH_TOPICS,
} from '@/config/studioTechLibrary';

describe('Cipher Studio Tech Vault', () => {
  it('ships unique, source-grounded offline dossiers', () => {
    expect(STUDIO_TECH_TOPICS).toHaveLength(13);
    expect(new Set(STUDIO_TECH_TOPICS.map((topic) => topic.id)).size).toBe(
      STUDIO_TECH_TOPICS.length,
    );

    for (const topic of STUDIO_TECH_TOPICS) {
      expect(topic.concepts.length).toBeGreaterThanOrEqual(4);
      expect(topic.setupChecklist.length).toBeGreaterThanOrEqual(5);
      expect(topic.diagnostics.length).toBeGreaterThanOrEqual(3);
      expect(topic.sources.length).toBeGreaterThan(0);
      expect(topic.sources.every((source) => source.url.startsWith('https://'))).toBe(true);
    }
  });

  it('finds creator hardware by natural language', () => {
    expect(searchStudioTechLibrary('capture card HDMI')[0]?.id).toBe('capture-compatibility');
    expect(searchStudioTechLibrary('OBS scenes sources')[0]?.id).toBe('obs-architecture');
    expect(searchStudioTechLibrary('audio video sync delay')[0]?.id).toBe('latency-sync');
  });

  it('grounds a Cipher handoff in official source material', () => {
    const topic = STUDIO_TECH_TOPICS.find((item) => item.id === 'youtube-delivery')!;
    const prompt = buildStudioTechPrompt(topic);

    expect(prompt).toContain(topic.title);
    expect(prompt).toContain('YouTube Help');
    expect(prompt).toContain('official sources');
  });
});
