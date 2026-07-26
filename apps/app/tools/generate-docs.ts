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

/** Every package's manifest repeats the workspace blurb, which says nothing about the component. */
const BOILERPLATE_DESCRIPTION = 'Modern Angular 22 UI Library based on TailwindCSS';

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
  /** The JSDoc above `const meta` — the one place each component has real prose. */
  description?: string;
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
      description: readMetaDoc(source),
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

  const expanded = example.code.replace(
    /\$\{argsToTemplate\((args|\{[^}]*\})(?:,\s*\{[^}]*\})?\)\}/g,
    (match, subject) => {
      const exclude = /exclude:\s*\[([^\]]*)\]/.exec(match)?.[1] ?? '';
      const excluded = new Set([...exclude.matchAll(/'([^']+)'/g)].map(hit => hit[1]));

      return serialiseArgs(overriddenArgs(subject, args), excluded);
    }
  );

  return stripExpressions(expanded)
    .replace(/[ \t]+$/gm, '')
    .trim();
}

/**
 * What an `argsToTemplate` call was actually handed: `args`, or `{ ...args, orientation: 'vertical' }`
 * — how a story writes one element differently from the rest without a second set of args.
 *
 * Dropped, the override goes with it: the divider's vertical example rendered three horizontal rules
 * in a flex row, each of them a zero-width flex item, and the page showed nothing at all.
 */
function overriddenArgs(subject: string, args: Record<string, unknown>): Record<string, unknown> {
  if (subject === 'args') {
    return args;
  }

  try {
    // Story sources are trusted workspace files, and this only ever runs at build time.
    const value = new Function('args', `return (${subject});`)(args) as unknown;

    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : args;
  } catch {
    // An override built from something the story imports cannot be evaluated in isolation. The
    // arguments it spread over are still right, so they stand.
    return args;
  }
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

/**
 * The JSDoc block immediately above the story file's `meta`, unwrapped into a paragraph.
 *
 * Every package's `package.json` carries the same generated one-liner, so the story doc is the only
 * description that actually says what the component is.
 */
function readMetaDoc(source: string): string | undefined {
  const block = /\/\*\*([\s\S]*?)\*\/\s*(?:const meta|export default)/.exec(source)?.[1];

  return block ? firstParagraph(block.replace(/^\s*\*\s?/gm, '')) : undefined;
}

/**
 * The lead paragraph of a doc comment.
 *
 * A comment usually opens with a sentence about what the thing is and then goes on to a code fence
 * or a second point. Only the opening belongs under a page heading; the rest is on the page already.
 */
function firstParagraph(text: string): string | undefined {
  const lines: string[] = [];

  for (const line of text.split('\n')) {
    const trimmed = line.trim();

    if (trimmed.startsWith('```') || trimmed.startsWith('@')) {
      break;
    }

    if (trimmed === '') {
      if (lines.length > 0) {
        break;
      }

      continue;
    }

    lines.push(trimmed);
  }

  const paragraph = lines.join(' ').replace(/`/g, '').replace(/\s+/g, ' ').trim();

  return paragraph.length > 0 ? paragraph : undefined;
}

/**
 * The `props` object a story hands its template, verbatim.
 *
 * This is what makes a preview faithful rather than approximate: a story that binds `[nodes]="nodes"`
 * needs the actual nodes, and a story that reads `open()` needs a real signal. Copying the
 * expression across — together with the story's own imports — reproduces both, where inferring a
 * shape from the template can only produce something that renders empty or throws.
 */
function readStoryProps(source: string, exportName: string): string | undefined {
  const declaration = source.indexOf(`export const ${exportName}`);

  if (declaration === -1) {
    return undefined;
  }

  const body = readBalanced(source, source.indexOf('{', declaration));

  if (!body) {
    return undefined;
  }

  const props = /\bprops:\s*\{/.exec(body);

  return props ? readBalanced(body, body.indexOf('{', props.index)) : undefined;
}

/** The `{ … }` starting at `open`, brace-balanced and skipping string and template literals. */
function readBalanced(text: string, open: number): string | undefined {
  if (open === -1) {
    return undefined;
  }

  let depth = 0;

  for (let cursor = open; cursor < text.length; cursor += 1) {
    const character = text[cursor];

    if (character === "'" || character === '"' || character === '`') {
      cursor = skipString(text, cursor);
      continue;
    }

    if (character === '{') {
      depth += 1;
    } else if (character === '}') {
      depth -= 1;

      if (depth === 0) {
        return text.slice(open, cursor + 1);
      }
    }
  }

  return undefined;
}

function skipString(text: string, start: number): number {
  const quote = text[start];

  for (let cursor = start + 1; cursor < text.length; cursor += 1) {
    if (text[cursor] === '\\') {
      cursor += 1;
      continue;
    }

    if (text[cursor] === quote) {
      return cursor;
    }
  }

  return text.length;
}

/**
 * Rewrites references to sibling props as `this.<name>`.
 *
 * In a story they are all properties of one object, so `toggle: () => open.set(…)` resolves. As class
 * fields they do not — an initialiser that names `open` would reach for a global of that name, which
 * for `open` is `window.open` and compiles into something baffling.
 */
function qualifySiblings(value: string, siblings: Set<string>, self: string): string {
  const parameters = new Set<string>();

  for (const hit of value.matchAll(/([A-Za-z_]\w*)\s*=>/g)) {
    parameters.add(hit[1]);
  }

  for (const hit of value.matchAll(/\(([^)]*)\)\s*=>/g)) {
    hit[1]
      .split(',')
      .map(parameter => /^\s*([A-Za-z_]\w*)/.exec(parameter)?.[1])
      .forEach(name => name && parameters.add(name));
  }

  let output = value;

  for (const name of siblings) {
    if (name === self || parameters.has(name)) {
      continue;
    }

    output = output.replace(new RegExp(`(?<![.\\w$'"])${name}\\b`, 'g'), `this.${name}`);
  }

  return output;
}

/** Splits an object literal's top-level `key: value` entries. */
function splitEntries(objectText: string): { key: string; value: string }[] {
  const inner = objectText.slice(1, -1);
  const entries: { key: string; value: string }[] = [];
  let depth = 0;
  let start = 0;

  const push = (end: number) => {
    const entry = inner.slice(start, end).trim();
    const separator = entry.indexOf(':');

    if (separator > 0) {
      entries.push({ key: entry.slice(0, separator).trim(), value: entry.slice(separator + 1).trim() });
    }
  };

  for (let cursor = 0; cursor < inner.length; cursor += 1) {
    const character = inner[cursor];

    if (character === "'" || character === '"' || character === '`') {
      cursor = skipString(inner, cursor);
      continue;
    }

    if ('{[('.includes(character)) {
      depth += 1;
    } else if ('}])'.includes(character)) {
      depth -= 1;
    } else if (character === ',' && depth === 0) {
      push(cursor);
      start = cursor + 1;
    }
  }

  push(inner.length);

  return entries.filter(entry => /^[A-Za-z_]\w*$/.test(entry.key) && entry.value.length > 0);
}

/** A one-line doc comment, with its markdown flattened for rendering as text. */
function plainDocs(text: string | undefined): string | undefined {
  const cleaned = text?.replace(/`/g, '').replace(/\s+/g, ' ').trim();

  return cleaned && cleaned.length > 0 ? cleaned : undefined;
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
function templateFields(template: string, props: string | undefined, args: Record<string, unknown> = {}): string[] {
  const entries = props ? splitEntries(props) : [];
  const declared = new Set(entries.map(entry => entry.key));

  // A story's `props` does not always cover everything its template names — a handler written
  // inline, a value the decorator supplies. Whatever is left still has to be declared.
  const inferred = inferredFields(template, args).filter(field => !declared.has(fieldName(field)));
  const siblings = new Set([...declared, ...inferred.map(fieldName)]);

  // Typed `any`, and not `readonly`: a story's fixtures were written against its own template, where
  // a loop variable is a `string` and the input wants a union. Keeping the initialiser verbatim
  // preserves what the preview renders; widening the declared type keeps the docs building as the
  // library's types tighten, which is not something a generated fixture should be able to break.
  return [
    ...entries.map(entry => `  protected ${entry.key}: any = ${qualifySiblings(entry.value, siblings, entry.key)};`),
    ...inferred
  ];
}

function fieldName(field: string): string {
  return /protected (?:readonly )?(\w+)/.exec(field)?.[1] ?? '';
}

function inferredFields(template: string, args: Record<string, unknown> = {}): string[] {
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
    // `items.map(item => item.name)` — `item` belongs to the lambda, not to the component.
    for (const hit of source.matchAll(/([A-Za-z_]\w*)\s*=>/g)) {
      locals.add(hit[1]);
    }
    for (const hit of source.matchAll(/\(([^)]*)\)\s*=>/g)) {
      hit[1]
        .split(',')
        .map(parameter => /^\s*([A-Za-z_]\w*)/.exec(parameter)?.[1])
        .forEach(name => name && locals.add(name));
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

  // A story hands its template real values through `props`, and the shape matters: a plain field
  // where the template expects a signal compiles and then throws "is not a function" on the first
  // render. How the name is used says which it is.
  //
  // The value comes from the story's `args` where there is one. `render: ({...args}) => ({props:
  // args, template: '<x [title]="title" />'})` is the second way a story feeds its template — the
  // first being `${argsToTemplate(args)}` — and left undeclared the preview renders a component
  // with none of its arguments, which for a non-ideal state is a box with no title in it.
  return [...fields].map(name => {
    const value = name in args ? json(args[name]) : 'undefined';

    if (new RegExp(`\\b${name}\\s*\\(\\s*\\)|\\b${name}\\.(set|update)\\b`).test(template)) {
      return `  protected readonly ${name} = signal<any>(${value});`;
    }

    if (new RegExp(`\\b${name}\\s*\\(\\s*[^)\\s]`).test(template)) {
      // Called with arguments — an event handler. A no-op keeps the preview interactive-ish rather
      // than throwing the moment someone clicks it.
      return `  protected readonly ${name} = (..._args: any[]): void => undefined;`;
    }

    return name in args ? `  protected ${name}: any = ${value};` : `  protected ${name}: any;`;
  });
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
 * Four things rule one out: markup that was built by an expression and is therefore no longer in
 * the template, a component the story declared for itself, an `ng-template` context variable, which
 * the template type-checker types as `unknown` with no way to widen it from here — and a template
 * lifted out of a story's own host component.
 *
 * That last one is the markup a reader wants and a preview cannot have: the bindings name fields of
 * a class in the story file, which a generated preview can only stub. A stubbed `[items]` is
 * `undefined` where the component expects a list, and the demo throws the moment it is opened.
 */
function canPreview(example: XuiExample, template: string, localSelectors: string[]): boolean {
  const original = example.code;

  if (example.hosted || template.length === 0 || template.includes('${') || dropsMarkup(original)) {
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

    // `<ng-icon xui>` needs the directive that reads `size` and `color`. A story imports `XuiIcon`
    // by name rather than through the barrel, and only barrels are collected above — so without
    // this the preview renders an icon at the default size, silently unlike the story.
    if (/<ng-icon[^>]*\bxui\b/.test(templateText)) {
      declarables.add('XuiIconImports');
      statements.add(`import { XuiIconImports } from '@xui/icon';`);
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

/**
 * The story's own imports, minus Storybook's.
 *
 * A copied `props` expression only compiles if the symbols it names come with it.
 */
function storyImports(source: string | undefined): string[] {
  if (!source) {
    return [];
  }

  return [...source.matchAll(/^import\s+(?:type\s+)?\{[^}]*\}\s*from\s*'([^']+)';$/gm)]
    .filter(hit => !hit[1].startsWith('@storybook/'))
    .map(hit => hit[0]);
}

/**
 * Top-level declarations from the story file that the copied `props` depend on.
 *
 * Stories keep their fixtures in module-level consts — `const TRAIL = [...]`, `const OPTIONS = [...]`
 * — so copying the props alone leaves dangling names. Whatever they reach is copied with them,
 * following references one hop at a time until nothing new is named.
 */
function storyFixtures(source: string | undefined, referencedIn: string[]): string[] {
  if (!source) {
    return [];
  }

  const declarations = new Map<string, string>();
  const pattern = /^(?:export\s+)?(?:const|let|function|class|type|interface)\s+([A-Za-z_]\w*)/gm;

  for (const hit of [...source.matchAll(pattern)]) {
    const text = readDeclaration(source, hit.index ?? 0);

    // `type Story = StoryObj<…>` is Storybook plumbing, not a fixture, and its types do not exist here.
    if (text && !/\b(StoryObj|Meta|Story)\b/.test(text)) {
      declarations.set(hit[1], text.replace(/^export\s+/, ''));
    }
  }

  const wanted = new Set<string>();
  let frontier = referencedIn.join('\n');

  for (let hop = 0; hop < 5; hop += 1) {
    const found = [...declarations.keys()].filter(
      name => !wanted.has(name) && new RegExp(`\\b${name}\\b`).test(frontier)
    );

    if (found.length === 0) {
      break;
    }

    found.forEach(name => wanted.add(name));
    frontier = found.map(name => declarations.get(name) ?? '').join('\n');
  }

  return [...wanted].map(name => declarations.get(name) ?? '');
}

/** A whole `const`/`function`/`type` declaration, from its keyword to the end of its initialiser. */
function readDeclaration(source: string, start: number): string | undefined {
  let depth = 0;

  for (let cursor = start; cursor < source.length; cursor += 1) {
    const character = source[cursor];

    if (character === "'" || character === '"' || character === '`') {
      cursor = skipString(source, cursor);
      continue;
    }

    if ('{[('.includes(character)) {
      depth += 1;
    } else if ('}])'.includes(character)) {
      depth -= 1;

      // A function or class body ends at its closing brace rather than a semicolon.
      if (
        depth === 0 &&
        character === '}' &&
        !/^(?:export\s+)?(?:const|let|type)\b/.test(source.slice(start, cursor))
      ) {
        return source.slice(start, cursor + 1);
      }
    } else if (character === ';' && depth === 0) {
      return source.slice(start, cursor + 1);
    }
  }

  return undefined;
}

/**
 * Collapses import statements from several sources — the barrels a template needs, the story's own —
 * into one statement per module, so a generated file never imports the same symbol twice.
 */
function mergeImports(statements: string[]): string[] {
  const modules = new Map<string, { names: Set<string>; typeOnly: boolean }>();

  for (const statement of statements) {
    const parsed = /^import\s+(type\s+)?\{([^}]*)\}\s*from\s*'([^']+)';$/.exec(statement.trim());

    if (!parsed) {
      continue;
    }

    const [, typeKeyword, bindings, module] = parsed;
    const entry = modules.get(module) ?? { names: new Set<string>(), typeOnly: true };

    bindings
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .forEach(name => entry.names.add(name.replace(/^type\s+/, '')));

    entry.typeOnly = entry.typeOnly && Boolean(typeKeyword);
    modules.set(module, entry);
  }

  return [...modules].map(
    ([module, entry]) =>
      `import ${entry.typeOnly ? 'type ' : ''}{ ${[...entry.names].sort().join(', ')} } from '${module}';`
  );
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

/** Stories whose template could not be read, reported once the run finishes. */
const unreadableTemplates: string[] = [];

function emitComponent(component: XuiComponent, story: StoryMeta | undefined): Emitted {
  const group =
    component.kind === 'core' ? 'Headless primitives' : (story?.group ?? GROUP_FALLBACK[component.name] ?? 'Other');
  const title = component.kind === 'core' ? titleCase(component.name) : (story?.title ?? titleCase(component.name));
  // Four headless entrypoints share a folder name with a styled package, so the route needs more
  // than the folder name to stay unique.
  const slug = component.kind === 'core' ? `core-${component.name}` : component.name;

  const description = [story?.description, component.symbols.find(symbol => symbol.docs)?.docs, component.description]
    .map(text => (text ? firstParagraph(text) : undefined))
    .find(text => text && text !== BOILERPLATE_DESCRIPTION);

  const examples = component.examples
    .map(example => ({
      ...example,
      template: expandTemplate(example, story?.args ?? {}),
      props: story ? readStoryProps(story.source, example.name) : undefined,
      // What the story would have been rendered with: the file's args, overridden by this story's.
      argValues: { ...(story?.args ?? {}), ...parseArgs(example.args) }
    }))
    // A story whose `template` is anything but a literal — a call to a helper, say — parses to
    // nothing, and the example would then disappear from the docs with no sign it ever existed.
    // Always a story bug, so name it rather than dropping it quietly.
    .filter(example => {
      if (example.template.length === 0) {
        unreadableTemplates.push(`${slug}:${example.name}`);

        return false;
      }

      // An example whose elements were built by a `.map()` in the story keeps its wrapper and loses
      // its contents. Showing that as "the code" would be worse than not showing the example.
      return !dropsMarkup(example.code);
    });

  const localSelectors = story?.localSelectors ?? [];
  const previewable = examples.filter(example => canPreview(example, example.template, localSelectors));
  const perExample = previewable.map(example => ({
    example,
    ...previewImports(component, [example.template], story)
  }));
  const statements = [...new Set(perExample.flatMap(entry => entry.statements))];

  const fieldsFor = (entry: (typeof perExample)[number]) =>
    templateFields(entry.example.template, entry.example.props, entry.example.argValues);
  const needsSignal = perExample.some(entry => fieldsFor(entry).some(field => field.includes('signal<any>')));

  const lines: string[] = [
    '// Generated by apps/app/tools/generate-docs.ts. Do not edit.',
    ...mergeImports([
      // A package with no renderable example emits no preview component, so it must not import the
      // decorator either.
      ...(perExample.length > 0
        ? [`import { ChangeDetectionStrategy, Component${needsSignal ? ', signal' : ''} } from '@angular/core';`]
        : []),
      ...(perExample.some(entry => entry.example.props) ? storyImports(story?.source) : []),
      `import type { ComponentDoc } from '../../app/core/docs.model';`,
      ...statements
    ]),
    ''
  ];

  const fields = perExample.flatMap(entry => fieldsFor(entry));
  const fixtures = storyFixtures(story?.source, fields);

  if (fixtures.length > 0) {
    lines.push(...fixtures, '');
  }

  for (const { example, declarables, providers } of perExample) {
    lines.push(
      '@Component({',
      `  selector: 'docs-preview-${kebab(component.name)}-${kebab(example.name)}',`,
      '  changeDetection: ChangeDetectionStrategy.OnPush,',
      `  imports: [${declarables.join(', ')}],`,
      ...(providers.length > 0 ? [`  providers: [${providers.join(', ')}],`] : []),
      // The outlet renders this element into the preview frame, where an unknown element is inline
      // by default. A story sizing anything in percentages — `w-full` on a progress bar — then
      // resolves it against a box that has no width of its own.
      `  host: { class: 'block' },`,
      '  template: `',
      escapeTemplate(example.template),
      '`',
      '})',
      // A story binds to properties it declares for itself. Those are re-declared here so the
      // template compiles, carrying the story's `args` where it had them — without which the
      // preview renders a component that was handed none of its arguments.
      `export class Preview${example.name} {`,
      ...templateFields(example.template, example.props, example.argValues),
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
    `  description: ${json(description)},`,
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
        // Doc comments are rendered as plain text in the tables, so the markdown they carry — a code
        // fence, a backtick, a hard-wrapped line — has to come off here rather than show through.
        docs: symbol.docs ? firstParagraph(symbol.docs) : undefined,
        inputs: symbol.inputs.map(field => ({ ...field, docs: plainDocs(field.docs) })),
        outputs: symbol.outputs.map(event => ({ ...event, docs: plainDocs(event.docs) })),
        variants: symbol.variants,
        methods: symbol.methods.map(method => ({ ...method, docs: plainDocs(method.docs) }))
      }))
    )},`,
    '  examples: [',
    ...examples.map(example =>
      [
        '    {',
        `      name: ${json(example.name)},`,
        `      title: ${json(sentenceCase(example.name))},`,
        `      code: \`${escapeTemplate(example.template)}\`,`,
        ...(canPreview(example, example.template, localSelectors) ? [`      preview: Preview${example.name}`] : []),
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
      description,
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

if (unreadableTemplates.length > 0) {
  console.warn(`unreadable template, example dropped: ${unreadableTemplates.join(', ')}`);
}
