import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getIndex } from '../lib/index-store.js';
import { json } from './respond.js';

export function registerTokenTools(server: McpServer): void {
  server.registerTool(
    'xui_tokens_list',
    {
      title: 'List xUI design tokens',
      description:
        'The semantic design tokens from `@xui/core/styles/theme.css`, with their light and dark ' +
        'values and the Tailwind utility namespace each is exposed through. xUI components must style ' +
        'themselves with these (`bg-surface`, `text-foreground-muted`, `border-error-muted`) and never ' +
        'with a raw palette class such as `bg-zinc-800`, which cannot follow the active theme.',
      inputSchema: {
        group: z
          .enum([
            'surfaces',
            'text',
            'borders',
            'intents',
            'state',
            'elevation',
            'motion',
            'typography',
            'other',
            'all'
          ])
          .default('all')
          .describe('Restrict to one token group.'),
        query: z.string().optional().describe('Substring filter on the token name, e.g. "primary".')
      }
    },
    async args => {
      const index = await getIndex();
      const group = args.group ?? 'all';
      const query = args.query?.toLowerCase();

      const tokens = index.tokens
        .filter(token => group === 'all' || token.group === group)
        .filter(token => !query || token.name.includes(query));

      return json({
        count: tokens.length,
        groups: [...new Set(index.tokens.map(token => token.group))],
        tokens: tokens.map(token => ({
          token: `--${token.name}`,
          group: token.group,
          utility: token.utility ? `${token.utility}-${token.name}` : undefined,
          light: token.light,
          dark: token.dark,
          derived: token.derived
        })),
        notes: [
          'A `derived` value is declared for every theme scope and resolves against the intent base ' +
            'and `--background`, so overriding one intent re-colours its whole ramp.',
          'Re-theme by redeclaring the token after the import, e.g. `:root { --primary: var(--color-violet-600); }`.',
          'Themes switch with `.dark` / `[data-theme="dark"]` on any element, not just `<html>`.'
        ]
      });
    }
  );
}
