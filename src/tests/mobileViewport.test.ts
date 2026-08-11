import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const styles = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');
const documentShell = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

describe('mobile keyboard viewport safety', () => {
  it('keeps touch-device editors at the WebKit-safe 16px focus size', () => {
    expect(styles).toContain(
      '@media (max-width: 900px) and (hover: none) and (pointer: coarse)',
    );
    expect(styles).toMatch(/select,\s*textarea\s*{\s*font-size: 16px !important;/);
    expect(styles).toMatch(/\.ai-composer textarea\s*{\s*resize: none;/);
  });

  it('preserves user-controlled pinch zoom for accessibility', () => {
    expect(documentShell).not.toMatch(/user-scalable\s*=\s*no/i);
    expect(documentShell).not.toMatch(/maximum-scale/i);
  });
});
