import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getIndex, refreshIndex } from '../lib/index-store.js';
import { json } from './respond.js';

export function registerMetaTools(server: McpServer): void {
  server.registerTool(
    'xui_meta',
    {
      title: 'xUI index overview',
      description:
        'Everything the server knows, in one call: library version, where the index came from, all ' +
        'component names, headless entrypoints, docs slugs and token groups. Useful as a first call ' +
        'and for autocompleting the arguments of the other tools.',
      inputSchema: {}
    },
    async () => {
      const index = await getIndex();

      return json({
        version: index.version,
        source: index.source,
        workspaceRoot: index.workspaceRoot,
        generatedAt: index.generatedAt,
        counts: {
          ui: index.components.filter(component => component.kind === 'ui').length,
          core: index.components.filter(component => component.kind === 'core').length,
          tokens: index.tokens.length,
          docs: index.docs.length
        },
        components: index.components.filter(component => component.kind === 'ui').map(component => component.name),
        coreEntrypoints: index.components
          .filter(component => component.kind === 'core')
          .map(component => component.package),
        docs: index.docs.map(doc => doc.slug),
        tokenGroups: [...new Set(index.tokens.map(token => token.group))]
      });
    }
  );

  server.registerTool(
    'xui_index_refresh',
    {
      title: 'Refresh the xUI index',
      description:
        'Re-extract the index from the workspace sources. Call this after editing or generating a ' +
        'component in an xUI checkout so later lookups see the change. No effect on a published ' +
        'install, which answers from the index generated at publish time.',
      inputSchema: {}
    },
    async () => {
      const index = await refreshIndex();

      return json({
        source: index.source,
        version: index.version,
        generatedAt: index.generatedAt,
        components: index.components.length,
        tokens: index.tokens.length
      });
    }
  );
}
