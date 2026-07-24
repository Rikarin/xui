import { Component, Type, signal, type WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { dispatchKey, dispatchMouse, typeInto, type KeyOptions } from './events';

/** Anything accepted by a standalone component's `imports` array. */
type Imports = ReadonlyArray<Type<unknown> | ReadonlyArray<unknown>>;

export interface RenderOptions<TProps extends object> {
  /** Directives/components the template needs — usually `Xui<Name>Imports`. */
  imports?: Imports;
  /** Initial values for the host's `props` signal, bound in the template as `props().x`. */
  props?: TProps;
  /** Extra providers for the TestBed (config tokens, mocked services). */
  providers?: unknown[];
}

export interface RenderResult<TProps extends object> {
  fixture: ComponentFixture<TestHost<TProps>>;
  /** The host element wrapping the rendered template. */
  host: HTMLElement;
  /**
   * Update one or more props and run change detection.
   *
   * The suite runs zoneless, so nothing re-renders until change detection is
   * requested — this does both so tests never assert against a stale DOM.
   */
  setProps: (props: Partial<TProps>) => void;
  /** Run change detection. */
  detect: () => void;
  /** First element matching `selector`. Throws when nothing matches. */
  query: <T extends HTMLElement = HTMLElement>(selector: string) => T;
  /** All elements matching `selector`. */
  queryAll: <T extends HTMLElement = HTMLElement>(selector: string) => T[];
  /**
   * Click a target and run change detection.
   *
   * The suite is zoneless, so a bare `element.click()` updates component state
   * but leaves the DOM stale until change detection runs. These wrappers do both
   * — reach for the free functions in `events.ts` only when a test needs to
   * assert on the state *between* the event and the re-render.
   */
  click: (target: string | Element) => void;
  /** Dispatch a keyboard event at a target and run change detection. */
  press: (target: string | Element, key: string, options?: KeyOptions) => void;
  /** Set an input's value, fire `input`, and run change detection. */
  type: (target: string | HTMLInputElement | HTMLTextAreaElement, value: string) => void;
}

@Component({
  selector: 'xui-test-host',
  template: '',
  standalone: true
})
class TestHost<TProps extends object> {
  readonly props: WritableSignal<TProps> = signal({} as TProps);
}

/**
 * Render a template against a throwaway host component.
 *
 * Bind inputs through `props()` so they can be changed after the first render:
 *
 * ```ts
 * const { host, setProps } = render<{ color: string }>(
 *   `<button xuiButton [color]="props().color">Hi</button>`,
 *   { imports: [XuiButtonImports], props: { color: 'primary' } }
 * );
 * setProps({ color: 'error' });
 * ```
 */
export function render<TProps extends object = Record<string, never>>(
  template: string,
  options: RenderOptions<TProps> = {}
): RenderResult<TProps> {
  const { imports = [], props, providers = [] } = options;

  // Each call starts from a clean TestBed so a single test can render two
  // configurations and compare them. Fixtures from an earlier call in the same
  // test are destroyed — read what you need from one before rendering the next.
  TestBed.resetTestingModule();

  TestBed.configureTestingModule({
    imports: [TestHost, ...(imports as Type<unknown>[])],
    providers: providers as never[]
  });

  TestBed.overrideComponent(TestHost, {
    set: { template, imports: imports as Type<unknown>[] }
  });

  const fixture = TestBed.createComponent(TestHost<TProps>);

  if (props) {
    fixture.componentInstance.props.set(props);
  }

  fixture.detectChanges();

  const host = fixture.nativeElement as HTMLElement;

  const query = <T extends HTMLElement = HTMLElement>(selector: string): T => {
    const el = host.querySelector<T>(selector);

    if (!el) {
      throw new Error(`render(): no element matched "${selector}".\nRendered HTML:\n${host.innerHTML}`);
    }

    return el;
  };

  const resolve = (target: string | Element): Element => (typeof target === 'string' ? query(target) : target);

  return {
    fixture,
    host,
    detect: () => fixture.detectChanges(),
    setProps: (next: Partial<TProps>) => {
      fixture.componentInstance.props.update(current => ({ ...current, ...next }));
      fixture.detectChanges();
    },
    query,
    queryAll: <T extends HTMLElement = HTMLElement>(selector: string) => [...host.querySelectorAll<T>(selector)],
    click: target => {
      dispatchMouse(resolve(target), 'click');
      fixture.detectChanges();
    },
    press: (target, key, keyOptions) => {
      dispatchKey(resolve(target), key, keyOptions);
      fixture.detectChanges();
    },
    type: (target, value) => {
      typeInto(resolve(target) as HTMLInputElement | HTMLTextAreaElement, value);
      fixture.detectChanges();
    }
  };
}
