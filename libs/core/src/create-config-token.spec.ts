import { TestBed } from '@angular/core/testing';
import { createXConfigToken } from './create-config-token';

interface DemoConfig {
  color: string;
  size: string;
  compact: boolean;
}

const defaults: DemoConfig = { color: 'primary', size: 'md', compact: false };

describe('createXConfigToken', () => {
  it('falls back to the defaults when nothing is provided', () => {
    const [injectDemoConfig] = createXConfigToken<DemoConfig>('DemoConfig', defaults);

    expect(TestBed.runInInjectionContext(injectDemoConfig)).toEqual({ color: 'primary', size: 'md', compact: false });
  });

  it('merges a partial config over the defaults', () => {
    const [injectDemoConfig, provideDemoConfig] = createXConfigToken<DemoConfig>('DemoConfig', defaults);

    TestBed.configureTestingModule({ providers: [provideDemoConfig({ size: 'lg' })] });

    expect(TestBed.runInInjectionContext(injectDemoConfig)).toEqual({ color: 'primary', size: 'lg', compact: false });
  });

  it('lets a full config replace every default', () => {
    const [injectDemoConfig, provideDemoConfig] = createXConfigToken<DemoConfig>('DemoConfig', defaults);

    TestBed.configureTestingModule({
      providers: [provideDemoConfig({ color: 'error', size: 'sm', compact: true })]
    });

    expect(TestBed.runInInjectionContext(injectDemoConfig)).toEqual({ color: 'error', size: 'sm', compact: true });
  });

  it('does not mutate the defaults when providing', () => {
    const [injectDemoConfig, provideDemoConfig] = createXConfigToken<DemoConfig>('DemoConfig', defaults);

    TestBed.configureTestingModule({ providers: [provideDemoConfig({ color: 'success' })] });
    TestBed.runInInjectionContext(injectDemoConfig);

    expect(defaults).toEqual({ color: 'primary', size: 'md', compact: false });
  });

  it('keeps two tokens with the same description independent', () => {
    const [injectFirst, provideFirst] = createXConfigToken<DemoConfig>('DemoConfig', defaults);
    const [injectSecond] = createXConfigToken<DemoConfig>('DemoConfig', { ...defaults, color: 'other' });

    TestBed.configureTestingModule({ providers: [provideFirst({ size: 'xl' })] });

    expect(TestBed.runInInjectionContext(injectFirst).size).toBe('xl');
    expect(TestBed.runInInjectionContext(injectSecond)).toEqual({ color: 'other', size: 'md', compact: false });
  });

  it('throws outside an injection context, like inject() itself', () => {
    const [injectDemoConfig] = createXConfigToken<DemoConfig>('DemoConfig', defaults);

    expect(() => injectDemoConfig()).toThrow(/injection context/i);
  });
});
