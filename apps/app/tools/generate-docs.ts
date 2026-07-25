/**
 * Generates the documentation site's data from the library sources.
 *
 * Everything a component page shows — description, selectors, signal inputs, outputs, variant axes,
 * examples and the rendered previews — is extracted here from `libs/**` and the Storybook stories,
 * through the same `@xui/mcp` extraction the MCP server answers from. Nothing about a component is
 * written by hand, so a page cannot drift from the code.
 *
 * Output lands in `apps/app/src/generated` and is committed: it keeps `lint`, `test` and editor
 * type-checking working without a build-order dependency, and makes an API change visible in review.
 *
 * Run with `nx generate-docs app`.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { buildIndex } from '../../../dist/libs/mcp/src/lib/build-index.js';
import type { XuiComponent, XuiExample } from '../../../dist/libs/mcp/src/lib/types.js';

const workspaceRoot = process.cwd();
const outDir = join(workspaceRoot, 'apps', 'app', 'src', 'generated');
const storiesDir = join(workspaceRoot, 'apps', 'ui-storybook', 'stories');

/** Storybook's grouping is the taxonomy users already navigate; the site reuses it verbatim. */
const GROUP_ORDER = [
  'Foundations',
  'Actions',
  'Forms',
  'Date & time',
  'Data display',
  'Navigation',
  'Overlays',
  'Feedback',
  'Layout',
  'Visualisation',
  'Headless primitives'
];

/** Packages with no story of their own still need a home in the sidebar. */
const GROUP_FALLBACK: Record<string, string> = {
  icon: 'Foundations',
  label: 'Forms',
  'date-range-input': 'Date & time',
  'timezone-select': 'Date & time'
};

interface StoryMeta {
  group: string;
  title: string;
  /** Full source of the story file, for pulling icon providers out of. */
  source: string;
  /** `meta.args`, which every story in the file inherits and may override. */
  args: Record<string, unknown>;
  /** Selectors of demo components the story declares for itself; those cannot be previewed. */
  localSelectors: string[];
}

function readStoryMeta(): Map<string, StoryMeta> {
  const map = new Map<string, StoryMeta>();

  if (!existsSync(storiesDir)) {
    return map;
  }

  for (const file of readdirSync(storiesDir).filter(name => name.endsWith('.stories.ts'))) {
    const source = readFileSync(join(storiesDir, file), 'utf8');
    const title = /title:\s*'([^']+)'/.exec(source)?.[1];

    if (!title) {
      continue;
    }

    const separator = title.indexOf('/');
    map.set(basename(file, '.stories.ts'), {
      group: title.slice(0, separator),
      title: title.slice(separator + 1),
      source,
      args: parseArgs(readMetaArgs(source)),
      // A story file often declares its own host component to drive a demo. Its selector resolves
      // inside the story and nowhere else, so a template using one cannot be compiled here.
      localSelectors: [...source.matchAll(/selector:\s*'([a-z][\w-]*)'/g)].map(hit => hit[1])
    });
  }

  return map;
}

// --- examples -> previews ----------------------------------------------------------------------

/**
 * Story templates are template literals, so they can carry `${argsToTemplate(args)}` and friends.
 * `args` is captured alongside the template, so the common case expands into real attributes;
 * anything else (a helper bound to a local const, an interpolated fixture) is dropped, which leaves
 * the component rendering its defaults rather than emitting a template that cannot compile.
 */
function expandTemplate(example: XuiExample, metaArgs: Record<string, unknown>): string {
  const args = { ...metaArgs, ...parseArgs(example.args) };

  const expanded = example.code.replace(/\$\{argsToTemplate\(args(?:,\s*\{[^}]*\})?\)\}/g, match => {
    const exclude = /exclude:\s*\[([^\]]*)\]/.exec(match)?.[1] ?? '';
    const excluded = new Set([...exclude.matchAll(/'([^']+)'/g)].map(hit => hit[1]));

    return serialiseArgs(args, excluded);
  });

  return stripExpressions(expanded)
    .replace(/[ \t]+$/gm, '')
    .trim();
}

/**
 * Removes the `${…}` expressions a story template literal can still hold, matching braces so a
 * nested template literal is taken out whole rather than up to its first `}`.
 *
 * What is left is markup with a hole in it. That is fine when the expression was a helper call, and
 * not fine when it was a `.map()` building elements — `dropsMarkup` reports the difference, and the
 * caller uses it to decide whether the example can be rendered or only shown.
 */
function stripExpressions(template: string): string {
  let output = '';

  for (let index = 0; index < template.length; index += 1) {
    if (template[index] !== '$' || template[index + 1] !== '{') {
      output += template[index];
      continue;
    }

    let depth = 0;
    let cursor = index + 1;

    for (; cursor < template.length; cursor += 1) {
      if (template[cursor] === '{') {
        depth += 1;
      } else if (template[cursor] === '}') {
        depth -= 1;

        if (depth === 0) {
          break;
        }
      }
    }

    index = cursor;
  }

  return output;
}

function dropsMarkup(template: string): boolean {
  return [...template.matchAll(/\$\{/g)].some(hit => {
    const rest = template.slice(hit.index);

    return /<[a-zA-Z]/.test(rest.slice(0, rest.indexOf('}') + 1)) || /`[^`]*</.test(rest.slice(0, 400));
  });
}

/** Reads the brace-balanced object literal that follows `args:` in the meta declaration. */
function readMetaArgs(source: string): string | undefined {
  const head = source.slice(0, source.indexOf('export default'));
  const start = head.search(/\bargs:\s*\{/);

  if (start === -1) {
    return undefined;
  }

  const open = head.indexOf('{', start);
  let depth = 0;

  for (let cursor = open; cursor < head.length; cursor += 1) {
    if (head[cursor] === '{') {
      depth += 1;
    } else if (head[cursor] === '}') {
      depth -= 1;

      if (depth === 0) {
        return head.slice(open, cursor + 1);
      }
    }
  }

  return undefined;
}

function parseArgs(text: string | undefined): Record<string, unknown> {
  if (!text) {
    return {};
  }

  try {
    // Story sources are trusted workspace files, and this only ever runs at build time.
    const value = new Function(`return (${text});`)() as unknown;

    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
  } catch {
    // An arg referencing an imported symbol (an icon, a fixture) cannot be evaluated in isolation.
    return {};
  }
}

function serialiseArgs(args: Record<string, unknown>, excluded: Set<string>): string {
  const parts: string[] = [];

  for (const [name, value] of Object.entries(args)) {
    if (excluded.has(name)) {
      continue;
    }

    if (typeof value === 'string') {
      parts.push(`${name}="${value.replace(/"/g, '&quot;')}"`);
    } else if (typeof value === 'boolean') {
      parts.push(`[${name}]="${value}"`);
    } else if (typeof value === 'number') {
      parts.push(`[${name}]="${value}"`);
    }
    // An object or array cannot be written as an attribute, so it is left off rather than guessed
    // at — the preview then renders the component's own default for that input.
  }

  return parts.join(' ');
}

/**
 * Free identifiers a template binds to, which the generated class has to declare.
 *
 * Locals — `#refs`, `@for` variables, `as` aliases, `$index` and friends — are already in scope, so
 * only what is left has to become a field.
 */
function templateFields(template: string): string[] {
  const expressions: string[] = [];

  for (const hit of template.matchAll(/\{\{([^}]*)\}\}/g)) {
    expressions.push(hit[1]);
  }

  for (const hit of template.matchAll(/(?:\[\(?[\w.$-]+\)?\]|\([\w.$-]+\)|\*[\w-]+)\s*=\s*"([^"]*)"/g)) {
    expressions.push(hit[1]);
  }

  for (const hit of template.matchAll(/@(?:if|else if|for|switch|case)\s*\(([^)]*)\)/g)) {
    expressions.push(hit[1]);
  }

  const locals = new Set<string>(RESERVED);

  for (const hit of template.matchAll(/#([A-Za-z_]\w*)/g)) {
    locals.add(hit[1]);
  }

  for (const source of [template, ...expressions]) {
    for (const hit of source.matchAll(/@for\s*\(\s*([A-Za-z_]\w*)\s+of\b/g)) {
      locals.add(hit[1]);
    }
    for (const hit of source.matchAll(/\bas\s+([A-Za-z_]\w*)/g)) {
      locals.add(hit[1]);
    }
    for (const hit of source.matchAll(/\blet\s+([A-Za-z_]\w*)/g)) {
      locals.add(hit[1]);
    }
  }

  const fields = new Set<string>();

  for (const expression of expressions) {
    // Strings first: a literal can hold anything that looks like an identifier.
    const stripped = expression.replace(/'[^']*'|"[^"]*"/g, ' ').replace(/\|\s*[A-Za-z_]\w*/g, ' ');

    for (const hit of stripped.matchAll(/(^|[^.\w$])([A-Za-z_]\w*)/g)) {
      const name = hit[2];

      if (!locals.has(name) && !RESERVED.has(name)) {
        fields.add(name);
      }
    }
  }

  return [...fields].map(name => `  protected ${name}: any;`);
}

const RESERVED = new Set([
  'true',
  'false',
  'null',
  'undefined',
  'this',
  'of',
  'as',
  'let',
  'track',
  'typeof',
  '$event',
  '$index',
  '$count',
  '$first',
  '$last',
  '$even',
  '$odd',
  '$implicit',
  '$any'
]);

/**
 * Whether an example can be compiled into a preview, or only shown as source.
 *
 * Three things rule one out: markup that was built by an expression and is therefore no longer in
 * the template, a component the story declared for itself, and an `ng-template` context variable,
 * which the template type-checker types as `unknown` with no way to widen it from here.
 */
function canPreview(template: string, original: string, localSelectors: string[]): boolean {
  if (template.length === 0 || template.includes('${') || dropsMarkup(original)) {
    return false;
  }

  if (/\blet-[\w-]+/.test(template)) {
    return false;
  }

  return !localSelectors.some(selector => new RegExp(`<${selector}[\\s/>]`).test(template));
}

interface PreviewImports {
  /** Symbols for the generated component's `imports`. */
  declarables: string[];
  /** Import statements the generated file needs. */
  statements: string[];
  /** `providers` entries — currently only the icon set a story registers. */
  providers: string[];
}

function previewImports(component: XuiComponent, templates: string[], story: StoryMeta | undefined): PreviewImports {
  const declarables = new Set<string>();
  const statements = new Set<string>();
  const providers: string[] = [];

  // Every `@xui/*` barrel the story imports. The barrel is the supported entry point, so taking it
  // wholesale is also what a consumer would write.
  for (const statement of component.exampleImports) {
    const bindings = /\{([^}]*)\}/.exec(statement)?.[1] ?? '';
    const barrels = [...bindings.matchAll(/\b(\w+Imports)\b/g)].map(hit => hit[1]);
    const from = /from\s*'([^']+)'/.exec(statement)?.[1];

    if (barrels.length > 0 && from) {
      barrels.forEach(barrel => declarables.add(barrel));
      statements.add(`import { ${barrels.join(', ')} } from '${from}';`);
    }
  }

  const templateText = templates.join('\n');

  if (/<ng-icon\b/.test(templateText)) {
    declarables.add('NgIcon');

    // Icons resolve through a provider, so a preview without the story's icon set renders blanks.
    const icons = story ? iconProvider(story.source) : undefined;

    if (icons) {
      providers.push(icons.expression);
      statements.add(`import { NgIcon, provideIcons } from '@ng-icons/core';`);
      icons.imports.forEach(line => statements.add(line));
    } else {
      statements.add(`import { NgIcon } from '@ng-icons/core';`);
    }
  }

  if (/\bngModel\b/.test(templateText)) {
    declarables.add('FormsModule');
    statements.add(`import { FormsModule } from '@angular/forms';`);
  }

  if (/\bformControl\b|\bformGroup\b|\bformControlName\b/.test(templateText)) {
    declarables.add('ReactiveFormsModule');
    statements.add(`import { ReactiveFormsModule } from '@angular/forms';`);
  }

  return { declarables: [...declarables], statements: [...statements], providers };
}

/** Lifts a story's `provideIcons({ … })` call and the `@ng-icons/*` imports feeding it. */
function iconProvider(source: string): { expression: string; imports: string[] } | undefined {
  const call = /provideIcons\(\{([\s\S]*?)\}\)/.exec(source);

  if (!call) {
    return undefined;
  }

  const names = [...call[1].matchAll(/([A-Za-z][A-Za-z0-9]*)/g)].map(hit => hit[1]);

  if (names.length === 0) {
    return undefined;
  }

  const imports = [...source.matchAll(/import\s*\{([^}]*)\}\s*from\s*'(@ng-icons\/[^']+)';/g)]
    .filter(hit => hit[2] !== '@ng-icons/core')
    .map(hit => `import {${hit[1]}} from '${hit[2]}';`);

  return { expression: `provideIcons({ ${[...new Set(names)].join(', ')} })`, imports };
}

// --- emit ----------------------------------------------------------------------------------------

function escapeTemplate(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function sentenceCase(name: string): string {
  const spaced = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ');

  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

function titleCase(name: string): string {
  const spaced = name.replace(/[-_]/g, ' ');

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function kebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase();
}

function json(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

interface Emitted {
  summary: {
    name: string;
    slug: string;
    title: string;
    package: string;
    kind: 'ui' | 'core';
    group: string;
    description?: string;
    hasPreview: boolean;
  };
  previews: number;
  examples: number;
}

function emitComponent(component: XuiComponent, story: StoryMeta | undefined): Emitted {
  const group =
    component.kind === 'core' ? 'Headless primitives' : (story?.group ?? GROUP_FALLBACK[component.name] ?? 'Other');
  const title = component.kind === 'core' ? titleCase(component.name) : (story?.title ?? titleCase(component.name));
  // Four headless entrypoints share a folder name with a styled package, so the route needs more
  // than the folder name to stay unique.
  const slug = component.kind === 'core' ? `core-${component.name}` : component.name;

  const examples = component.examples
    .map(example => ({ ...example, template: expandTemplate(example, story?.args ?? {}) }))
    .filter(example => example.template.length > 0);

  const localSelectors = story?.localSelectors ?? [];
  const previewable = examples.filter(example => canPreview(example.template, example.code, localSelectors));
  const perExample = previewable.map(example => ({
    example,
    ...previewImports(component, [example.template], story)
  }));
  const statements = [...new Set(perExample.flatMap(entry => entry.statements))];

  const lines: string[] = [
    '// Generated by apps/app/tools/generate-docs.ts. Do not edit.',
    // A package with no renderable example emits no preview component, so it must not import the
    // decorator either.
    ...(perExample.length > 0 ? [`import { ChangeDetectionStrategy, Component } from '@angular/core';`] : []),
    `import type { ComponentDoc } from '../../app/core/docs.model';`,
    ...statements,
    ''
  ];

  for (const { example, declarables, providers } of perExample) {
    lines.push(
      '@Component({',
      `  selector: 'docs-preview-${kebab(component.name)}-${kebab(example.name)}',`,
      '  changeDetection: ChangeDetectionStrategy.OnPush,',
      `  imports: [${declarables.join(', ')}],`,
      ...(providers.length > 0 ? [`  providers: [${providers.join(', ')}],`] : []),
      '  template: `',
      escapeTemplate(example.template),
      '`',
      '})',
      // A story binds to properties declared on its own host component. Those are re-declared here
      // so the template compiles; they start undefined, so the preview renders the component's own
      // defaults rather than the story's fixture.
      `export class Preview${example.name} {`,
      ...templateFields(example.template),
      '}',
      ''
    );
  }

  lines.push(
    'export const doc: ComponentDoc = {',
    `  name: ${json(component.name)},`,
    `  slug: ${json(slug)},`,
    `  title: ${json(title)},`,
    `  package: ${json(component.package)},`,
    `  kind: ${json(component.kind)},`,
    `  group: ${json(group)},`,
    `  description: ${json(component.description)},`,
    `  importsConst: ${json(component.importsConst)},`,
    `  exports: ${json(component.exports)},`,
    `  peerDependencies: ${json(component.peerDependencies)},`,
    `  sourcePath: ${json(component.path)},`,
    `  symbols: ${json(
      component.symbols.map(symbol => ({
        kind: symbol.kind,
        name: symbol.name,
        selector: symbol.selector,
        exportAs: symbol.exportAs,
        docs: symbol.docs,
        inputs: symbol.inputs,
        outputs: symbol.outputs,
        variants: symbol.variants,
        methods: symbol.methods
      }))
    )},`,
    '  examples: [',
    ...examples.map(example =>
      [
        '    {',
        `      name: ${json(example.name)},`,
        `      title: ${json(sentenceCase(example.name))},`,
        `      code: \`${escapeTemplate(example.template)}\`,`,
        ...(canPreview(example.template, example.code, localSelectors)
          ? [`      preview: Preview${example.name}`]
          : []),
        '    },'
      ].join('\n')
    ),
    '  ]',
    '};',
    ''
  );

  writeFileSync(join(outDir, 'components', `${slug}.ts`), lines.join('\n'), 'utf8');

  return {
    summary: {
      name: component.name,
      slug,
      title,
      package: component.package,
      kind: component.kind,
      group,
      description: component.description,
      hasPreview: previewable.length > 0
    },
    previews: previewable.length,
    examples: examples.length
  };
}

// --- main ----------------------------------------------------------------------------------------

const index = await buildIndex(workspaceRoot);
const stories = readStoryMeta();

rmSync(outDir, { recursive: true, force: true });
mkdirSync(join(outDir, 'components'), { recursive: true });

const emitted = index.components
  .map(component => emitComponent(component, stories.get(component.name)))
  .sort((a, b) => a.summary.title.localeCompare(b.summary.title));

const groups = GROUP_ORDER.filter(group => emitted.some(entry => entry.summary.group === group));
const ungrouped = [...new Set(emitted.map(entry => entry.summary.group))].filter(group => !groups.includes(group));

writeFileSync(
  join(outDir, 'manifest.ts'),
  [
    '// Generated by apps/app/tools/generate-docs.ts. Do not edit.',
    `import type { ComponentSummary, DocsToken } from '../app/core/docs.model';`,
    '',
    `export const VERSION = ${json(index.version)};`,
    '',
    `export const GROUPS: string[] = ${json([...groups, ...ungrouped])};`,
    '',
    `export const COMPONENTS: ComponentSummary[] = ${json(emitted.map(entry => entry.summary))};`,
    '',
    `export const TOKENS: DocsToken[] = ${json(index.tokens)};`,
    ''
  ].join('\n'),
  'utf8'
);

writeFileSync(
  join(outDir, 'loaders.ts'),
  [
    '// Generated by apps/app/tools/generate-docs.ts. Do not edit.',
    `import type { ComponentDoc } from '../app/core/docs.model';`,
    '',
    '/** One lazy chunk per component, so a page never ships the other 102. */',
    'export const LOADERS: Record<string, () => Promise<{ doc: ComponentDoc }>> = {',
    ...emitted.map(
      entry => `  ${JSON.stringify(entry.summary.slug)}: () => import('./components/${entry.summary.slug}'),`
    ),
    '};',
    ''
  ].join('\n'),
  'utf8'
);

const previews = emitted.reduce((total, entry) => total + entry.previews, 0);
const examples = emitted.reduce((total, entry) => total + entry.examples, 0);
const withoutPreview = emitted.filter(entry => entry.previews === 0).map(entry => entry.summary.slug);

console.log(`${emitted.length} components, ${examples} examples, ${previews} rendered previews`);

if (withoutPreview.length > 0) {
  console.log(`code only (no preview): ${withoutPreview.join(', ')}`);
}
