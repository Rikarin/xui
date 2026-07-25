import type * as TS from 'typescript';
import type { XuiExportedType, XuiInput, XuiMethod, XuiOutput, XuiSymbol, XuiVariantAxis } from './types.js';

/** Longest declaration text kept for an exported type before it is truncated. */
const MAX_TYPE_TEXT = 600;

export interface ParsedFile {
  symbols: XuiSymbol[];
  types: XuiExportedType[];
  /** Exported `injectXui*Config` / `provideXui*Config` functions. */
  configApi: string[];
}

/**
 * Extract the public surface of one library file.
 *
 * This is deliberately syntactic - `ts.createSourceFile`, no program or type checker - because the
 * index covers 90 packages and only needs what is written in the source: decorator metadata,
 * signal-input declarations, CVA variant maps and exported types. A checker would cost a full
 * Angular program per package to resolve types the docs would print verbatim anyway.
 */
export function parseLibraryFile(ts: typeof TS, relativeFile: string, text: string): ParsedFile {
  const source = ts.createSourceFile(relativeFile, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const variantMaps = collectVariantMaps(ts, source);

  const symbols: XuiSymbol[] = [];
  const types: XuiExportedType[] = [];
  const configApi: string[] = [];

  for (const statement of source.statements) {
    if (ts.isClassDeclaration(statement)) {
      const symbol = parseClass(ts, source, statement, relativeFile, variantMaps);

      if (symbol) {
        symbols.push(symbol);
        continue;
      }
    }

    if (!isExported(ts, statement)) {
      continue;
    }

    if (ts.isTypeAliasDeclaration(statement)) {
      types.push({
        name: statement.name.text,
        kind: 'type',
        text: truncate(statement.getText(source)),
        docs: jsDocOf(ts, statement)
      });
    } else if (ts.isInterfaceDeclaration(statement)) {
      types.push({
        name: statement.name.text,
        kind: 'interface',
        text: truncate(statement.getText(source)),
        docs: jsDocOf(ts, statement)
      });
    } else if (ts.isEnumDeclaration(statement)) {
      types.push({
        name: statement.name.text,
        kind: 'enum',
        text: truncate(statement.getText(source)),
        docs: jsDocOf(ts, statement)
      });
    } else if (ts.isFunctionDeclaration(statement) && statement.name) {
      const name = statement.name.text;

      if (/^(inject|provide)Xui.*Config$/.test(name)) {
        configApi.push(name);
      }

      types.push({
        name,
        kind: 'function',
        text: truncate(functionSignature(ts, source, statement)),
        docs: jsDocOf(ts, statement)
      });
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) {
          continue;
        }

        types.push({
          name: declaration.name.text,
          kind: 'const',
          text: truncate(declaration.getText(source)),
          docs: jsDocOf(ts, statement)
        });
      }
    }
  }

  return { symbols, types, configApi };
}

/** `const buttonVariants = cva(base, { variants, defaultVariants })` → the axes it declares. */
function collectVariantMaps(ts: typeof TS, source: TS.SourceFile): Map<string, XuiVariantAxis[]> {
  const maps = new Map<string, XuiVariantAxis[]>();

  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue;
    }

    for (const declaration of statement.declarationList.declarations) {
      const initializer = declaration.initializer;

      if (
        !ts.isIdentifier(declaration.name) ||
        !initializer ||
        !ts.isCallExpression(initializer) ||
        !ts.isIdentifier(initializer.expression) ||
        initializer.expression.text !== 'cva'
      ) {
        continue;
      }

      const config = initializer.arguments[1];

      if (!config || !ts.isObjectLiteralExpression(config)) {
        continue;
      }

      const properties = objectProperties(ts, config);
      const variants = properties.get('variants');
      const defaults = properties.get('defaultVariants');

      if (!variants || !ts.isObjectLiteralExpression(variants)) {
        continue;
      }

      const defaultValues =
        defaults && ts.isObjectLiteralExpression(defaults) ? objectProperties(ts, defaults) : new Map();

      const axes: XuiVariantAxis[] = [];

      for (const [axisName, axisValue] of objectProperties(ts, variants)) {
        if (!ts.isObjectLiteralExpression(axisValue)) {
          continue;
        }

        const options = [...objectProperties(ts, axisValue).keys()];
        const fallback = defaultValues.get(axisName);

        axes.push({
          name: axisName,
          options,
          default: fallback ? literalText(ts, fallback) : undefined
        });
      }

      maps.set(declaration.name.text, axes);
    }
  }

  return maps;
}

function parseClass(
  ts: typeof TS,
  source: TS.SourceFile,
  node: TS.ClassDeclaration,
  relativeFile: string,
  variantMaps: Map<string, XuiVariantAxis[]>
): XuiSymbol | undefined {
  const decorators = ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : [];

  let kind: XuiSymbol['kind'] | undefined;
  let metadata: TS.ObjectLiteralExpression | undefined;

  for (const decorator of decorators) {
    if (!ts.isCallExpression(decorator.expression) || !ts.isIdentifier(decorator.expression.expression)) {
      continue;
    }

    const name = decorator.expression.expression.text;

    if (name !== 'Component' && name !== 'Directive') {
      continue;
    }

    kind = name === 'Component' ? 'component' : 'directive';
    const argument = decorator.expression.arguments[0];
    metadata = argument && ts.isObjectLiteralExpression(argument) ? argument : undefined;
  }

  if (!kind || !node.name) {
    return undefined;
  }

  const properties = metadata ? objectProperties(ts, metadata) : new Map<string, TS.Expression>();
  const selector = properties.get('selector');
  const exportAs = properties.get('exportAs');
  const host = properties.get('host');

  const inputs: XuiInput[] = [];
  const outputs: XuiOutput[] = [];
  const methods: XuiMethod[] = [];

  for (const member of node.members) {
    if (ts.isPropertyDeclaration(member)) {
      const parsed = parseMember(ts, source, member);

      if (parsed?.kind === 'input') {
        inputs.push(parsed.input);
      } else if (parsed?.kind === 'output') {
        outputs.push(parsed.output);
      }
    } else if (ts.isMethodDeclaration(member) && isPublic(ts, member) && ts.isIdentifier(member.name)) {
      methods.push({
        name: member.name.text,
        signature: methodSignature(ts, source, member),
        docs: jsDocOf(ts, member)
      });
    }
  }

  const classText = node.getText(source);
  const variants: XuiVariantAxis[] = [];

  for (const [variantName, axes] of variantMaps) {
    if (!new RegExp(`\\b${variantName}\\b`).test(classText)) {
      continue;
    }

    for (const axis of axes) {
      const existing = variants.find(candidate => candidate.name === axis.name);

      if (!existing) {
        variants.push(axis);
      } else if (!existing.default && axis.default) {
        existing.default = axis.default;
      }
    }
  }

  return {
    kind,
    name: node.name.text,
    selector: selector ? literalText(ts, selector) : undefined,
    exportAs: exportAs ? literalText(ts, exportAs) : undefined,
    file: relativeFile,
    docs: jsDocOf(ts, node),
    inputs,
    outputs,
    variants,
    methods,
    host: host && ts.isObjectLiteralExpression(host) ? hostBindings(ts, host) : {}
  };
}

type ParsedMember = { kind: 'input'; input: XuiInput } | { kind: 'output'; output: XuiOutput };

function parseMember(ts: typeof TS, source: TS.SourceFile, member: TS.PropertyDeclaration): ParsedMember | undefined {
  if (!member.initializer || !ts.isCallExpression(member.initializer) || !ts.isIdentifier(member.name)) {
    return undefined;
  }

  if (!isPublic(ts, member)) {
    return undefined;
  }

  const call = member.initializer;
  const callee = call.expression.getText(source);
  const name = member.name.text;
  const docs = jsDocOf(ts, member);
  const typeArguments = call.typeArguments?.map(type => type.getText(source)) ?? [];

  if (callee === 'output') {
    return { kind: 'output', output: { name, type: typeArguments[0] ?? 'void', docs } };
  }

  const isInput = callee === 'input' || callee === 'input.required';
  const isModel = callee === 'model' || callee === 'model.required';

  if (!isInput && !isModel) {
    return undefined;
  }

  const required = callee.endsWith('.required');
  const [first, second] = call.arguments;
  const options = required ? first : second;
  const transform =
    options && ts.isObjectLiteralExpression(options)
      ? objectProperties(ts, options).get('transform')?.getText(source)
      : undefined;
  const defaultValue = required || !first ? undefined : first.getText(source);

  return {
    kind: 'input',
    input: {
      name,
      type: typeArguments[0] ?? inferType(ts, transform, first),
      default: defaultValue,
      required,
      transform,
      model: isModel || undefined,
      docs
    }
  };
}

function inferType(ts: typeof TS, transform: string | undefined, defaultValue: TS.Expression | undefined): string {
  if (transform === 'booleanAttribute') {
    return 'boolean';
  }

  if (transform === 'numberAttribute') {
    return 'number';
  }

  if (!defaultValue) {
    return 'unknown';
  }

  if (defaultValue.kind === ts.SyntaxKind.TrueKeyword || defaultValue.kind === ts.SyntaxKind.FalseKeyword) {
    return 'boolean';
  }

  if (ts.isNumericLiteral(defaultValue)) {
    return 'number';
  }

  if (ts.isStringLiteral(defaultValue) || ts.isNoSubstitutionTemplateLiteral(defaultValue)) {
    return 'string';
  }

  return 'unknown';
}

function hostBindings(ts: typeof TS, host: TS.ObjectLiteralExpression): Record<string, string> {
  const bindings: Record<string, string> = {};

  for (const [key, value] of objectProperties(ts, host)) {
    bindings[key] = literalText(ts, value);
  }

  return bindings;
}

/** Property name → initializer, for object literals used as decorator/CVA metadata. */
function objectProperties(ts: typeof TS, node: TS.ObjectLiteralExpression): Map<string, TS.Expression> {
  const properties = new Map<string, TS.Expression>();

  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property) || !property.name) {
      continue;
    }

    const { name } = property;

    if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
      properties.set(name.text, property.initializer);
    } else if (ts.isComputedPropertyName(name)) {
      properties.set(name.expression.getText(), property.initializer);
    }
  }

  return properties;
}

function literalText(ts: typeof TS, node: TS.Expression): string {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  return node.getText();
}

function isExported(ts: typeof TS, node: TS.Statement): boolean {
  return ts.canHaveModifiers(node)
    ? ((ts.getModifiers(node) ?? []).some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false)
    : false;
}

function isPublic(ts: typeof TS, node: TS.PropertyDeclaration | TS.MethodDeclaration): boolean {
  const modifiers = ts.getModifiers(node) ?? [];

  return !modifiers.some(
    modifier =>
      modifier.kind === ts.SyntaxKind.PrivateKeyword ||
      modifier.kind === ts.SyntaxKind.ProtectedKeyword ||
      modifier.kind === ts.SyntaxKind.StaticKeyword
  );
}

function methodSignature(ts: typeof TS, source: TS.SourceFile, node: TS.MethodDeclaration): string {
  const name = ts.isIdentifier(node.name) ? node.name.text : node.name.getText(source);
  const parameters = node.parameters.map(parameter => parameter.getText(source)).join(', ');
  const returnType = node.type ? `: ${node.type.getText(source)}` : '';

  return `${name}(${parameters})${returnType}`;
}

function functionSignature(ts: typeof TS, source: TS.SourceFile, node: TS.FunctionDeclaration): string {
  const name = node.name?.text ?? '';
  const parameters = node.parameters.map(parameter => parameter.getText(source)).join(', ');
  const returnType = node.type ? `: ${node.type.getText(source)}` : '';

  return `function ${name}(${parameters})${returnType}`;
}

function jsDocOf(ts: typeof TS, node: TS.Node): string | undefined {
  const owner = node as TS.Node & { jsDoc?: TS.JSDoc[] };

  if (!owner.jsDoc?.length) {
    return undefined;
  }

  const text = owner.jsDoc
    .map(doc => (typeof doc.comment === 'string' ? doc.comment : (ts.getTextOfJSDocComment(doc.comment) ?? '')))
    .join('\n')
    .trim();

  return text || undefined;
}

function truncate(text: string): string {
  const collapsed = text.trim();

  return collapsed.length > MAX_TYPE_TEXT ? `${collapsed.slice(0, MAX_TYPE_TEXT)}\n/* … truncated */` : collapsed;
}
