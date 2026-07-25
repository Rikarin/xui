// Everything imported here is a type, so the compiled schematic pulls in nothing at runtime and
// resolves under any package manager - including pnpm, where a package cannot reach dependencies
// it does not declare.
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

export interface Schema {
  /** Project to patch. Detected from the workspace when omitted. */
  project?: string;
  /** Stylesheet to patch, workspace-relative. Detected from the build target when omitted. */
  stylesFile?: string;
  /** Skip the CDK overlay stylesheet. */
  skipOverlay?: boolean;
}

const THEME_IMPORT = "@import '@xui/core/styles/theme.css';";
const OVERLAY_IMPORT = "@import '@angular/cdk/overlay-prebuilt.css';";
const TAILWIND_IMPORT = /@import\s+['"]tailwindcss['"]/;

/** Stylesheets to look at when the workspace configuration does not name one. */
const FALLBACK_STYLES = ['src/styles.css', 'src/styles.scss', 'src/global.css'];

export function ngAdd(options: Schema = {}): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const stylesPath = options.stylesFile ?? findStylesFile(tree, options.project);

    if (!stylesPath) {
      context.logger.warn(
        'xUI: could not find a global stylesheet to patch. Add the following to yours by hand:\n\n' +
          manualSnippet('../node_modules/@xui', options.skipOverlay)
      );

      return tree;
    }

    const original = tree.read(stylesPath)?.toString('utf8') ?? '';
    const additions = [
      THEME_IMPORT,
      ...(options.skipOverlay ? [] : [OVERLAY_IMPORT]),
      `@source '${sourceGlob(stylesPath)}';`
    ].filter(line => !original.includes(stripComment(line)));

    if (!additions.length) {
      context.logger.info(`xUI: ${stylesPath} is already set up.`);

      return tree;
    }

    if (!TAILWIND_IMPORT.test(original)) {
      context.logger.warn(
        `xUI: no "@import 'tailwindcss';" found in ${stylesPath}. The theme layers on top of ` +
          'Tailwind 4, so install and import Tailwind first, above the lines added below.'
      );
    }

    tree.overwrite(stylesPath, insertAfterImports(original, additions));

    context.logger.info(`xUI: patched ${stylesPath}`);
    for (const line of additions) {
      context.logger.info(`  + ${line}`);
    }

    if (!options.skipOverlay) {
      context.logger.info(
        'xUI: the overlay stylesheet is required by dialog, drawer, popover, tooltip, menu and ' +
          'toast. Re-run with --skip-overlay if you will not use any of them.'
      );
    }

    return tree;
  };
}

export default ngAdd;

/**
 * Tailwind resolves `@source` relative to the stylesheet, so the number of `../` segments depends
 * on how deep the stylesheet sits - the difference between a CLI app (`src/styles.css`) and an Nx
 * one (`apps/web/src/styles.css`). Getting this wrong is silent: the app builds and every
 * component renders unstyled, because Tailwind never scans the packages for their classes.
 */
function sourceGlob(stylesPath: string): string {
  const depth = stylesPath.split('/').length - 1;

  return `${'../'.repeat(depth)}node_modules/@xui`;
}

/** Put the additions after the last top-level `@import`, so Tailwind's own import stays first. */
function insertAfterImports(css: string, additions: string[]): string {
  const lines = css.split('\n');
  let lastImport = -1;

  for (let index = 0; index < lines.length; index++) {
    if (/^\s*@import\b/.test(lines[index])) {
      lastImport = index;
    }
  }

  const block = ['', ...additions];

  if (lastImport === -1) {
    return [...additions, '', ...lines].join('\n');
  }

  lines.splice(lastImport + 1, 0, ...block);

  return lines.join('\n');
}

/** Locate the stylesheet from the workspace configuration, falling back to the usual paths. */
function findStylesFile(tree: Tree, project?: string): string | undefined {
  const fromWorkspace = stylesFromWorkspace(tree, project);

  if (fromWorkspace) {
    return fromWorkspace;
  }

  return FALLBACK_STYLES.find(candidate => tree.exists(candidate));
}

function stylesFromWorkspace(tree: Tree, project?: string): string | undefined {
  const workspace = readJson(tree, 'angular.json') ?? readJson(tree, 'workspace.json');

  if (!workspace) {
    return undefined;
  }

  const projects = (workspace as { projects?: Record<string, unknown> }).projects ?? {};
  const names = project ? [project] : Object.keys(projects);

  for (const name of names) {
    const definition = projects[name] as
      { architect?: Record<string, BuildTarget>; targets?: Record<string, BuildTarget> } | undefined;
    const build = definition?.architect?.['build'] ?? definition?.targets?.['build'];
    const styles = build?.options?.styles ?? [];

    for (const entry of styles) {
      const path = typeof entry === 'string' ? entry : entry?.input;

      if (path && /\.(css|scss|sass|less)$/.test(path) && tree.exists(path)) {
        return path;
      }
    }
  }

  return undefined;
}

interface BuildTarget {
  options?: { styles?: (string | { input?: string })[] };
}

function readJson(tree: Tree, path: string): unknown {
  if (!tree.exists(path)) {
    return undefined;
  }

  try {
    return JSON.parse(tree.read(path)?.toString('utf8') ?? '');
  } catch {
    return undefined;
  }
}

/** Compare against the declaration without its trailing semicolon, so hand-written variants match. */
function stripComment(line: string): string {
  return line.replace(/;$/, '');
}

function manualSnippet(sourceGlobPath: string, skipOverlay?: boolean): string {
  return [
    "@import 'tailwindcss';",
    THEME_IMPORT,
    ...(skipOverlay ? [] : [OVERLAY_IMPORT]),
    `@source '${sourceGlobPath}';`
  ].join('\n');
}
