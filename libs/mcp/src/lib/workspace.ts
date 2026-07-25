import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/**
 * A directory is an xUI checkout when it has an Nx workspace file *and* the component tree the
 * index is extracted from. Requiring `libs/ui` keeps a consumer application - which has `nx.json`
 * too - from being mistaken for the library itself.
 */
export function isXuiWorkspace(dir: string): boolean {
  return existsSync(join(dir, 'nx.json')) && existsSync(join(dir, 'libs', 'ui'));
}

/** Walk up from `startDir` looking for an xUI checkout. */
export function findWorkspaceRoot(startDir: string = process.cwd()): string | undefined {
  let current = resolve(startDir);

  for (;;) {
    if (isXuiWorkspace(current)) {
      return current;
    }

    const parent = dirname(current);
    if (parent === current) {
      return undefined;
    }

    current = parent;
  }
}

/**
 * Workspace root to extract from: an explicit `XUI_WORKSPACE_ROOT` wins so the server can be
 * pointed at a checkout from anywhere, otherwise the cwd is probed.
 */
export function resolveWorkspaceRoot(): string | undefined {
  const fromEnv = process.env['XUI_WORKSPACE_ROOT'];

  if (fromEnv) {
    const root = resolve(fromEnv);
    return isXuiWorkspace(root) ? root : undefined;
  }

  return findWorkspaceRoot();
}

export function readJson<T>(path: string): T | undefined {
  if (!existsSync(path)) {
    return undefined;
  }

  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch {
    return undefined;
  }
}

export function readText(path: string): string | undefined {
  return existsSync(path) ? readFileSync(path, 'utf8') : undefined;
}
