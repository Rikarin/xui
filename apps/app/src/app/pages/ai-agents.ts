import { ChangeDetectionStrategy, Component } from '@angular/core';
import { XuiCalloutImports } from '@xui/callout';
import { XuiLinkImports } from '@xui/link';
import { XuiTableImports } from '@xui/table';
import { XuiTextImports } from '@xui/text';
import { COMPONENTS } from '../../generated/manifest';
import { CodeBlock } from '../shared/code-block';
import { TableOfContents, type TocEntry } from '../shared/table-of-contents';

const TOOLS = [
  ['xui_components_list', 'Every package, with its group and one-line description.'],
  ['xui_components_get', 'One package in full: selectors, signal inputs, outputs, variant axes, exports.'],
  ['xui_components_search', 'Find a package by what it does rather than by name.'],
  ['xui_examples_get', 'The maintained Storybook examples for a package.'],
  ['xui_tokens_list', 'The design tokens, by group, with their light and dark values.'],
  ['xui_tokens_search', 'Find the token for a role — a muted border, a subtle surface.'],
  ['xui_docs_list', 'The guide pages available.'],
  ['xui_docs_get', 'One guide page in full.']
];

@Component({
  selector: 'docs-ai-agents',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [XuiCalloutImports, XuiLinkImports, XuiTableImports, XuiTextImports, CodeBlock, TableOfContents],
  template: `
    <div class="flex gap-8">
      <article class="max-w-3xl min-w-0 flex-1">
        <h1 xuiHeading [level]="1">MCP server and agent skill</h1>
        <p xuiText color="muted" size="lg" class="mt-3">
          A coding assistant that has not been told about xUI will invent APIs that look plausible and do not exist. Two
          pieces of tooling fix that: a Model Context Protocol server that answers from the library sources, and a skill
          that carries the conventions.
        </p>

        <h2 xuiHeading [level]="2" class="mt-10 mb-3 scroll-mt-20" id="why">Why a server rather than a doc page</h2>
        <p xuiText color="muted" class="mb-3">
          The server extracts what it answers from the decorated classes themselves — every selector, signal input,
          two-way model, output and <code xuiCode>cva</code> variant axis across all {{ packageCount }} packages, plus
          the design tokens and the maintained Storybook examples. It reports the version it extracted from, so the
          answers match the code you have installed rather than whatever shipped last.
        </p>

        <h2 xuiHeading [level]="2" class="mt-10 mb-3 scroll-mt-20" id="install">Install</h2>
        <p xuiText color="muted" class="mb-3">
          The server runs over stdio and ships its own extracted index, so it needs no checkout and no build:
        </p>
        <docs-code [code]="config" lang="json" />

        <p xuiText color="muted" class="mt-4 mb-3">
          That file is <code xuiCode>.mcp.json</code> for Claude Code, <code xuiCode>.vscode/mcp.json</code> for VS
          Code, or your assistant's equivalent. Restart it afterwards and the tools below appear.
        </p>

        <xui-callout color="info" title="Working inside the xUI repository?" class="mb-6">
          Point the server at the workspace instead and it extracts live from
          <code xuiCode>libs/</code>, so an API you changed a minute ago is already answerable.
          <code xuiCode>.mcp.json</code> in the repo is set up that way — run
          <code xuiCode>pnpm nx build mcp</code> once first.
        </xui-callout>

        <h2 xuiHeading [level]="2" class="mt-10 mb-4 scroll-mt-20" id="tools">What it exposes</h2>
        <xui-table bordered compact class="w-full">
          <xui-tr>
            <xui-th class="w-56 min-w-0 shrink">Tool</xui-th>
            <xui-th class="min-w-0 flex-1">Answers</xui-th>
          </xui-tr>
          @for (tool of tools; track tool[0]) {
            <xui-tr>
              <xui-td class="w-64"
                ><code xuiCode class="text-xs wrap-anywhere whitespace-normal">{{ tool[0] }}</code></xui-td
              >
              <xui-td class="min-w-0 flex-1"
                ><span xuiText size="sm">{{ tool[1] }}</span></xui-td
              >
            </xui-tr>
          }
        </xui-table>

        <p xuiText color="muted" size="sm" class="mt-4">
          It also publishes the token reference and the component index as MCP resources, and a few prompts for the jobs
          that come up constantly — building a form, theming an intent, picking between two packages.
        </p>

        <h2 xuiHeading [level]="2" class="mt-12 mb-3 scroll-mt-20" id="skill">The skill</h2>
        <p xuiText color="muted" class="mb-3">
          The server answers <em>what exists</em>. The skill carries <em>how to use it</em>: the three-layer
          architecture, when to reach for a variant instead of a class, the styling rules, composition patterns for
          forms and overlays, and the conventions for authoring a package inside the monorepo.
        </p>
        <docs-code [code]="skillInstall" lang="bash" />
        <p xuiText color="muted" size="sm" class="mt-3">
          Claude Code discovers skills under <code xuiCode>.claude/skills</code>. The skill is small on purpose — it
          teaches the rules and defers every concrete API question to the MCP server, so it cannot go stale.
        </p>

        <h2 xuiHeading [level]="2" class="mt-12 mb-3 scroll-mt-20" id="verify">Checking it works</h2>
        <p xuiText color="muted" class="mb-3">Ask your assistant something only the server can answer:</p>
        <docs-code [code]="verify" lang="bash" />
        <p xuiText color="muted" size="sm" class="mt-3">
          A correct answer names <code xuiCode>variant</code>, <code xuiCode>size</code> and
          <code xuiCode>color</code> with their exact options. A wrong one invents <code xuiCode>appearance</code> or
          <code xuiCode>severity</code> — which is what you get without the server.
        </p>

        <h2 xuiHeading [level]="2" class="mt-12 mb-3 scroll-mt-20" id="source">Source</h2>
        <p xuiText color="muted" size="sm">
          <a
            xuiLink
            href="https://github.com/Rikarin/xui/tree/master/libs/mcp"
            rel="noreferrer noopener"
            target="_blank"
          >
            libs/mcp
          </a>
          and
          <a
            xuiLink
            href="https://github.com/Rikarin/xui/tree/master/skills/xui"
            rel="noreferrer noopener"
            target="_blank"
          >
            skills/xui
          </a>
        </p>
      </article>

      <docs-table-of-contents class="hidden xl:block" [entries]="toc" />
    </div>
  `
})
export class AiAgents {
  protected readonly tools = TOOLS;
  protected readonly packageCount = COMPONENTS.length;

  protected readonly toc: TocEntry[] = [
    { id: 'why', label: 'Why a server', level: 2 },
    { id: 'install', label: 'Install', level: 2 },
    { id: 'tools', label: 'What it exposes', level: 2 },
    { id: 'skill', label: 'The skill', level: 2 },
    { id: 'verify', label: 'Checking it works', level: 2 },
    { id: 'source', label: 'Source', level: 2 }
  ];

  protected readonly config = `{
  "mcpServers": {
    "xui": {
      "command": "npx",
      "args": ["-y", "@xui/mcp"]
    }
  }
}`;

  protected readonly skillInstall = `# copy the skill into your project
npx degit Rikarin/xui/skills/xui .claude/skills/xui`;

  protected readonly verify = `# in your assistant
What variant axes does @xui/button have, and what are the options?`;
}
