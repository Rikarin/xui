import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { findComponent, getIndex } from '../lib/index-store.js';
import { describeSymbol, summarize, usageHint } from './respond.js';

export function registerResources(server: McpServer): void {
  server.registerResource(
    'xUI components',
    'xui://components/list',
    {
      description: 'Every xUI package with its selectors, imports barrel and resource URIs.',
      mimeType: 'application/json'
    },
    async uri => {
      const index = await getIndex();

      return {
        contents: [
          text(uri, {
            version: index.version,
            source: index.source,
            components: index.components.map(component => ({
              ...summarize(component),
              api: `xui://component/${component.name}/api`,
              examples: `xui://component/${component.name}/examples`,
              full: `xui://component/${component.name}/full`
            }))
          })
        ]
      };
    }
  );

  server.registerResource(
    'xUI design tokens',
    'xui://tokens',
    {
      description: 'Semantic design tokens with their light and dark values.',
      mimeType: 'application/json'
    },
    async uri => {
      const index = await getIndex();

      return { contents: [text(uri, { version: index.version, tokens: index.tokens })] };
    }
  );

  for (const view of ['api', 'examples', 'full'] as const) {
    server.registerResource(
      `xUI component ${view}`,
      new ResourceTemplate(`xui://component/{name}/${view}`, {
        list: async () => {
          const index = await getIndex();

          return {
            resources: index.components.map(component => ({
              uri: `xui://component/${component.name}/${view}`,
              name: `${component.name} - ${view}`,
              description: `${component.package} ${view}`,
              mimeType: 'application/json'
            }))
          };
        }
      }),
      {
        description: `The ${view} of an xUI component, extracted from its source.`,
        mimeType: 'application/json'
      },
      async (uri, variables) => {
        const name = Array.isArray(variables['name']) ? variables['name'][0] : variables['name'];
        const index = await getIndex();
        const component = findComponent(index, String(name));

        if (!component) {
          throw new Error(`Unknown xUI component: ${String(name)}`);
        }

        return {
          contents: [
            text(uri, {
              name: component.name,
              package: component.package,
              usage: usageHint(component),
              ...(view === 'api' || view === 'full' ? { symbols: component.symbols.map(describeSymbol) } : {}),
              ...(view === 'examples' || view === 'full'
                ? { imports: component.exampleImports, examples: component.examples }
                : {}),
              ...(view === 'full' ? { types: component.types, configApi: component.configApi } : {})
            })
          ]
        };
      }
    );
  }
}

function text(uri: URL, payload: unknown) {
  return { uri: uri.toString(), mimeType: 'application/json', text: JSON.stringify(payload, null, 2) };
}
