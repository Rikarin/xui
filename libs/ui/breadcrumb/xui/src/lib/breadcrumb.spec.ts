import { expectAttributes, expectClasses, render } from '@xui/testing';
import { XuiBreadcrumb } from './breadcrumb';
import { XuiBreadcrumbEllipsis } from './breadcrumb-ellipsis';
import { XuiBreadcrumbItem } from './breadcrumb-item';
import { XuiBreadcrumbList } from './breadcrumb-list';
import { XuiBreadcrumbPage } from './breadcrumb-page';
import { XuiBreadcrumbSeparator } from './breadcrumb-separator';

const IMPORTS = [
  XuiBreadcrumb,
  XuiBreadcrumbList,
  XuiBreadcrumbItem,
  XuiBreadcrumbPage,
  XuiBreadcrumbSeparator,
  XuiBreadcrumbEllipsis
];

const setup = (template: string) => render(template, { imports: IMPORTS });

describe('XuiBreadcrumb', () => {
  it('exposes itself as a labelled navigation landmark', () => {
    const { query } = setup('<nav xuiBreadcrumb></nav>');

    expectAttributes(query('nav'), { role: 'navigation', 'aria-label': 'breadcrumb' });
  });

  it('accepts a custom aria-label', () => {
    const { query } = setup('<nav xuiBreadcrumb aria-label="You are here"></nav>');

    expectAttributes(query('nav'), { 'aria-label': 'You are here' });
  });
});

describe('XuiBreadcrumbList', () => {
  it('lays the trail out inline and de-emphasises it', () => {
    const { query } = setup('<ol xuiBreadcrumbList></ol>');

    expectClasses(query('ol'), 'flex', 'flex-wrap', 'items-center', 'text-foreground-subtle');
  });
});

describe('XuiBreadcrumbItem', () => {
  it('is not emphasised by default', () => {
    const { query } = setup('<li xuiBreadcrumbItem></li>');

    expectClasses(query('li'), 'inline-flex', 'items-center');
    expect(query('li').className).not.toContain('font-semibold');
  });

  it('emphasises its content when active', () => {
    const { query } = setup('<li xuiBreadcrumbItem active></li>');

    expectClasses(query('li'), '[&>*]:font-semibold');
  });
});

describe('XuiBreadcrumbPage', () => {
  it('marks the current page as a disabled link', () => {
    const { query } = setup('<span xuiBreadcrumbPage>Settings</span>');

    expectAttributes(query('span'), { role: 'link', 'aria-disabled': 'true', 'aria-current': 'page' });
    expectClasses(query('span'), 'text-foreground');
  });
});

describe('XuiBreadcrumbSeparator', () => {
  it('is hidden from assistive technology', () => {
    const { query } = setup('<li xuiBreadcrumbSeparator></li>');

    expectAttributes(query('li'), { role: 'presentation', 'aria-hidden': 'true' });
  });

  it('renders a default chevron that projected content replaces', () => {
    const { query } = setup('<li xuiBreadcrumbSeparator></li>');
    expect(query('ng-icon')).toBeTruthy();

    const { host } = setup('<li xuiBreadcrumbSeparator>/</li>');
    expect(host.querySelector('ng-icon')).toBeNull();
    expect(host.textContent).toContain('/');
  });
});

describe('XuiBreadcrumbEllipsis', () => {
  it('hides the glyph but keeps a screen-reader label', () => {
    const { query } = setup('<xui-breadcrumb-ellipsis />');

    expectAttributes(query('span'), { role: 'presentation', 'aria-hidden': 'true' });
    expect(query('.sr-only').textContent).toBe('More');
  });
});
