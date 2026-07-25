import type * as TS from 'typescript';
import type { XuiExample } from './types.js';

export interface ParsedStories {
  /** `import { XuiCallout, XuiCalloutImports } from '@xui/callout';` style lines. */
  imports: string[];
  examples: XuiExample[];
}

/**
 * Turn a Storybook CSF3 file into examples.
 *
 * Stories are the only place in the repo where every package has real, maintained usage, so they
 * are the example source. Most stories only override `args` and inherit the template declared on
 * `meta.render`, so a story with no template of its own falls back to the meta template.
 */
export function parseStoryFile(ts: typeof TS, relativeFile: string, text: string): ParsedStories {
  const source = ts.createSourceFile(relativeFile, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  const imports = source.statements
    .filter((statement): statement is TS.ImportDeclaration => ts.isImportDeclaration(statement))
    .filter(
      statement => ts.isStringLiteral(statement.moduleSpecifier) && statement.moduleSpecifier.text.startsWith('@xui/')
    )
    .map(statement => statement.getText(source).trim());

  let metaTemplate: string | undefined;
  const examples: XuiExample[] = [];

  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue;
    }

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) {
        continue;
      }

      const name = declaration.name.text;
      const initializer = declaration.initializer;

      if (!ts.isObjectLiteralExpression(initializer)) {
        continue;
      }

      const isMeta = name === 'meta' || hasProperty(ts, initializer, 'title');

      if (isMeta) {
        metaTemplate = findTemplate(ts, source, initializer);
        continue;
      }

      if (!isExported(ts, statement)) {
        continue;
      }

      examples.push({
        name,
        code: findTemplate(ts, source, initializer) ?? '',
        args: propertyText(ts, source, initializer, 'args')
      });
    }
  }

  return {
    imports,
    examples: examples.map(example => ({
      ...example,
      code: example.code || metaTemplate || ''
    }))
  };
}

function hasProperty(ts: typeof TS, node: TS.ObjectLiteralExpression, name: string): boolean {
  return node.properties.some(
    property => ts.isPropertyAssignment(property) && ts.isIdentifier(property.name) && property.name.text === name
  );
}

function propertyText(
  ts: typeof TS,
  source: TS.SourceFile,
  node: TS.ObjectLiteralExpression,
  name: string
): string | undefined {
  for (const property of node.properties) {
    if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name) && property.name.text === name) {
      return property.initializer.getText(source).trim();
    }
  }

  return undefined;
}

/** First `template:` string anywhere under `node` - stories nest it inside `render()`. */
function findTemplate(ts: typeof TS, source: TS.SourceFile, node: TS.Node): string | undefined {
  let template: string | undefined;

  const visit = (current: TS.Node): void => {
    if (template) {
      return;
    }

    if (ts.isPropertyAssignment(current) && ts.isIdentifier(current.name) && current.name.text === 'template') {
      const initializer = current.initializer;

      if (ts.isNoSubstitutionTemplateLiteral(initializer) || ts.isStringLiteral(initializer)) {
        template = dedent(initializer.text);
        return;
      }

      if (ts.isTemplateExpression(initializer)) {
        // Keep the `${…}` spans verbatim: they are Storybook arg plumbing, and rewriting them
        // would invent markup the repo never renders.
        template = dedent(initializer.getText(source).slice(1, -1));
        return;
      }
    }

    ts.forEachChild(current, visit);
  };

  visit(node);

  return template;
}

function isExported(ts: typeof TS, node: TS.Statement): boolean {
  return ts.canHaveModifiers(node)
    ? (ts.getModifiers(node) ?? []).some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)
    : false;
}

export function dedent(text: string): string {
  const lines = text.replace(/\t/g, '  ').split('\n');

  while (lines.length && !lines[0].trim()) {
    lines.shift();
  }

  while (lines.length && !lines[lines.length - 1].trim()) {
    lines.pop();
  }

  const indent = lines
    .filter(line => line.trim())
    .reduce((smallest, line) => Math.min(smallest, line.length - line.trimStart().length), Number.MAX_SAFE_INTEGER);

  return lines.map(line => line.slice(Number.isFinite(indent) ? indent : 0)).join('\n');
}
