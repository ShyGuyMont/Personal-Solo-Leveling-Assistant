import { describe, expect, it } from 'vitest';
import {
  buildCipherTopicPrompt,
  ENGINEERING_LIBRARY_TOPICS,
  searchEngineeringLibrary,
  selectEngineeringTopics,
} from '@/config/engineeringLibrary';

describe('Cipher Engineering Library', () => {
  it('ships unique, source-grounded offline dossiers', () => {
    expect(ENGINEERING_LIBRARY_TOPICS.length).toBeGreaterThanOrEqual(14);
    expect(new Set(ENGINEERING_LIBRARY_TOPICS.map((topic) => topic.id)).size).toBe(
      ENGINEERING_LIBRARY_TOPICS.length,
    );
    for (const topic of ENGINEERING_LIBRARY_TOPICS) {
      expect(topic.keyConcepts.length).toBeGreaterThanOrEqual(4);
      expect(topic.fieldChecklist.length).toBeGreaterThanOrEqual(4);
      expect(topic.sources.length).toBeGreaterThan(0);
      expect(topic.sources.every((source) => source.url.startsWith('https://'))).toBe(true);
    }
  });

  it('finds engineering concepts by natural technical language', () => {
    expect(searchEngineeringLibrary('S21')[0]?.id).toBe('s-parameters');
    expect(searchEngineeringLibrary('phase noise dBc/Hz')[0]?.id).toBe('phase-noise');
    expect(searchEngineeringLibrary('Excel Power Query')[0]?.id).toBe('excel-automation');
    expect(selectEngineeringTopics('VNA calibration')[0]?.id).toBe('vna-calibration');
  });

  it('grounds a Cipher handoff in the selected official sources', () => {
    const topic = ENGINEERING_LIBRARY_TOPICS.find((item) => item.id === 'phase-noise')!;
    const prompt = buildCipherTopicPrompt(topic);
    expect(prompt).toContain('Phase Noise Measurement');
    expect(prompt).toContain('Rohde & Schwarz');
    expect(prompt).toContain('distinguish sourced facts from your own inference');
  });
});
