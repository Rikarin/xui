/**
 * Shape of the index the MCP server answers from.
 *
 * The index is extracted from the workspace sources (`libs/ui/<name>/xui`,
 * `libs/core/styles/theme.css`, `apps/ui-storybook/stories`, `apps/app/docs`) rather than scraped
 * from the docs site: only a handful of the 90 packages have a docs page, while every one of them
 * has a decorated class whose signal inputs and CVA variants are the actual API.
 */

/** A signal input (`input()`, `input.required()`) or two-way `model()`. */
export interface XuiInput {
  name: string;
  /** Declared type argument, or the type inferred from the default value. */
  type: string;
  /** Source text of the default value, absent for required inputs. */
  default?: string;
  required: boolean;
  /** `transform` from the input options, e.g. `booleanAttribute`. */
  transform?: string;
  /** Two-way: declared with `model()` rather than `input()`. */
  model?: boolean;
  docs?: string;
}

export interface XuiOutput {
  name: string;
  type: string;
  docs?: string;
}

/** One axis of a `cva()` variant map. */
export interface XuiVariantAxis {
  name: string;
  options: string[];
  default?: string;
}

export interface XuiMethod {
  name: string;
  signature: string;
  docs?: string;
}

/** A decorated class - the unit consumers actually put in a template. */
export interface XuiSymbol {
  kind: 'component' | 'directive';
  name: string;
  selector?: string;
  exportAs?: string;
  /** Workspace-relative file the class is declared in. */
  file: string;
  docs?: string;
  inputs: XuiInput[];
  outputs: XuiOutput[];
  variants: XuiVariantAxis[];
  methods: XuiMethod[];
  /** Host bindings/attributes declared in the decorator's `host` object. */
  host: Record<string, string>;
}

export interface XuiExportedType {
  name: string;
  kind: 'type' | 'interface' | 'const' | 'function' | 'enum' | 'class';
  /** Declaration text, truncated for long bodies. */
  text: string;
  docs?: string;
}

export interface XuiExample {
  /** Storybook story name, e.g. `Default`, `Colors`. */
  name: string;
  /** The story's inline Angular template. */
  code: string;
  /** Source text of the story's `args`, when it sets any. */
  args?: string;
}

export interface XuiComponent {
  /** Package folder name, e.g. `button` - the handle every tool takes. */
  name: string;
  /** `ui` for a styled `@xui/<name>` package, `core` for a `@xui/core/<name>` headless entrypoint. */
  kind: 'ui' | 'core';
  /** npm package name, e.g. `@xui/button`. */
  package: string;
  version: string;
  description?: string;
  /** Workspace-relative package root. */
  path: string;
  peerDependencies: Record<string, string>;
  /** Barrel const of every declarable, e.g. `XuiButtonImports`. */
  importsConst?: string;
  /** Everything the package's `index.ts` re-exports. */
  exports: string[];
  /** `injectXui<Name>Config` / `provideXui<Name>Config` style APIs. */
  configApi: string[];
  symbols: XuiSymbol[];
  types: XuiExportedType[];
  examples: XuiExample[];
  /** Import statements the Storybook story uses, so examples are copy-pastable. */
  exampleImports: string[];
  storyPath?: string;
  readme?: string;
}

export type XuiTokenGroup =
  'surfaces' | 'text' | 'borders' | 'intents' | 'state' | 'elevation' | 'motion' | 'typography' | 'other';

export interface XuiToken {
  /** Custom property name without the leading dashes, e.g. `primary-subtle`. */
  name: string;
  group: XuiTokenGroup;
  /** Value in the light theme. */
  light?: string;
  /** Value in the dark theme. */
  dark?: string;
  /** Value declared for every theme scope (the derived intent ramps). */
  derived?: string;
  /** Tailwind utility namespace the token is exposed through, e.g. `color`. */
  utility?: string;
}

export interface XuiDoc {
  slug: string;
  title: string;
  path: string;
  content: string;
}

export interface XuiIndex {
  /** Version of `@xui/core`, which every package pins. */
  version: string;
  generatedAt: string;
  /** `workspace` when extracted live, `bundled` when read from the shipped JSON. */
  source: 'workspace' | 'bundled';
  workspaceRoot?: string;
  components: XuiComponent[];
  tokens: XuiToken[];
  docs: XuiDoc[];
}
