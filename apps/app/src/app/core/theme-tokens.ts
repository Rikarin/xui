/**
 * What the theme builder lets you edit.
 *
 * Only the tokens a theme actually *declares* are here. The derived steps of each intent —
 * `-darker`, `-lighter`, `-subtle`, `-muted`, `-emphasis` — are computed by `theme.css` with
 * `oklch()` and `color-mix()`, so they follow whatever you set the base to and would be wrong to
 * expose as separate knobs. Elevation and motion are left out for the same reason a colour picker
 * is the wrong control for a box-shadow: the theming page documents them for hand-editing.
 */

export type ThemeScope = 'light' | 'dark';

export interface ColourToken {
  /** Token name without the leading `--`. */
  name: string;
  label: string;
}

export interface ColourGroup {
  key: string;
  label: string;
  blurb: string;
  tokens: ColourToken[];
}

export const COLOUR_GROUPS: ColourGroup[] = [
  {
    key: 'intents',
    label: 'Intents',
    blurb: 'Six meanings. Each base colour drives a whole derived ramp — hover, border, badge, callout.',
    tokens: [
      { name: 'primary', label: 'Primary' },
      { name: 'primary-foreground', label: 'Primary text' },
      { name: 'secondary', label: 'Secondary' },
      { name: 'secondary-foreground', label: 'Secondary text' },
      { name: 'success', label: 'Success' },
      { name: 'success-foreground', label: 'Success text' },
      { name: 'error', label: 'Error' },
      { name: 'error-foreground', label: 'Error text' },
      { name: 'warning', label: 'Warning' },
      { name: 'warning-foreground', label: 'Warning text' },
      { name: 'info', label: 'Info' },
      { name: 'info-foreground', label: 'Info text' }
    ]
  },
  {
    key: 'surfaces',
    label: 'Surfaces',
    blurb: 'Backgrounds in depth order. `background` is the page, `surface` sits on it, `surface-raised` on that.',
    tokens: [
      { name: 'background', label: 'Background' },
      { name: 'surface', label: 'Surface' },
      { name: 'surface-raised', label: 'Surface raised' },
      { name: 'surface-overlay', label: 'Surface overlay' },
      { name: 'surface-sunken', label: 'Surface sunken' },
      { name: 'surface-inset', label: 'Surface inset' },
      { name: 'muted', label: 'Muted' },
      { name: 'muted-foreground', label: 'Muted text' }
    ]
  },
  {
    key: 'text',
    label: 'Text',
    blurb: 'Foreground colours by emphasis, not by shade.',
    tokens: [
      { name: 'foreground', label: 'Foreground' },
      { name: 'foreground-muted', label: 'Muted' },
      { name: 'foreground-subtle', label: 'Subtle' },
      { name: 'foreground-on-emphasis', label: 'On emphasis' }
    ]
  },
  {
    key: 'borders',
    label: 'Borders',
    blurb: 'Divider and outline colours.',
    tokens: [
      { name: 'border', label: 'Border' },
      { name: 'border-muted', label: 'Border muted' },
      { name: 'border-strong', label: 'Border strong' }
    ]
  },
  {
    key: 'state',
    label: 'Interaction',
    blurb: 'The focus ring and links. The hover and selection overlays are alpha mixes — edit those by hand.',
    tokens: [
      { name: 'focus', label: 'Focus ring' },
      { name: 'link', label: 'Link' },
      { name: 'link-hover', label: 'Link hover' }
    ]
  },
  {
    key: 'charts',
    label: 'Data visualisation',
    blurb:
      'Eight categorical slots in a fixed order. The order is the colour-blind-safety mechanism — re-hue them if you must, but keep adjacent slots far apart.',
    tokens: [
      { name: 'chart-1', label: 'Series 1' },
      { name: 'chart-2', label: 'Series 2' },
      { name: 'chart-3', label: 'Series 3' },
      { name: 'chart-4', label: 'Series 4' },
      { name: 'chart-5', label: 'Series 5' },
      { name: 'chart-6', label: 'Series 6' },
      { name: 'chart-7', label: 'Series 7' },
      { name: 'chart-8', label: 'Series 8' }
    ]
  }
];

export const COLOUR_TOKENS: ColourToken[] = COLOUR_GROUPS.flatMap(group => group.tokens);

/**
 * Density is one scale for everything you click or type into, and it is declared once rather than
 * per theme — a control is not a different height in the dark.
 */
export interface DensityToken {
  name: string;
  label: string;
  /** Bounds in pixels; the emitted value is rem, which is what `theme.css` declares. */
  min: number;
  max: number;
  step: number;
}

export const DENSITY_TOKENS: DensityToken[] = [
  { name: 'control-height-sm', label: 'Height — small', min: 18, max: 40, step: 1 },
  { name: 'control-height-md', label: 'Height — default', min: 24, max: 48, step: 1 },
  { name: 'control-height-lg', label: 'Height — large', min: 32, max: 64, step: 1 },
  { name: 'control-padding-sm', label: 'Padding — small', min: 2, max: 20, step: 1 },
  { name: 'control-padding-md', label: 'Padding — default', min: 4, max: 28, step: 1 },
  { name: 'control-padding-lg', label: 'Padding — large', min: 6, max: 36, step: 1 }
];

export interface ThemePreset {
  key: string;
  label: string;
  blurb: string;
  light: Record<string, string>;
  dark: Record<string, string>;
}

/**
 * Starting points, not destinations. Each one is a handful of declarations — which is the argument
 * the theming page makes, made clickable.
 *
 * Every accent preset flips its label colour in the dark scope. A colour bright enough to read as
 * an accent on a near-black page is too bright to carry white text, so the dark half pairs a light
 * fill with ink; taking the light scope's colours straight across would ship a solid button that
 * fails at 4.23:1. The contrast table below the preview is where that shows up.
 */
export const PRESETS: ThemePreset[] = [
  {
    key: 'violet',
    label: 'Violet',
    blurb: 'One intent moved. Everything derived from it follows.',
    light: {
      primary: '#7c3aed',
      'primary-foreground': '#ffffff',
      focus: '#7c3aed',
      link: '#6d28d9',
      'link-hover': '#5b21b6'
    },
    dark: {
      primary: '#a78bfa',
      'primary-foreground': '#09090b',
      focus: '#a78bfa',
      link: '#c4b5fd',
      'link-hover': '#ddd6fe'
    }
  },
  {
    key: 'emerald',
    label: 'Emerald',
    blurb: 'A green primary next to the green success intent — worth checking they stay distinct.',
    light: {
      primary: '#047857',
      'primary-foreground': '#ffffff',
      focus: '#047857',
      link: '#047857',
      'link-hover': '#065f46'
    },
    dark: {
      primary: '#34d399',
      'primary-foreground': '#09090b',
      focus: '#34d399',
      link: '#6ee7b7',
      'link-hover': '#a7f3d0'
    }
  },
  {
    key: 'rose',
    label: 'Rose',
    blurb: 'A warm primary. Note how close it lands to the error intent.',
    light: {
      primary: '#be123c',
      'primary-foreground': '#ffffff',
      focus: '#be123c',
      link: '#be123c',
      'link-hover': '#9f1239'
    },
    dark: {
      primary: '#fb7185',
      'primary-foreground': '#09090b',
      focus: '#fb7185',
      link: '#fda4af',
      'link-hover': '#fecdd3'
    }
  },
  {
    key: 'slate',
    label: 'Cool slate',
    blurb: 'The neutrals re-based from zinc to slate, which tints every surface and border.',
    light: {
      background: '#ffffff',
      surface: '#ffffff',
      'surface-raised': '#ffffff',
      'surface-overlay': '#ffffff',
      'surface-sunken': '#f8fafc',
      'surface-inset': '#f8fafc',
      muted: '#f1f5f9',
      'muted-foreground': '#64748b',
      foreground: '#020617',
      'foreground-muted': '#334155',
      'foreground-subtle': '#64748b',
      border: '#e2e8f0',
      'border-muted': '#f1f5f9',
      'border-strong': '#cbd5e1'
    },
    dark: {
      background: '#020617',
      surface: '#0f172a',
      'surface-raised': '#0f172a',
      'surface-overlay': '#1e293b',
      'surface-sunken': '#000000',
      'surface-inset': '#0f172a',
      muted: '#1e293b',
      'muted-foreground': '#94a3b8',
      foreground: '#f1f5f9',
      'foreground-muted': '#94a3b8',
      'foreground-subtle': '#64748b',
      border: '#334155',
      'border-muted': '#1e293b',
      'border-strong': '#475569'
    }
  }
];

export interface ContrastPair {
  label: string;
  /** Token names, without the leading `--`. */
  foreground: string;
  background: string;
  /** WCAG 2.2 minimum: 4.5 for body text, 3 for large text and non-text UI. */
  min: number;
}

/**
 * The pairs worth failing over. Every one of them is a combination the library actually renders —
 * a solid button's label on its own fill, body copy on the page, the focus ring against the page.
 */
export const CONTRAST_PAIRS: ContrastPair[] = [
  { label: 'Body text', foreground: 'foreground', background: 'background', min: 4.5 },
  { label: 'Muted text', foreground: 'foreground-muted', background: 'background', min: 4.5 },
  { label: 'Subtle text', foreground: 'foreground-subtle', background: 'surface', min: 4.5 },
  { label: 'Muted surface text', foreground: 'muted-foreground', background: 'muted', min: 4.5 },
  { label: 'Link', foreground: 'link', background: 'background', min: 4.5 },
  { label: 'Primary button', foreground: 'primary-foreground', background: 'primary', min: 4.5 },
  { label: 'Secondary button', foreground: 'secondary-foreground', background: 'secondary', min: 4.5 },
  { label: 'Success button', foreground: 'success-foreground', background: 'success', min: 4.5 },
  { label: 'Error button', foreground: 'error-foreground', background: 'error', min: 4.5 },
  { label: 'Warning button', foreground: 'warning-foreground', background: 'warning', min: 4.5 },
  { label: 'Info button', foreground: 'info-foreground', background: 'info', min: 4.5 },
  // 1.4.11 covers the visual boundary of a control, which is what `--border` draws on an input.
  { label: 'Input border', foreground: 'border', background: 'background', min: 3 },
  { label: 'Focus ring', foreground: 'focus', background: 'background', min: 3 }
];
