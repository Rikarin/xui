import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  afterNextRender,
  computed,
  signal,
  viewChild
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  matArrowForwardRound,
  matCheckRound,
  matChevronRightRound,
  matExtensionRound,
  matSmartToyRound,
  matTerminalRound
} from '@ng-icons/material-icons/round';
import { XuiAvatarImports } from '@xui/avatar';
import { XuiButtonImports } from '@xui/button';
import { XuiCheckboxImports } from '@xui/checkbox';
import { XuiDatePickerImports } from '@xui/date-picker';
import { XuiIconImports } from '@xui/icon';
import { XuiInputImports } from '@xui/input';
import { XuiInputOtpImports } from '@xui/input-otp';
import { XuiKbdImports } from '@xui/kbd';
import { XuiLabelImports } from '@xui/label';
import { XuiProgressBarImports } from '@xui/progress-bar';
import { XuiRateImports } from '@xui/rate';
import { XuiSegmentedControlImports, type XuiSegmentedOption } from '@xui/segmented-control';
import { XuiSliderImports } from '@xui/slider';
import { XuiStatusImports } from '@xui/status';
import { XuiStepsImports } from '@xui/steps';
import { XuiSwitchImports } from '@xui/switch';
import { XuiTableImports } from '@xui/table';
import { XuiTabsImports } from '@xui/tabs';
import { XuiTagImports } from '@xui/tag';
import { XuiTextImports } from '@xui/text';
import { COMPONENTS, GROUPS, VERSION } from '../../generated/manifest';
import { SiteFooter } from '../layout/site-footer';
import { SiteHeader } from '../layout/site-header';
import { CodeBlock } from '../shared/code-block';

/** What the library is built on. Dependencies, not endorsements, so the strip stays factual. */
const BUILT_ON = ['Angular 22', 'Tailwind CSS 4', 'Angular CDK', 'class-variance-authority', 'tailwind-merge'];

const INSTALL = `ng add @xui/core
pnpm add @xui/button @xui/dialog @xui/icon`;

const USAGE = `import { Component } from '@angular/core';
import { XuiButtonImports } from '@xui/button';

@Component({
  selector: 'app-example',
  imports: [XuiButtonImports],
  template: \`
    <button xuiButton color="primary">Save changes</button>
    <button xuiButton variant="outline">Cancel</button>
  \`
})
export class Example {}`;

const PACKAGES = `pnpm add @xui/button
pnpm add @xui/date-picker
pnpm add @xui/data-table
# three packages, three components`;

const MCP_CONFIG = `{
  "mcpServers": {
    "xui": {
      "command": "npx",
      "args": ["-y", "@xui/mcp"]
    }
  }
}`;

const SKILL_INSTALL = `npx degit Rikarin/xui/skills/xui .claude/skills/xui`;

/** The server's tools, named as they are registered. Kept in step with the AI agents page. */
const MCP_TOOLS = [
  ['xui_components_list', 'every package, with its group'],
  ['xui_components_get', 'selectors, signal inputs, variant axes'],
  ['xui_components_search', 'find a package by what it does'],
  ['xui_examples_get', 'the maintained Storybook examples'],
  ['xui_tokens_list', 'the tokens, light and dark values'],
  ['xui_docs_get', 'one guide page in full']
];

const DENSITIES: XuiSegmentedOption[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'cozy', label: 'Cozy' },
  { value: 'comfortable', label: 'Comfortable' }
];

const THEMES: XuiSegmentedOption<'dark' | 'light'>[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' }
];

/** Primary hues for the theming stage. The first is the library's own default. */
const HUES = [
  { name: 'Blue', value: 'oklch(55.88% 0.154 252.84)' },
  { name: 'Violet', value: 'oklch(56% 0.2 295)' },
  { name: 'Rose', value: 'oklch(60% 0.2 10)' },
  { name: 'Amber', value: 'oklch(72% 0.16 70)' },
  { name: 'Emerald', value: 'oklch(62% 0.15 160)' }
];

/** Synthetic rows for the table demo; the names are people, not customers. */
const PEOPLE = [
  { name: 'Ada Lovelace', role: 'Owner', presence: 'online' },
  { name: 'Alan Turing', role: 'Admin', presence: 'idle' },
  { name: 'Grace Hopper', role: 'Editor', presence: 'dnd' },
  { name: 'Edsger Dijkstra', role: 'Viewer', presence: 'offline' },
  { name: 'Barbara Liskov', role: 'Editor', presence: 'online' },
  { name: 'Donald Knuth', role: 'Viewer', presence: 'idle' }
] as const;

const STRATEGIES: XuiSegmentedOption[] = [
  { value: 'canary', label: 'Canary' },
  { value: 'blue-green', label: 'Blue-green' },
  { value: 'all', label: 'All at once' }
];

@Component({
  selector: 'docs-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    NgIcon,
    XuiIconImports,
    XuiAvatarImports,
    XuiButtonImports,
    XuiCheckboxImports,
    XuiDatePickerImports,
    XuiInputImports,
    XuiInputOtpImports,
    XuiKbdImports,
    XuiLabelImports,
    XuiProgressBarImports,
    XuiRateImports,
    XuiSegmentedControlImports,
    XuiSliderImports,
    XuiStatusImports,
    XuiStepsImports,
    XuiSwitchImports,
    XuiTableImports,
    XuiTabsImports,
    XuiTagImports,
    XuiTextImports,
    SiteHeader,
    SiteFooter,
    CodeBlock
  ],
  providers: [
    provideIcons({
      matArrowForwardRound,
      matCheckRound,
      matChevronRightRound,
      matExtensionRound,
      matSmartToyRound,
      matTerminalRound
    })
  ],
  // The page is pinned to its own black theme; `.dark` supplies the tokens and `.landing` moves
  // the ground to true black. `bg-background` here, not on `body`, so the docs stay on theirs.
  host: { class: 'landing dark bg-background text-foreground block min-h-svh' },
  template: `
    <docs-site-header variant="landing" />

    <main id="main" class="overflow-x-clip">
      <!-- ---------------------------------------------------------------- hero -->
      <section class="relative">
        <div class="landing-glow pointer-events-none absolute inset-x-0 top-0 h-[40rem]" aria-hidden="true"></div>

        <div class="relative mx-auto max-w-4xl px-4 pt-20 pb-12 text-center sm:px-6 sm:pt-28">
          <a routerLink="/docs/getting-started" class="landing-pill landing-rise" style="--i: 0">
            xUI {{ version }} · Angular 22 · Tailwind CSS 4
            <ng-icon xui name="matChevronRightRound" size="1rem" class="text-foreground-muted" />
          </a>

          <h1
            class="landing-display landing-gradient landing-rise mt-7 text-[2.75rem] sm:text-6xl md:text-7xl"
            style="--i: 1"
          >
            Angular components, one package each.
          </h1>

          <p class="landing-rise text-foreground-muted mx-auto mt-6 max-w-3xl text-lg sm:text-xl" style="--i: 2">
            {{ componentCount }} components styled with Tailwind CSS 4, from a button to a dock manager. Signal inputs,
            zoneless change detection, and light and dark as one CSS variable rather than a fork.
          </p>

          <div class="landing-rise mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row" style="--i: 3">
            <a routerLink="/docs/getting-started" class="landing-cta">
              Get started
              <ng-icon xui name="matArrowForwardRound" size="1.25rem" />
            </a>
            <a
              xuiButton
              variant="ghost"
              size="lg"
              color="secondary"
              routerLink="/docs/components"
              class="text-foreground-muted hover:text-foreground h-14 rounded-xl px-5 text-base"
            >
              Browse the {{ componentCount }} components
            </a>
          </div>

          <p class="landing-rise text-foreground-subtle mt-7 text-sm" style="--i: 4">
            Already have a workspace? <kbd xuiKbd>ng add &#64;xui/core</kbd> wires the stylesheet for you.
          </p>
        </div>
      </section>

      <!-- ----------------------------------------------------- showcase strip -->
      <section aria-labelledby="showcase-heading" class="landing-rise pb-6" style="--i: 5">
        <h2 id="showcase-heading" class="sr-only">Live components</h2>

        <div #strip class="landing-strip px-4 sm:px-6">
          <!-- Settings -->
          <article class="landing-card flex w-[19rem] flex-col p-5">
            <p xuiText weight="medium" size="sm" class="mb-4">Workspace settings</p>

            <label xuiLabel class="grid gap-1.5 text-sm">
              Name
              <input xuiInput value="Acme Design" aria-label="Workspace name" />
            </label>

            <div class="mt-4 flex flex-col gap-3">
              <div class="flex items-center justify-between gap-3 text-sm">
                <span id="notifications-label">Email notifications</span>
                <xui-switch [(checked)]="notifications" aria-labelledby="notifications-label" />
              </div>
              <div class="flex items-center justify-between gap-3 text-sm">
                <span id="two-factor-label">Two-factor sign-in</span>
                <xui-switch [(checked)]="twoFactor" aria-labelledby="two-factor-label" />
              </div>
              <xui-checkbox label="Remember this device" [(checked)]="remember" />
            </div>

            <div class="mt-4 grid gap-1.5">
              <span xuiText color="muted" size="sm">Density</span>
              <xui-segmented-control fill size="sm" [options]="densities" [(value)]="density" aria-label="Density" />
            </div>

            <div class="mt-auto flex gap-2 pt-5">
              <button xuiButton size="sm" type="button">Save changes</button>
              <button xuiButton size="sm" variant="outline" color="secondary" type="button">Cancel</button>
            </div>
          </article>

          <!-- Calendar -->
          <article class="landing-card flex w-[19rem] flex-col p-5">
            <p xuiText weight="medium" size="sm" class="mb-4">Pick a release date</p>
            <xui-date-picker [(value)]="releaseDate" showActionsBar class="mx-auto" />
            <p xuiText color="muted" size="sm" class="mt-auto pt-4 tabular-nums">
              {{ releaseDate() ? releaseDate()!.toDateString() : 'Nothing selected' }}
            </p>
          </article>

          <!-- Table -->
          <article class="landing-card flex w-[22rem] flex-col p-5">
            <div class="mb-4 flex items-center justify-between">
              <p xuiText weight="medium" size="sm">Members</p>
              <xui-tag minimal round>{{ people.length }}</xui-tag>
            </div>
            <xui-table compact interactive striped class="w-full">
              <xui-tr>
                <xui-th class="grow">Name</xui-th>
                <xui-th class="w-20">Role</xui-th>
              </xui-tr>
              @for (person of people; track person.name) {
                <xui-tr>
                  <xui-td class="grow">
                    <span class="flex items-center gap-2">
                      <xui-status [presence]="person.presence" size="sm" />
                      {{ person.name }}
                    </span>
                  </xui-td>
                  <xui-td class="w-20">{{ person.role }}</xui-td>
                </xui-tr>
              }
            </xui-table>
            <div class="mt-auto flex items-center justify-between pt-4">
              <xui-avatar-group [max]="3" size="sm">
                @for (person of people; track person.name) {
                  <xui-avatar [text]="initials(person.name)" [alt]="person.name" />
                }
              </xui-avatar-group>
              <button xuiButton size="sm" variant="outline" color="secondary" type="button">Invite</button>
            </div>
          </article>

          <!-- Rollout -->
          <article class="landing-card flex w-[21rem] flex-col p-5">
            <p xuiText weight="medium" size="sm" class="mb-5">Rollout</p>
            <xui-steps [(current)]="step" clickable>
              <xui-step title="Build" />
              <xui-step title="Test" />
              <xui-step title="Release" />
            </xui-steps>

            <div class="mt-6 grid gap-1.5">
              <div class="flex items-center justify-between text-sm">
                <span xuiText color="muted" size="sm">Traffic</span>
                <span class="tabular-nums">{{ traffic() }}%</span>
              </div>
              <xui-slider [min]="0" [max]="100" [stepSize]="5" [labelRenderer]="noLabels" [(value)]="traffic" />
              <xui-progress-bar
                [value]="traffic() / 100"
                [stripes]="false"
                size="sm"
                class="mt-1"
                aria-label="Rollout progress"
              />
            </div>

            <div class="mt-5 grid gap-1.5">
              <span xuiText color="muted" size="sm">Strategy</span>
              <xui-segmented-control fill size="sm" [options]="strategies" [(value)]="strategy" aria-label="Strategy" />
            </div>
            <div class="mt-4"><xui-checkbox label="Halt on elevated error rate" [(checked)]="halt" /></div>

            <div class="mt-auto flex flex-wrap gap-1.5 pt-5">
              <xui-tag minimal color="success" icon="matCheckRound">Build passed</xui-tag>
              <xui-tag minimal [color]="traffic() === 100 ? 'success' : 'primary'">
                {{ traffic() === 100 ? 'Fully live' : 'Canary' }}
              </xui-tag>
            </div>
          </article>

          <!-- Verify -->
          <article class="landing-card flex w-[19rem] flex-col p-5">
            <p xuiText weight="medium" size="sm" class="mb-1">Verify it's you</p>
            <p xuiText color="muted" size="sm" class="mb-4">Enter the six digits we sent.</p>
            <xui-input-otp [length]="6" [(value)]="otp" />
            <p xuiText color="subtle" size="sm" class="mt-3 tabular-nums">
              {{ otp().length }} / 6 · {{ otp().length === 6 ? 'ready to submit' : 'waiting' }}
            </p>

            <div class="mt-auto pt-5">
              <span xuiText color="muted" size="sm">How was that?</span>
              <div class="mt-1 flex items-center gap-3">
                <xui-rate [(value)]="score" allowHalf aria-label="Rate the experience" />
                <span class="text-foreground-subtle text-sm tabular-nums">{{ score() || '—' }}</span>
              </div>
            </div>
          </article>
        </div>

        <!-- Group chips, the reference's category row under its gallery. -->
        <nav
          aria-label="Component groups"
          class="mx-auto flex max-w-5xl flex-wrap justify-center gap-2 px-4 pt-4 sm:px-6"
        >
          @for (group of groups; track group.name) {
            <a
              routerLink="/docs/components"
              [fragment]="group.anchor"
              class="text-foreground-muted hover:text-foreground inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sm no-underline transition-colors hover:border-white/20"
            >
              {{ group.name }}
              <span class="text-foreground-subtle tabular-nums">{{ group.count }}</span>
            </a>
          }
        </nav>
      </section>

      <!-- ------------------------------------------------------------ built on -->
      <section aria-label="Built on" class="mx-auto max-w-5xl px-4 pt-16 pb-4 sm:px-6">
        <ul
          class="text-foreground-subtle flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium"
        >
          @for (dep of builtOn; track dep) {
            <li>{{ dep }}</li>
          }
        </ul>
      </section>

      <!-- ------------------------------------------------------------ pillars -->
      <section aria-labelledby="pillars-heading" class="mx-auto max-w-[100rem] px-4 pt-20 sm:px-6 sm:pt-28">
        <div class="mx-auto max-w-3xl text-center">
          <h2 id="pillars-heading" class="landing-display landing-gradient text-4xl sm:text-5xl md:text-6xl">
            A component library tailored for Angular
          </h2>
          <p class="text-foreground-muted mx-auto mt-5 max-w-2xl text-lg">
            Directives and standalone components you compose, not a monolith you configure. Every axis typed, every
            colour a token, every keyboard contract from the CDK.
          </p>
        </div>

        <div class="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <!-- One package per component -->
          <article class="landing-card flex flex-col overflow-hidden">
            <div class="min-h-[13.5rem] border-b border-white/[0.06] bg-black/40 p-4">
              <docs-code [code]="packages" lang="bash" />
            </div>
            <div class="flex flex-1 flex-col p-6">
              <h3 class="text-xl font-semibold">One package per component</h3>
              <p xuiText color="muted" size="sm" class="mt-2">
                Install <code xuiCode>&#64;xui/button</code> and you ship a button, not a library. Each package exports
                an imports barrel for standalone components.
              </p>
            </div>
          </article>

          <!-- Typed variants that merge -->
          <article class="landing-card flex flex-col overflow-hidden">
            <div class="flex min-h-[13.5rem] flex-col gap-3 border-b border-white/[0.06] bg-black/40 p-5">
              <div class="flex flex-wrap gap-2">
                <button xuiButton size="sm" type="button">Default</button>
                <button xuiButton size="sm" variant="outline" type="button">Outline</button>
                <button xuiButton size="sm" variant="dash" type="button">Dash</button>
                <button xuiButton size="sm" variant="ghost" type="button">Ghost</button>
                <button xuiButton size="sm" variant="link" type="button">Link</button>
              </div>
              <div class="flex flex-wrap gap-2">
                <button xuiButton size="sm" color="secondary" type="button">Secondary</button>
                <button xuiButton size="sm" color="success" type="button">Success</button>
                <button xuiButton size="sm" color="warning" type="button">Warning</button>
                <button xuiButton size="sm" color="error" type="button">Error</button>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button xuiButton size="sm" variant="outline" class="rounded-full" type="button">Follow</button>
                <button xuiButton size="sm" loading type="button">Saving</button>
                <button xuiButton size="sm" active type="button">Pressed</button>
                <span class="text-foreground-subtle text-xs">class="rounded-full" wins</span>
              </div>
            </div>
            <div class="flex flex-1 flex-col p-6">
              <h3 class="text-xl font-semibold">Typed variants that merge</h3>
              <p xuiText color="muted" size="sm" class="mt-2">
                Every visual axis is a typed input backed by CVA, and the <code xuiCode>class</code> input merges
                through tailwind-merge, so your utility wins instead of fighting the component's.
              </p>
            </div>
          </article>

          <!-- Signals, OnPush, zoneless -->
          <article class="landing-card flex flex-col overflow-hidden">
            <div class="min-h-[13.5rem] border-b border-white/[0.06] bg-black/40 p-5">
              <div class="flex items-center justify-between text-sm">
                <span xuiText color="muted" size="sm">Opacity</span>
                <span class="tabular-nums">{{ opacity() }}%</span>
              </div>
              <xui-slider
                [min]="0"
                [max]="100"
                [stepSize]="1"
                [labelRenderer]="noLabels"
                [(value)]="opacity"
                class="mt-1"
              />
              <div class="mt-4 flex items-center gap-3">
                <div
                  class="bg-primary h-10 w-10 shrink-0 rounded-xl transition-opacity"
                  [style.opacity]="opacity() / 100"
                  aria-hidden="true"
                ></div>
                <code xuiCode class="text-xs">opacity = signal({{ opacity() }})</code>
              </div>
              <p class="text-foreground-subtle mt-3 text-xs">One signal, three reads, no zone.js in the bundle.</p>
            </div>
            <div class="flex flex-1 flex-col p-6">
              <h3 class="text-xl font-semibold">Signals, OnPush, zoneless</h3>
              <p xuiText color="muted" size="sm" class="mt-2">
                Signal inputs and two-way models throughout. No zone.js, no change-detection tax for the parts of the
                page you are not touching.
              </p>
            </div>
          </article>

          <!-- Angular CDK underneath -->
          <article class="landing-card flex flex-col overflow-hidden">
            <div class="min-h-[13.5rem] border-b border-white/[0.06] bg-black/40 p-5">
              <xui-tabs animate [(selectedTabId)]="tab">
                <xui-tab id="overview" title="Overview">
                  <p class="text-foreground-muted pt-3 text-sm">Arrow keys move the focus, Home and End jump.</p>
                </xui-tab>
                <xui-tab id="focus" title="Focus">
                  <p class="text-foreground-muted pt-3 text-sm">One tab stop for the whole list: roving tabindex.</p>
                </xui-tab>
                <xui-tab id="rtl" title="RTL">
                  <p class="text-foreground-muted pt-3 text-sm">Direction-aware, from the CDK's bidi service.</p>
                </xui-tab>
              </xui-tabs>
              <p class="text-foreground-subtle mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                Try <kbd xuiKbd>←</kbd> <kbd xuiKbd>→</kbd> <kbd xuiKbd>Home</kbd> <kbd xuiKbd>End</kbd>
              </p>
            </div>
            <div class="flex flex-1 flex-col p-6">
              <h3 class="text-xl font-semibold">Angular CDK underneath</h3>
              <p xuiText color="muted" size="sm" class="mt-2">
                Overlays, focus traps, roving tabindex, typeahead and bidi come from the CDK, so keyboard behaviour is
                not reinvented per component.
              </p>
            </div>
          </article>
        </div>
      </section>

      <!-- ------------------------------------------------------------ theming -->
      <section aria-labelledby="theming-heading" class="relative mx-auto max-w-[100rem] px-4 pt-24 sm:px-6 sm:pt-32">
        <div class="mx-auto max-w-3xl text-center">
          <h2 id="theming-heading" class="landing-display landing-gradient-warm text-4xl sm:text-5xl md:text-6xl">
            Light and dark are one variable
          </h2>
          <p class="text-foreground-muted mx-auto mt-5 max-w-2xl text-lg">
            Components style themselves with <code xuiCode>bg-surface</code> and
            <code xuiCode>text-foreground-muted</code>. Put <code xuiCode>.light</code> or <code xuiCode>.dark</code> on
            any element and the subtree follows; re-colour an intent and every package picks it up.
          </p>
        </div>

        <div class="landing-card mt-12 grid overflow-hidden lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div class="flex min-w-0 flex-col gap-6 p-6 sm:p-8">
            <div class="grid gap-2">
              <span xuiText weight="medium" size="sm">Scheme</span>
              <xui-segmented-control [options]="themes" [(value)]="demoTheme" aria-label="Colour scheme" />
            </div>

            <div class="grid gap-2">
              <span xuiText weight="medium" size="sm" id="hue-label">Primary</span>
              <div role="radiogroup" aria-labelledby="hue-label" class="flex flex-wrap gap-2">
                @for (hue of hues; track hue.name) {
                  <button
                    type="button"
                    role="radio"
                    [attr.aria-checked]="demoHue() === hue.value"
                    [attr.aria-label]="hue.name"
                    [style.--swatch]="hue.value"
                    class="focus-visible:ring-focus h-9 w-9 rounded-full bg-[var(--swatch)] ring-offset-2 ring-offset-black transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:outline-none aria-checked:ring-2 aria-checked:ring-white"
                    (click)="demoHue.set(hue.value)"
                  ></button>
                }
              </div>
            </div>

            <div class="mt-auto">
              <p xuiText color="muted" size="sm" class="mb-2">The whole change, in CSS:</p>
              <docs-code [code]="themeCss()" lang="css" />
            </div>
          </div>

          <!-- The stage: a themed subtree inside the black page. -->
          <div class="relative min-h-[26rem] min-w-0 border-t border-white/[0.06] p-4 sm:p-6 lg:border-s lg:border-t-0">
            <div class="landing-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
            <div
              [class]="demoTheme()"
              [style.--primary]="demoHue()"
              class="bg-background text-foreground border-border relative mx-auto flex h-full w-full max-w-md min-w-0 flex-col rounded-2xl border p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] sm:p-6"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="text-lg font-semibold">Invite teammates</h3>
                  <p class="text-foreground-muted mt-1 text-sm">They'll get access to every project in Acme Design.</p>
                </div>
                <xui-avatar-group [max]="3" size="sm">
                  @for (person of people; track person.name) {
                    <xui-avatar [text]="initials(person.name)" [alt]="person.name" />
                  }
                </xui-avatar-group>
              </div>

              <label xuiLabel class="mt-6 grid gap-1.5 text-sm">
                Email addresses
                <input
                  xuiInput
                  class="w-full min-w-0"
                  placeholder="ada@example.com, alan@example.com"
                  aria-label="Email addresses"
                />
              </label>

              <div class="mt-4 flex flex-wrap gap-1.5">
                <xui-tag minimal color="primary">Editor</xui-tag>
                <xui-tag minimal>Can comment</xui-tag>
                <xui-tag minimal color="success">Verified domain</xui-tag>
              </div>

              <div class="mt-5 flex items-center justify-between gap-3 text-sm">
                <span id="welcome-label">Send a welcome message</span>
                <xui-switch [(checked)]="welcome" aria-labelledby="welcome-label" />
              </div>
              <div class="mt-3"><xui-checkbox label="Also add them to #design" [(checked)]="addToChannel" /></div>

              <div class="mt-6 grid gap-1.5">
                <div class="text-foreground-muted flex justify-between text-xs">
                  <span>Seats used</span><span class="tabular-nums">7 of 10</span>
                </div>
                <xui-progress-bar [value]="0.7" [stripes]="false" size="sm" aria-label="Seats used" />
              </div>

              <div class="mt-auto flex justify-end gap-2 pt-6">
                <button xuiButton variant="ghost" color="secondary" type="button">Cancel</button>
                <button xuiButton type="button">Send invites</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ------------------------------------------------------------- agents -->
      <section aria-labelledby="agents-heading" class="mx-auto max-w-[100rem] px-4 pt-24 sm:px-6 sm:pt-32">
        <div class="mx-auto max-w-3xl text-center">
          <h2 id="agents-heading" class="landing-display landing-gradient text-4xl sm:text-5xl md:text-6xl">
            Your coding agent gets the real API
          </h2>
          <p class="text-foreground-muted mx-auto mt-5 max-w-2xl text-lg">
            An assistant that has not been told about xUI invents plausible inputs that do not exist. The MCP server
            answers from the library sources, and the skill carries the conventions.
          </p>
        </div>

        <div class="mt-12 grid gap-4 lg:grid-cols-2">
          <article class="landing-card relative flex min-w-0 flex-col overflow-hidden p-6 sm:p-8">
            <div class="landing-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
            <div class="relative min-w-0">
              <h3 class="landing-gradient-cool text-xl font-semibold">MCP server</h3>
              <p xuiText color="muted" size="sm" class="mt-2 max-w-md">
                Every selector, signal input, two-way model, output and variant axis across all
                {{ packageCount }} packages, extracted from the decorated classes rather than a hand-kept list.
              </p>

              <div class="mt-6 overflow-hidden rounded-xl bg-black/60">
                <div class="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5 text-xs">
                  <span class="flex items-center gap-2 font-medium">
                    <ng-icon xui name="matSmartToyRound" size="1rem" class="text-primary" />
                    xui
                    <xui-tag minimal round class="text-[10px]">MCP</xui-tag>
                  </span>
                  <span class="text-foreground-muted flex items-center gap-2">
                    <xui-status presence="online" size="sm" />
                    stdio · {{ version }}
                  </span>
                </div>
                <ul class="divide-y divide-white/[0.06]">
                  @for (tool of mcpTools; track tool[0]) {
                    <li class="flex items-center gap-3 px-4 py-2.5 text-xs">
                      <code class="text-foreground shrink-0 font-mono">{{ tool[0] }}</code>
                      <span class="text-foreground-subtle truncate">{{ tool[1] }}</span>
                    </li>
                  }
                </ul>
              </div>

              <div class="mt-4">
                <docs-code [code]="mcpConfig" lang="json" />
              </div>
            </div>
          </article>

          <article class="landing-card relative flex min-w-0 flex-col overflow-hidden p-6 sm:p-8">
            <div class="landing-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
            <div class="relative flex min-w-0 flex-1 flex-col">
              <h3 class="landing-gradient-cool text-xl font-semibold">Agent skill</h3>
              <p xuiText color="muted" size="sm" class="mt-2 max-w-md">
                The server answers <em>what exists</em>; the skill carries <em>how to use it</em>. The three-layer
                architecture, the token rule, the imports barrels, all in one folder your editor discovers.
              </p>

              <ul class="mt-6 grid gap-3">
                @for (rule of skillRules; track rule) {
                  <li class="flex items-start gap-3 text-sm">
                    <span
                      class="bg-primary/15 text-primary mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    >
                      <ng-icon xui name="matCheckRound" size="0.875rem" />
                    </span>
                    <span class="text-foreground-muted">{{ rule }}</span>
                  </li>
                }
              </ul>

              <div class="mt-auto pt-6">
                <docs-code [code]="skillInstall" lang="bash" />
                <a
                  xuiButton
                  variant="ghost"
                  size="sm"
                  color="secondary"
                  routerLink="/docs/ai-agents"
                  class="text-foreground-muted hover:text-foreground -ms-2 mt-3"
                >
                  Read the agents guide
                  <ng-icon xui name="matArrowForwardRound" />
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- ------------------------------------------------------------ install -->
      <section aria-labelledby="install-heading" class="mx-auto max-w-[100rem] px-4 pt-24 sm:px-6 sm:pt-32">
        <div class="mx-auto max-w-3xl text-center">
          <h2 id="install-heading" class="landing-display landing-gradient text-4xl sm:text-5xl md:text-6xl">
            Two commands to the first component
          </h2>
          <p class="text-foreground-muted mx-auto mt-5 max-w-2xl text-lg">
            <code xuiCode>ng add</code> wires the stylesheet and the token layer. After that, every component is one
            more <code xuiCode>add</code>.
          </p>
        </div>

        <div class="mt-12 grid gap-4 lg:grid-cols-2">
          <article class="landing-card overflow-hidden">
            <div class="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3">
              <ng-icon xui name="matTerminalRound" size="1rem" class="text-foreground-muted" />
              <span xuiText weight="medium" size="sm">Install</span>
            </div>
            <div class="p-4"><docs-code [code]="install" lang="bash" /></div>
          </article>
          <article class="landing-card overflow-hidden">
            <div class="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3">
              <ng-icon xui name="matExtensionRound" size="1rem" class="text-foreground-muted" />
              <span xuiText weight="medium" size="sm">Use</span>
            </div>
            <div class="p-4"><docs-code [code]="usage" lang="ts" /></div>
          </article>
        </div>
      </section>

      <!-- ---------------------------------------------------------- catalogue -->
      <section aria-labelledby="catalogue-heading" class="mx-auto max-w-[100rem] px-4 pt-24 sm:px-6 sm:pt-32">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div class="max-w-2xl">
            <h2 id="catalogue-heading" class="landing-display landing-gradient text-start text-4xl sm:text-5xl">
              Everything in the box
            </h2>
            <p class="text-foreground-muted mt-4 text-lg">
              {{ componentCount }} styled packages and {{ coreCount }} headless entrypoints, grouped the way the
              Storybook is: from form controls to a dock manager and a node graph.
            </p>
          </div>
          <a
            xuiButton
            variant="outline"
            color="secondary"
            routerLink="/docs/components"
            class="shrink-0 rounded-full border-white/15 hover:border-white/25"
          >
            All components
            <ng-icon xui name="matArrowForwardRound" />
          </a>
        </div>

        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          @for (group of groups; track group.name) {
            <a
              routerLink="/docs/components"
              [fragment]="group.anchor"
              class="landing-card landing-card-interactive flex flex-col p-5 no-underline"
            >
              <div class="flex items-baseline justify-between gap-3">
                <h3 class="text-base font-semibold">{{ group.name }}</h3>
                <span class="text-foreground-subtle text-sm tabular-nums">{{ group.count }}</span>
              </div>
              <p class="text-foreground-muted mt-2 text-sm leading-relaxed">
                {{ group.sample }}
              </p>
            </a>
          }
        </div>
      </section>

      <!-- ------------------------------------------------------------- closer -->
      <section
        aria-labelledby="closer-heading"
        class="relative mx-auto max-w-[100rem] px-4 pt-24 pb-24 sm:px-6 sm:pt-32 sm:pb-32"
      >
        <div class="landing-card landing-glow relative overflow-hidden px-6 py-16 text-center sm:px-12 sm:py-24">
          <h2
            id="closer-heading"
            class="landing-display landing-gradient mx-auto max-w-3xl text-4xl sm:text-5xl md:text-6xl"
          >
            Ship the first component today
          </h2>
          <p class="text-foreground-muted mx-auto mt-5 max-w-xl text-lg">
            Apache 2.0, no paid tier, no design system to adopt wholesale. Add the packages you need and theme them
            once.
          </p>
          <div class="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a routerLink="/docs/getting-started" class="landing-cta">
              Get started
              <ng-icon xui name="matArrowForwardRound" size="1.25rem" />
            </a>
            <a
              xuiButton
              variant="ghost"
              size="lg"
              color="secondary"
              href="https://github.com/Rikarin/xui"
              rel="noreferrer noopener"
              target="_blank"
              class="text-foreground-muted hover:text-foreground h-14 rounded-xl px-5 text-base"
            >
              Star on GitHub
            </a>
          </div>
        </div>
      </section>
    </main>

    <docs-site-footer variant="landing" />
  `
})
export class Home {
  protected readonly version = VERSION;
  protected readonly install = INSTALL;
  protected readonly usage = USAGE;
  protected readonly packages = PACKAGES;
  protected readonly mcpConfig = MCP_CONFIG;
  protected readonly mcpTools = MCP_TOOLS;
  protected readonly skillInstall = SKILL_INSTALL;
  protected readonly builtOn = BUILT_ON;
  protected readonly densities = DENSITIES;
  protected readonly strategies = STRATEGIES;
  protected readonly themes = THEMES;
  protected readonly hues = HUES;
  protected readonly people = PEOPLE;

  protected readonly skillRules = [
    'Style only with semantic tokens: bg-surface, text-foreground-muted, border-error-muted.',
    'Confirm every selector and signal input against the server before writing markup.',
    'Import the package barrel, XuiButtonImports, into the standalone component.',
    'Reach for the headless @xui/core/* entrypoint when the styled package does not fit.'
  ];

  protected readonly componentCount = COMPONENTS.filter(component => component.kind === 'ui').length;
  protected readonly coreCount = COMPONENTS.filter(component => component.kind === 'core').length;
  protected readonly packageCount = COMPONENTS.length;

  protected readonly groups = GROUPS.map(name => {
    const members = COMPONENTS.filter(component => component.group === name);

    return {
      name,
      anchor: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      count: members.length,
      // The first few titles, so the card says what the group holds rather than only how many.
      sample: members
        .slice(0, 5)
        .map(component => component.title)
        .join(', ')
        .concat(members.length > 5 ? ', …' : '')
    };
  }).filter(group => group.count > 0);

  // Showcase state. Signals so the demos are live under OnPush without a zone.
  protected readonly notifications = signal(true);
  protected readonly twoFactor = signal(false);
  protected readonly remember = signal(true);
  protected readonly density = signal<string | null>('cozy');
  protected readonly releaseDate = signal<Date | null>(null);
  protected readonly step = signal(1);
  protected readonly traffic = signal(35);
  protected readonly strategy = signal<string | null>('canary');
  protected readonly halt = signal(true);
  protected readonly otp = signal('');
  protected readonly score = signal(0);
  protected readonly opacity = signal(70);
  protected readonly tab = signal<string | null>('overview');

  // Theming stage.
  protected readonly demoTheme = signal<'dark' | 'light' | null>('light');
  protected readonly demoHue = signal(HUES[0].value);
  protected readonly welcome = signal(true);
  protected readonly addToChannel = signal(false);

  protected readonly themeCss = computed(() => `.${this.demoTheme() ?? 'dark'} {\n  --primary: ${this.demoHue()};\n}`);

  /** Hide the slider's tick labels; the value is read out beside it instead. */
  protected readonly noLabels = false as const;

  private readonly strip = viewChild.required<ElementRef<HTMLElement>>('strip');

  constructor() {
    // Open the strip on its middle card so it bleeds off both edges like the reference's gallery.
    // Browser-only by nature: the prerendered page starts at the first card and a keyboard user
    // can still reach every card from there.
    afterNextRender(() => {
      const el = this.strip().nativeElement;

      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    });
  }

  protected initials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('');
  }
}
