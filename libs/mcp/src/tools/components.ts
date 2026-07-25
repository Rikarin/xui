import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { findComponent, getIndex, searchComponents, suggestComponents } from '../lib/index-store.js';
import type { XuiComponent } from '../lib/types.js';
import { describeSymbol, json, summarize, usageHint } from './respond.js';

export function registerComponentTools(server: McpServer): void {
  server.registerTool(
    'xui_components_list',
    {
      title: 'List xUI components',
      description:
        'List every xUI package with its npm name, selectors and imports barrel. `kind: "ui"` are the ' +
        'styled `@xui/<name>` packages you put in templates, `kind: "core"` are the headless ' +
        '`@xui/core/<name>` entrypoints (overlay, forms, a11y, query, date-time) they are built on. ' +
        'Start here, then call xui_components_get for the API of a specific one.',
      inputSchema: {
        kind: z
          .enum(['ui', 'core', 'all'])
          .default('ui')
          .describe('Which layer to list. Defaults to the styled `@xui/*` packages.')
      }
    },
    async args => {
      const index = await getIndex();
      const kind = args.kind ?? 'ui';
      const components = index.components.filter(component => kind === 'all' || component.kind === kind);

      return json({
        version: index.version,
        source: index.source,
        count: components.length,
        components: components.map(summarize),
        next: 'Call xui_components_get with a name for inputs, outputs, variant axes and examples.'
      });
    }
  );

  server.registerTool(
    'xui_components_search',
    {
      title: 'Search xUI components',
      description:
        'Find the component that covers a need ("date range", "toast", "virtual grid", "tree") by ' +
        'ranking package names, selectors, symbol names, input names and doc comments. Use this ' +
        'before writing custom markup - the library has 90 packages and the name is often not obvious.',
      inputSchema: {
        query: z.string().min(1).describe('Free text, e.g. "multi select" or "resizable panel".'),
        limit: z.number().int().min(1).max(50).default(10).describe('Maximum matches to return.')
      }
    },
    async args => {
      const index = await getIndex();
      const matches = searchComponents(index, args.query, args.limit ?? 10);

      return json({
        query: args.query,
        count: matches.length,
        matches,
        next: matches.length
          ? 'Call xui_components_get with the best match to confirm selectors before writing markup.'
          : 'No match. Call xui_components_list to see everything available.'
      });
    }
  );

  server.registerTool(
    'xui_components_get',
    {
      title: 'Get an xUI component API',
      description:
        'The full API of one xUI package, extracted from its source: every directive/component with ' +
        'its selector, exportAs, signal inputs (type, default, transform), outputs, public methods, ' +
        'CVA variant axes with their options and defaults, exported types, the config-token API, and ' +
        'the Storybook examples. Never guess a selector or an input name - confirm it here first.',
      inputSchema: {
        name: z
          .string()
          .min(1)
          .describe('Package folder name (`date-picker`), npm name (`@xui/date-picker`) or a selector.'),
        extract: z
          .enum(['api', 'examples', 'types', 'full'])
          .default('api')
          .describe(
            '`api` for declarables, `examples` for Storybook usage, `types` for exported types, `full` for all.'
          )
      }
    },
    async args => {
      const index = await getIndex();
      const component = findComponent(index, args.name);

      if (!component) {
        return json({
          error: `Unknown xUI component: "${args.name}".`,
          suggestions: suggestComponents(index, args.name),
          next: 'Call xui_components_search or xui_components_list.'
        });
      }

      const extract = args.extract ?? 'api';
      const header = {
        name: component.name,
        package: component.package,
        kind: component.kind,
        version: component.version,
        description: component.description,
        path: component.path,
        usage: usageHint(component),
        importsConst: component.importsConst,
        configApi: component.configApi
      };

      return json({
        ...header,
        ...(extract === 'api' || extract === 'full' ? { symbols: component.symbols.map(describeSymbol) } : {}),
        ...(extract === 'types' || extract === 'full' ? { types: component.types } : {}),
        ...(extract === 'examples' || extract === 'full'
          ? { imports: component.exampleImports, examples: component.examples, storyPath: component.storyPath }
          : {}),
        notes: [
          'Inputs are Angular signal inputs - bind them as normal template attributes.',
          'Variant axes come from the package CVA map; use them instead of overriding classes.',
          'Every component takes a `class` input that merges with (does not replace) its own classes.',
          extract === 'examples'
            ? 'Example templates are Storybook sources: `${…}` spans are arg interpolation, not markup.'
            : 'Call again with extract:"examples" for working templates.'
        ]
      });
    }
  );

  server.registerTool(
    'xui_components_dependencies',
    {
      title: 'Get an xUI component installation info',
      description:
        'What must be installed and imported to use a component: its peer dependencies, the other ' +
        '@xui packages it pulls in, whether it needs the CDK overlay stylesheet, and the pnpm command ' +
        'to install it.',
      inputSchema: {
        name: z.string().min(1).describe('Package folder name or npm name.')
      }
    },
    async args => {
      const index = await getIndex();
      const component = findComponent(index, args.name);

      if (!component) {
        return json({
          error: `Unknown xUI component: "${args.name}".`,
          suggestions: suggestComponents(index, args.name)
        });
      }

      const xuiPeers = Object.keys(component.peerDependencies).filter(dependency => dependency.startsWith('@xui/'));

      return json({
        name: component.name,
        package: component.package,
        version: component.version,
        install: `pnpm add ${[component.package, ...xuiPeers].join(' ')}`,
        peerDependencies: component.peerDependencies,
        xuiPeerPackages: xuiPeers,
        needsOverlayStylesheet: usesOverlay(component),
        styles: [
          "@import 'tailwindcss';",
          "@import '@xui/core/styles/theme.css';",
          ...(usesOverlay(component) ? ["@import '@angular/cdk/overlay-prebuilt.css';"] : []),
          "@source '../node_modules/@xui';"
        ]
      });
    }
  );
}

/** Overlay surfaces render through the CDK, which needs its prebuilt stylesheet in the app. */
function usesOverlay(component: XuiComponent): boolean {
  return (
    Object.keys(component.peerDependencies).includes('@angular/cdk') &&
    /popover|tooltip|menu|dialog|drawer|toast|select|picker|omnibar|suggest|cascader|autocomplete/.test(component.name)
  );
}
