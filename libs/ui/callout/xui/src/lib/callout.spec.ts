import { expectAttributes, expectClasses, expectNoClasses, render } from '@xui/testing';
import { XuiCallout } from './callout';

const setup = (template: string) => render(template, { imports: [XuiCallout] });

/**
 * `name` is a signal input, so it never reaches the DOM as an attribute —
 * read it off the component instance instead.
 */
const iconName = (fixture: ReturnType<typeof setup>['fixture']) =>
  fixture.debugElement.query(node => node.name === 'ng-icon').componentInstance.name();

describe('XuiCallout', () => {
  it('renders its content in a bordered box', () => {
    const { query } = setup('<xui-callout>Something happened</xui-callout>');

    expect(query('xui-callout').textContent?.trim()).toBe('Something happened');
    expectClasses(query('xui-callout'), 'flex', 'rounded-lg', 'border', 'bg-muted');
  });

  it('renders the title above the content', () => {
    const { query } = setup('<xui-callout title="Heads up">Body</xui-callout>');

    expect(query('p').textContent).toBe('Heads up');
  });

  it('omits the title element entirely when there is none', () => {
    const { host } = setup('<xui-callout>Body</xui-callout>');

    expect(host.querySelector('p')).toBeNull();
  });

  it('applies the colour to the fill, border and icon together', () => {
    const { query } = setup('<xui-callout color="success">Body</xui-callout>');

    expectClasses(query('xui-callout'), 'bg-success-subtle', 'border-success-muted');
    expectClasses(query('ng-icon'), 'text-success-emphasis');
  });

  it.each([
    ['primary', 'matInfoRound'],
    ['success', 'matCheckCircleRound'],
    ['error', 'matErrorRound'],
    ['warning', 'matWarningRound'],
    ['info', 'matLightbulbRound']
  ])('gives the %s colour a default icon', (color, expected) => {
    const { fixture } = setup(`<xui-callout color="${color}">Body</xui-callout>`);

    expect(iconName(fixture)).toBe(expected);
  });

  it('lets an explicit icon override the one the colour implies', () => {
    const { fixture } = setup('<xui-callout color="success" icon="matWarningRound">Body</xui-callout>');

    expect(iconName(fixture)).toBe('matWarningRound');
  });

  it('shows no icon without a colour', () => {
    const { host } = setup('<xui-callout>Body</xui-callout>');

    expect(host.querySelector('ng-icon')).toBeNull();
  });

  it('suppresses the implied icon on request', () => {
    const { host } = setup('<xui-callout color="success" icon="none">Body</xui-callout>');

    expect(host.querySelector('ng-icon')).toBeNull();
  });

  it('announces error and warning callouts as alerts', () => {
    // These carry information the user needs to reach without hunting for it;
    // an informational callout is ordinary content and should not interrupt.
    const { query: error } = setup('<xui-callout color="error">Body</xui-callout>');
    expectAttributes(error('xui-callout'), { role: 'alert' });

    const { query: info } = setup('<xui-callout color="info">Body</xui-callout>');
    expectAttributes(info('xui-callout'), { role: null });
  });

  it('drops the fill when minimal', () => {
    const { query } = setup('<xui-callout color="success" minimal>Body</xui-callout>');

    expectClasses(query('xui-callout'), 'bg-transparent!', 'border-success-muted');
  });

  it('reduces the padding when compact', () => {
    const { query } = setup('<xui-callout compact>Body</xui-callout>');

    expectClasses(query('xui-callout'), 'p-2');
    expectNoClasses(query('xui-callout'), 'p-4');
  });

  it('merges the class input', () => {
    const { query } = setup('<xui-callout class="max-w-md">Body</xui-callout>');

    expectClasses(query('xui-callout'), 'max-w-md', 'rounded-lg');
  });
});
