import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getIndex } from '../lib/index-store.js';
import { json } from './respond.js';

export function registerDocsTools(server: McpServer): void {
  server.registerTool(
    'xui_docs_get',
    {
      title: 'Get xUI documentation',
      description:
        'Fetch a documentation page (installation, theming, dark-mode, cli, introduction, and the ' +
        'per-component guides). Call without a slug to list every topic. Use this for setup, theming ' +
        'and dark-mode questions rather than guessing the CSS imports.',
      inputSchema: {
        slug: z.string().optional().describe('Topic slug, e.g. `getting-started/theming`. Omit to list topics.'),
        extract: z
          .enum(['none', 'code', 'headings'])
          .default('none')
          .describe('`none` for the full page, `code` for its fenced blocks, `headings` for its outline.')
      }
    },
    async args => {
      const index = await getIndex();

      if (!args.slug) {
        return json({
          count: index.docs.length,
          topics: index.docs.map(doc => ({ slug: doc.slug, title: doc.title, path: doc.path })),
          next: 'Call again with a slug to read one.'
        });
      }

      const needle = args.slug.toLowerCase();
      const doc =
        index.docs.find(candidate => candidate.slug.toLowerCase() === needle) ??
        index.docs.find(candidate => candidate.slug.toLowerCase().endsWith(`/${needle}`));

      if (!doc) {
        return json({
          error: `Unknown docs topic: "${args.slug}".`,
          topics: index.docs.map(candidate => candidate.slug)
        });
      }

      const extract = args.extract ?? 'none';

      if (extract === 'code') {
        return json({ slug: doc.slug, title: doc.title, path: doc.path, code: codeBlocks(doc.content) });
      }

      if (extract === 'headings') {
        return json({ slug: doc.slug, title: doc.title, path: doc.path, headings: headings(doc.content) });
      }

      return json({ slug: doc.slug, title: doc.title, path: doc.path, content: doc.content });
    }
  );
}

function codeBlocks(markdown: string): { language: string; code: string }[] {
  const blocks: { language: string; code: string }[] = [];
  const pattern = /```(\w*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(markdown))) {
    blocks.push({ language: match[1] || 'text', code: match[2].trimEnd() });
  }

  return blocks;
}

function headings(markdown: string): { level: number; text: string }[] {
  return markdown
    .split('\n')
    .map(line => line.match(/^(#{1,6})\s+(.*)$/))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map(match => ({ level: match[1].length, text: match[2].trim() }));
}
