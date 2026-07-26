import { expectClasses, render } from '@xui/testing';
import { XuiAvatarImports } from '../index';
import { provideXuiAvatarConfig } from './avatar.token';

const IMPORTS = [XuiAvatarImports];
const setup = (template: string, props: Record<string, unknown> = {}) => render(template, { imports: IMPORTS, props });

const host = () => document.querySelector('xui-avatar') as HTMLElement;

describe('XuiAvatar', () => {
  it('renders an image when src is set', () => {
    const { detect } = setup('<xui-avatar src="/me.png" alt="Me" />');
    detect();

    const img = host().querySelector('img') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('/me.png');
    expect(host().getAttribute('aria-label')).toBe('Me');
  });

  it('falls back to text when the image errors', () => {
    const { detect } = setup('<xui-avatar src="/broken.png" text="JD" />');
    detect();

    host().querySelector('img')!.dispatchEvent(new Event('error'));
    detect();

    expect(host().querySelector('img')).toBeNull();
    expect(host().textContent?.trim()).toBe('JD');
  });

  it('renders text initials when there is no src', () => {
    const { detect } = setup('<xui-avatar text="AB" />');
    detect();

    expect(host().querySelector('img')).toBeNull();
    expect(host().textContent?.trim()).toBe('AB');
  });

  it('projects custom content as the fallback', () => {
    const { detect } = setup('<xui-avatar><i class="icon">x</i></xui-avatar>');
    detect();

    expect(host().querySelector('i.icon')).not.toBeNull();
  });

  it('applies shape and size variants', () => {
    const { detect } = setup('<xui-avatar text="A" shape="square" size="lg" />');
    detect();

    expectClasses(host(), 'rounded-md', 'h-10', 'w-10');
  });

  it('resets the image-failure state when src changes', () => {
    const { detect, setProps } = setup('<xui-avatar [src]="props().src" text="JD" />', { src: '/a.png' });
    detect();
    host().querySelector('img')!.dispatchEvent(new Event('error'));
    detect();
    expect(host().querySelector('img')).toBeNull();

    setProps({ src: '/b.png' });

    expect(host().querySelector('img')).not.toBeNull();
  });
});

describe('XuiAvatarGroup', () => {
  const visibleAvatars = () =>
    [...document.querySelectorAll('xui-avatar-group xui-avatar')].filter(
      a => (a as HTMLElement).style.display !== 'none'
    ) as HTMLElement[];

  it('overlaps its avatars', () => {
    const { detect } = setup('<xui-avatar-group><xui-avatar text="A" /><xui-avatar text="B" /></xui-avatar-group>');
    detect();

    const group = document.querySelector('xui-avatar-group') as HTMLElement;
    expectClasses(group, 'inline-flex');
    expect(group.className).toContain('-ms-2');
  });

  it('collapses avatars beyond max into a +N avatar', () => {
    const { detect } = setup(
      `<xui-avatar-group [max]="2">
         <xui-avatar text="A" /><xui-avatar text="B" /><xui-avatar text="C" /><xui-avatar text="D" />
       </xui-avatar-group>`
    );
    detect();

    // 2 projected shown + the +N avatar.
    expect(visibleAvatars().map(a => a.textContent?.trim())).toEqual(['A', 'B', '+2']);
  });

  it('shows all avatars and no +N when under max', () => {
    const { detect } = setup(
      `<xui-avatar-group [max]="5"><xui-avatar text="A" /><xui-avatar text="B" /></xui-avatar-group>`
    );
    detect();

    expect(visibleAvatars().map(a => a.textContent?.trim())).toEqual(['A', 'B']);
  });

  it('is decorative when it has no accessible name', () => {
    const { detect } = setup('<xui-avatar src="/me.png" />');
    detect();

    // An unnamed role="img" announces as a bare "image"; hide it instead.
    expect(host().getAttribute('role')).toBeNull();
    expect(host().getAttribute('aria-hidden')).toBe('true');
  });

  it('becomes a named image once alt or text is given', () => {
    const { detect } = setup('<xui-avatar src="/me.png" alt="Ada Lovelace" />');
    detect();

    expect(host().getAttribute('role')).toBe('img');
    expect(host().getAttribute('aria-label')).toBe('Ada Lovelace');
    expect(host().getAttribute('aria-hidden')).toBeNull();
  });

  it('takes its default shape and size from the config token', () => {
    const { detect } = render('<xui-avatar text="JD" />', {
      imports: IMPORTS,
      providers: [provideXuiAvatarConfig({ shape: 'square', size: 'lg' })]
    });
    detect();

    expectClasses(host(), 'rounded-md', 'h-10');
  });
});
