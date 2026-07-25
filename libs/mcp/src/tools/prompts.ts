import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { findComponent, getIndex, searchComponents } from '../lib/index-store.js';
import { usageHint } from './respond.js';

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    'xui-get-started',
    {
      title: 'Get started with an xUI component',
      description: 'Install, import and render one xUI component correctly.',
      argsSchema: { component: z.string().describe("Component name, e.g. 'callout'.") }
    },
    async ({ component }) => {
      const index = await getIndex();
      const found = findComponent(index, component);

      if (!found) {
        return userMessage(
          `I want to use the xUI "${component}" component, but it does not exist. ` +
            `Call xui_components_search to find the closest match, then explain how to use that instead.`
        );
      }

      const example = found.examples.find(candidate => candidate.code)?.code;

      return userMessage(
        [
          `Help me use the xUI ${found.name} component (${found.package}).`,
          '',
          `Install: pnpm add ${found.package}`,
          `Import: ${usageHint(found)}`,
          '',
          'Declarables:',
          ...found.symbols.map(symbol => `- ${symbol.name} (${symbol.kind}) selector \`${symbol.selector ?? 'n/a'}\``),
          ...(example ? ['', 'Reference template from Storybook:', '```html', example, '```'] : []),
          '',
          'Confirm the inputs with xui_components_get before writing markup, style only with the ' +
            'semantic tokens from xui_tokens_list, and prefer the component variant inputs over custom classes.'
        ].join('\n')
      );
    }
  );

  server.registerPrompt(
    'xui-implement-feature',
    {
      title: 'Implement a feature with xUI',
      description: 'Pick the right xUI packages for a feature and compose them.',
      argsSchema: { feature: z.string().describe('What you are building, e.g. "a settings dialog with a form".') }
    },
    async ({ feature }) => {
      const index = await getIndex();
      const matches = searchComponents(index, feature, 8);

      return userMessage(
        [
          `Build this with xUI: ${feature}`,
          '',
          matches.length
            ? `Candidate packages: ${matches.map(match => match.package).join(', ')}`
            : 'Call xui_components_list first - the search found no obvious candidate.',
          '',
          'Rules to follow:',
          '- Compose existing @xui packages instead of writing custom markup.',
          '- Use each component variant/size/color input rather than overriding classes.',
          '- Style only with the semantic tokens (bg-surface, text-foreground-muted, border-error-muted).',
          '- Confirm every selector and input with xui_components_get before using it.',
          '- Any overlay surface (popover, tooltip, menu, dialog, drawer, toast) needs ' +
            "`@import '@angular/cdk/overlay-prebuilt.css';` in the app styles."
        ].join('\n')
      );
    }
  );

  server.registerPrompt(
    'xui-troubleshoot',
    {
      title: 'Troubleshoot an xUI problem',
      description: 'Diagnose a styling, theming or component-API problem.',
      argsSchema: { problem: z.string().describe('What is going wrong.') }
    },
    async ({ problem }) =>
      userMessage(
        [
          `Something is wrong with my xUI usage: ${problem}`,
          '',
          'Check in this order:',
          '1. Is `@xui/core/styles/theme.css` imported after Tailwind, and is `@source` pointing at node_modules/@xui?',
          '2. For an overlay that renders in the document flow: is `@angular/cdk/overlay-prebuilt.css` imported?',
          '3. Are the selector and inputs the ones xui_components_get reports for the installed version?',
          '4. Is the component declared through its `Xui<Name>Imports` barrel in the standalone `imports`?',
          '5. For colours that do not follow the theme: is a raw palette class (bg-zinc-800) used instead of a token?',
          '',
          'Use xui_components_get, xui_tokens_list and xui_docs_get to confirm each answer rather than guessing.'
        ].join('\n')
      )
  );

  server.registerPrompt(
    'xui-add-package',
    {
      title: 'Add a new xUI package (contributors)',
      description: 'Scaffold and implement a new component package inside the xUI monorepo.',
      argsSchema: { name: z.string().describe('kebab-case package name, e.g. "split-button".') }
    },
    async ({ name }) =>
      userMessage(
        [
          `Add a new xUI package: ${name}.`,
          '',
          `Scaffold: pnpm nx g @xui/tools:library ${name} --generate=component --story`,
          '',
          'Definition of done:',
          '- `libs/ui/' + name + '/xui/src/lib/' + name + '.ts` with a CVA variant map merged through `xui()`.',
          '- A `.token.ts` config token so apps can re-theme defaults globally.',
          '- Standalone, OnPush, zoneless-safe, signal APIs only.',
          '- A `class` input that merges rather than replaces.',
          '- Specs covering base classes, each variant axis, class merging and the a11y contract.',
          '- A CSF3 story in `apps/ui-storybook/stories/' + name + '.stories.ts`.',
          '- `pnpm nx run-many -t lint test build` clean, then `xui_index_refresh` to re-extract the index.'
        ].join('\n')
      )
  );
}

function userMessage(text: string) {
  return { messages: [{ role: 'user' as const, content: { type: 'text' as const, text } }] };
}
