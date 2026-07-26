import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/** Paths the store derives from `import.meta.url`; this spec sits beside it, so they match. */
const BUNDLED_PATH = fileURLToPath(new URL('../xui-index.json', import.meta.url));
const MANIFEST_PATH = fileURLToPath(new URL('../../package.json', import.meta.url));

/** Files served to the store instead of the ones on disk. */
const overrides = new Map<string, string>();

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs')>();

  return {
    ...actual,
    existsSync: (path: Parameters<typeof actual.existsSync>[0]) =>
      overrides.has(String(path)) || actual.existsSync(path),
    readFileSync: (path: Parameters<typeof actual.readFileSync>[0], options?: unknown) =>
      overrides.get(String(path)) ?? actual.readFileSync(path, options as never)
  };
});

// No workspace, so the store takes the bundled branch rather than extracting from a checkout.
vi.mock('./workspace.js', () => ({ resolveWorkspaceRoot: () => undefined }));

const { refreshIndex } = await import('./index-store.js');

const bundledIndex = (version: string) =>
  JSON.stringify({
    version,
    generatedAt: '2026-01-01T00:00:00.000Z',
    source: 'workspace',
    components: [],
    tokens: [],
    docs: []
  });

describe('the bundled index version', () => {
  beforeEach(() => {
    overrides.clear();
  });

  it('comes from the package manifest, not the stamp baked into the index', async () => {
    // What a real release ships: the index is generated before the version bump, so its stamp is
    // one release behind the package carrying it.
    overrides.set(BUNDLED_PATH, bundledIndex('2.0.0-alpha.19'));
    overrides.set(MANIFEST_PATH, JSON.stringify({ version: '2.0.0-alpha.20' }));

    const index = await refreshIndex();

    expect(index.version).toBe('2.0.0-alpha.20');
    expect(index.source).toBe('bundled');
  });

  it('falls back to the baked stamp when the manifest cannot be read', async () => {
    overrides.set(BUNDLED_PATH, bundledIndex('2.0.0-alpha.19'));
    overrides.set(MANIFEST_PATH, '{ not json');

    await expect(refreshIndex()).resolves.toMatchObject({ version: '2.0.0-alpha.19' });
  });

  it('falls back to the baked stamp when the manifest carries no version', async () => {
    overrides.set(BUNDLED_PATH, bundledIndex('2.0.0-alpha.19'));
    overrides.set(MANIFEST_PATH, JSON.stringify({ name: '@xui/mcp' }));

    await expect(refreshIndex()).resolves.toMatchObject({ version: '2.0.0-alpha.19' });
  });
});
