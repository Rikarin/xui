import { Meta, StoryObj } from '@storybook/angular-vite';

/**
 * Reference sheet for the token layer defined in `libs/core/styles/theme.css`
 * (published as `@xui/core/styles/theme.css`).
 *
 * Every swatch below is rendered with the same semantic utility a component
 * would use, so this page doubles as a regression check: if a token is renamed
 * or dropped, its swatch collapses to a transparent box.
 */
const meta: Meta = {
  title: 'Foundations/Design tokens'
};

export default meta;
type Story = StoryObj;

const INTENTS = ['primary', 'secondary', 'success', 'error', 'warning', 'info'] as const;
const INTENT_STEPS = ['', '-darker', '-lighter', '-subtle', '-muted', '-emphasis'] as const;

function swatch(token: string, utility: string, note = ''): string {
  return `
    <div class="flex flex-col gap-1">
      <div class="h-12 rounded-md border border-border ${utility}"></div>
      <code class="text-xs text-foreground-muted">${token}</code>
      ${note ? `<span class="text-xs text-foreground-subtle">${note}</span>` : ''}
    </div>`;
}

function section(title: string, body: string): string {
  return `
    <section class="mb-10">
      <h2 class="mb-1 text-lg font-semibold text-foreground">${title}</h2>
      <div class="mb-4 h-px bg-border"></div>
      ${body}
    </section>`;
}

function grid(children: string, cols = 'sm:grid-cols-3 lg:grid-cols-6'): string {
  return `<div class="grid grid-cols-2 gap-4 ${cols}">${children}</div>`;
}

const surfaces = grid(
  [
    swatch('background', 'bg-background'),
    swatch('surface', 'bg-surface'),
    swatch('surface-raised', 'bg-surface-raised'),
    swatch('surface-overlay', 'bg-surface-overlay'),
    swatch('surface-sunken', 'bg-surface-sunken'),
    swatch('surface-inset', 'bg-surface-inset'),
    swatch('muted', 'bg-muted'),
    swatch('muted-foreground', 'bg-muted-foreground')
  ].join('')
);

const text = `
  <div class="flex flex-col gap-2 rounded-md border border-border bg-surface p-4">
    <p class="text-foreground">foreground — primary body copy</p>
    <p class="text-foreground-muted">foreground-muted — secondary copy, table headers</p>
    <p class="text-foreground-subtle">foreground-subtle — hints, placeholders, disabled</p>
    <p class="rounded bg-primary px-2 py-1 text-foreground-on-emphasis">
      foreground-on-emphasis — copy on a saturated fill
    </p>
    <a href="#" class="text-link hover:text-link-hover w-fit underline underline-offset-4">link / link-hover</a>
  </div>`;

const borders = grid(
  [
    swatch('border', 'bg-border'),
    swatch('border-muted', 'bg-border-muted'),
    swatch('border-strong', 'bg-border-strong')
  ].join('')
);

const intents = INTENTS.map(
  intent => `
    <div class="mb-6">
      <h3 class="mb-2 font-mono text-sm text-foreground-muted">${intent}</h3>
      ${grid(
        [
          ...INTENT_STEPS.map(step => swatch(`${intent}${step}`, `bg-${intent}${step}`)),
          swatch(`${intent}-foreground`, `bg-${intent}-foreground`)
        ].join(''),
        'sm:grid-cols-4 lg:grid-cols-7'
      )}
      <div class="mt-2 flex flex-wrap gap-2">
        <span class="rounded-md bg-${intent} px-3 py-1 text-sm text-${intent}-foreground">solid</span>
        <span class="rounded-md border border-${intent}-muted bg-${intent}-subtle px-3 py-1 text-sm text-${intent}-emphasis">
          subtle + muted border + emphasis text
        </span>
      </div>
    </div>`
).join('');

const state = `
  ${grid(
    [
      swatch('focus', 'bg-focus'),
      swatch('selection', 'bg-selection'),
      swatch('hover-overlay', 'bg-hover-overlay'),
      swatch('active-overlay', 'bg-active-overlay')
    ].join(''),
    'sm:grid-cols-4'
  )}
  <p class="mt-3 text-sm text-foreground-muted">
    Try selecting this sentence to see <code>--selection</code> applied.
  </p>`;

const elevation = grid(
  [0, 1, 2, 3, 4]
    .map(
      level => `
        <div class="flex flex-col gap-1">
          <div class="flex h-20 items-center justify-center rounded-lg bg-surface-raised shadow-elevation-${level}">
            <span class="text-sm text-foreground-muted">${level}</span>
          </div>
          <code class="text-xs text-foreground-muted">shadow-elevation-${level}</code>
        </div>`
    )
    .join('') +
    `<div class="flex flex-col gap-1">
      <div class="flex h-20 items-center justify-center rounded-lg bg-surface-overlay shadow-overlay">
        <span class="text-sm text-foreground-muted">overlay</span>
      </div>
      <code class="text-xs text-foreground-muted">shadow-overlay</code>
    </div>`,
  'sm:grid-cols-3 lg:grid-cols-6'
);

const typography = `
  <div class="flex flex-col gap-2 rounded-md border border-border bg-surface p-4">
    <p class="text-xs">text-xs</p>
    <p class="text-sm">text-sm</p>
    <p class="text-md">text-md — xUI addition, sits between sm and base</p>
    <p class="text-base">text-base</p>
    <p class="text-lg">text-lg</p>
  </div>`;

export const All: Story = {
  render: () => ({
    template: `
      <div class="max-w-5xl">
        ${section('Surfaces', surfaces)}
        ${section('Text', text)}
        ${section('Borders', borders)}
        ${section('Intents', intents)}
        ${section('Interaction state', state)}
        ${section('Elevation', elevation)}
        ${section('Typography', typography)}
      </div>`
  })
};

/**
 * The light and dark token sets are scoped by class, not only by `:root`, so a
 * subtree can opt into the opposite theme. Both panels below are rendered inside
 * the same document — if scoping regresses, they render identically.
 */
export const LightAndDark: Story = {
  render: () => {
    const panel = (theme: 'light' | 'dark') => `
      <div class="${theme} flex-1 rounded-lg border border-border bg-background p-4">
        <h3 class="mb-3 font-semibold text-foreground">${theme}</h3>
        ${grid(
          [
            swatch('background', 'bg-background'),
            swatch('surface-raised', 'bg-surface-raised'),
            swatch('muted', 'bg-muted'),
            swatch('border', 'bg-border')
          ].join(''),
          'sm:grid-cols-4'
        )}
        <div class="mt-4 flex flex-wrap gap-2">
          ${INTENTS.map(
            intent =>
              `<span class="rounded-md border border-${intent}-muted bg-${intent}-subtle px-3 py-1 text-sm text-${intent}-emphasis">${intent}</span>`
          ).join('')}
        </div>
        <div class="mt-4 flex h-16 items-center justify-center rounded-lg bg-surface-overlay shadow-overlay text-sm text-foreground-muted">
          shadow-overlay
        </div>
      </div>`;

    return {
      template: `<div class="flex max-w-5xl flex-col gap-4 md:flex-row">${panel('light')}${panel('dark')}</div>`
    };
  }
};
