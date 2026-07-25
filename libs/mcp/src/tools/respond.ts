import type { XuiComponent, XuiSymbol } from '../lib/types.js';

/** Every tool answers with one JSON text block; agents parse it, humans can still read it. */
export function json(payload: unknown): { content: { type: 'text'; text: string }[] } {
  return { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }] };
}

/** The one-line shape of a component used by list/search results. */
export function summarize(component: XuiComponent) {
  return {
    name: component.name,
    package: component.package,
    kind: component.kind,
    description: component.description,
    selectors: component.symbols.map(symbol => symbol.selector).filter(Boolean),
    imports: component.importsConst,
    examples: component.examples.length
  };
}

/** The full API of one declarable, with the variant axes its CVA map declares. */
export function describeSymbol(symbol: XuiSymbol) {
  return {
    name: symbol.name,
    kind: symbol.kind,
    selector: symbol.selector,
    exportAs: symbol.exportAs,
    description: symbol.docs,
    file: symbol.file,
    variants: symbol.variants.map(axis => ({
      name: axis.name,
      options: axis.options,
      default: axis.default
    })),
    inputs: symbol.inputs.map(input => ({
      name: input.name,
      type: input.type,
      default: input.default,
      required: input.required || undefined,
      twoWay: input.model,
      transform: input.transform,
      description: input.docs
    })),
    outputs: symbol.outputs.map(output => ({
      name: output.name,
      type: output.type,
      description: output.docs
    })),
    methods: symbol.methods.map(method => ({
      signature: method.signature,
      description: method.docs
    })),
    host: symbol.host
  };
}

/**
 * How to declare a component in a standalone Angular component. Every package exports a
 * `Xui<Name>Imports` barrel, so the barrel is the answer whenever it exists.
 */
export function usageHint(component: XuiComponent): string {
  if (component.kind === 'core') {
    return `import { ${component.exports.slice(0, 3).join(', ')} } from '${component.package}';`;
  }

  const declarables = component.importsConst ?? component.symbols.map(symbol => symbol.name).join(', ');

  return `import { ${declarables} } from '${component.package}';  // add to the standalone component's \`imports\``;
}
