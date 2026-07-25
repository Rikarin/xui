import { render } from '@xui/testing';
import { XuiJsonFormat } from './json-format';

const setup = (props: Record<string, unknown>) =>
  render(
    `<xui-json-format [value]="props().value" [omitQuotes]="props().omitQuotes" [pretty]="props().pretty" [length]="props().length" />`,
    {
      imports: [XuiJsonFormat],
      props: { value: null, omitQuotes: false, pretty: false, length: 200, ...props }
    }
  );

const codeText = () => (document.querySelector('xui-json-format code') as HTMLElement).textContent;

describe('XuiJsonFormat', () => {
  it('serializes an object to compact JSON', () => {
    const { detect } = setup({ value: { a: 1, b: 'x' } });
    detect();

    expect(codeText()).toBe('{"a":1,"b":"x"}');
  });

  it('quotes a string value by default', () => {
    const { detect } = setup({ value: 'hi' });
    detect();

    expect(codeText()).toBe('"hi"');
  });

  it('omits quotes for a plain string when requested', () => {
    const { detect } = setup({ value: 'hi', omitQuotes: true });
    detect();

    expect(codeText()).toBe('hi');
  });

  it('pretty-prints with indentation', () => {
    const { detect } = setup({ value: { a: 1 }, pretty: true });
    detect();

    expect(codeText()).toBe('{\n  "a": 1\n}');
  });

  it('truncates very long JSON', () => {
    const { detect } = setup({ value: { text: 'x'.repeat(50) }, length: 10 });
    detect();

    expect(codeText()?.length).toBeLessThan(20);
    expect(codeText()).toContain('…');
  });
});
