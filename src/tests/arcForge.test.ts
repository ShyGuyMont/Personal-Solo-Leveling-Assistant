import { describe, expect, it } from 'vitest';
import { createArcForgeDocument } from '@/arcEngine/document';

describe('embedded A.R.C. Dossier Forge', () => {
  it('compiles the original engine into host-safe asset URLs', () => {
    const document = createArcForgeDocument();

    expect(document).toContain('<title>A.R.C. Character Archives</title>');
    expect(document).toContain('Character Dossier');
    expect(document).toContain('Arts Codex');
    expect(document).not.toContain('href="styles.css"');
    expect(document).not.toContain('src="app.js"');
    expect(document).not.toContain('src="catalogs.js"');
  });
});
