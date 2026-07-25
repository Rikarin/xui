import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { parseLibraryFile } from './parse-source.js';

const BUTTON = `
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, model, output } from '@angular/core';
import { cva, VariantProps } from 'class-variance-authority';

const buttonVariants = cva(['inline-flex'], {
  variants: {
    variant: { default: 'shadow', ghost: 'border-none' },
    size: { default: 'h-10', sm: 'h-8' }
  },
  defaultVariants: { variant: 'default', size: 'default' }
});

export type ButtonVariants = VariantProps<typeof buttonVariants>;

/** A button on a native element. */
@Directive({
  selector: '[xuiButton]',
  exportAs: 'xuiButton',
  host: { '[class]': 'computedClass()', '[attr.aria-pressed]': "active() ? 'true' : null" }
})
export class XuiButton {
  private readonly config = injectXuiButtonConfig();

  readonly variant = input<ButtonVariants['variant']>('default');
  readonly label = input.required<string>();
  /** Stretch to fill the available width. */
  readonly fill = input(false, { transform: booleanAttribute });
  readonly open = model(false);
  readonly closed = output<string>();

  protected readonly computedClass = buttonVariants;

  /** Merge extra classes in. */
  setClass(classes: string): void {}
}
`;

describe('parseLibraryFile', () => {
  const parsed = parseLibraryFile(ts, 'libs/ui/button/xui/src/lib/button.ts', BUTTON);
  const symbol = parsed.symbols[0];

  it('reads the decorator metadata', () => {
    expect(parsed.symbols).toHaveLength(1);
    expect(symbol.kind).toBe('directive');
    expect(symbol.name).toBe('XuiButton');
    expect(symbol.selector).toBe('[xuiButton]');
    expect(symbol.exportAs).toBe('xuiButton');
    expect(symbol.docs).toBe('A button on a native element.');
    expect(symbol.host['[class]']).toBe('computedClass()');
  });

  it('reads signal inputs with their type, default and transform', () => {
    expect(symbol.inputs.map(input => input.name)).toEqual(['variant', 'label', 'fill', 'open']);

    const variant = symbol.inputs[0];
    expect(variant.type).toBe("ButtonVariants['variant']");
    expect(variant.default).toBe("'default'");
    expect(variant.required).toBe(false);

    const label = symbol.inputs[1];
    expect(label.required).toBe(true);
    expect(label.default).toBeUndefined();

    const fill = symbol.inputs[2];
    expect(fill.type).toBe('boolean');
    expect(fill.transform).toBe('booleanAttribute');
    expect(fill.docs).toBe('Stretch to fill the available width.');

    expect(symbol.inputs[3].model).toBe(true);
  });

  it('reads outputs and public methods, and skips private members', () => {
    expect(symbol.outputs).toEqual([{ name: 'closed', type: 'string', docs: undefined }]);
    expect(symbol.methods).toEqual([
      { name: 'setClass', signature: 'setClass(classes: string): void', docs: 'Merge extra classes in.' }
    ]);
    expect(symbol.inputs.some(input => input.name === 'config')).toBe(false);
  });

  it('attaches the CVA variant axes the class uses', () => {
    expect(symbol.variants).toEqual([
      { name: 'variant', options: ['default', 'ghost'], default: 'default' },
      { name: 'size', options: ['default', 'sm'], default: 'default' }
    ]);
  });

  it('collects exported types', () => {
    expect(parsed.types.map(type => type.name)).toContain('ButtonVariants');
  });
});

describe('parseLibraryFile config API', () => {
  it('picks up the injection-token helpers', () => {
    const parsed = parseLibraryFile(
      ts,
      'button.token.ts',
      `
        export interface XuiButtonConfig { color: string }
        export function provideXuiButtonConfig(config: Partial<XuiButtonConfig>): ValueProvider { return null!; }
        export function injectXuiButtonConfig(): XuiButtonConfig { return null!; }
      `
    );

    expect(parsed.configApi).toEqual(['provideXuiButtonConfig', 'injectXuiButtonConfig']);
    expect(parsed.symbols).toHaveLength(0);
  });
});
