#!/usr/bin/env node

/**
 * Write the component index that the published package answers from.
 *
 * Run after compiling, from the workspace root:
 *   node dist/libs/mcp/src/scripts/generate-index.js --out dist/libs/mcp/src/xui-index.json
 *
 * Consumers install `@xui/mcp` without a checkout, so the JSON is generated here - where the
 * sources and `typescript` are available - and shipped alongside the compiled server.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildIndex } from '../lib/build-index.js';
import { findWorkspaceRoot } from '../lib/workspace.js';

const argument = (flag: string): string | undefined => {
  const index = process.argv.indexOf(flag);

  return index === -1 ? undefined : process.argv[index + 1];
};

const workspaceRoot = argument('--workspace') ?? findWorkspaceRoot();

if (!workspaceRoot) {
  console.error('generate-index: no xUI workspace found. Pass --workspace <path>.');
  process.exit(1);
}

const outputPath = resolve(argument('--out') ?? 'dist/libs/mcp/src/xui-index.json');
const index = await buildIndex(resolve(workspaceRoot));

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(index));

console.log(
  `generate-index: ${index.components.length} packages, ${index.tokens.length} tokens, ` +
    `${index.docs.length} docs → ${outputPath}`
);
