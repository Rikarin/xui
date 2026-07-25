#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerComponentTools } from './tools/components.js';
import { registerDocsTools } from './tools/docs.js';
import { registerMetaTools } from './tools/meta.js';
import { registerPrompts } from './tools/prompts.js';
import { registerResources } from './tools/resources.js';
import { registerTokenTools } from './tools/tokens.js';

const server = new McpServer(
  {
    name: 'xui',
    version: '0.0.1'
  },
  {
    instructions:
      'xUI is an Angular 22 + Tailwind 4 component library published as ~90 `@xui/<name>` packages on ' +
      'top of the headless `@xui/core/*` entrypoints. This server answers from the library sources, so ' +
      'selectors, signal inputs and variant options are always the real ones. Search or list before ' +
      'writing markup, confirm every selector and input with xui_components_get, and style only with ' +
      'the semantic tokens from xui_tokens_list.'
  }
);

registerComponentTools(server);
registerTokenTools(server);
registerDocsTools(server);
registerMetaTools(server);
registerResources(server);
registerPrompts(server);

await server.connect(new StdioServerTransport());
