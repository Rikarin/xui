import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  matBoltRound,
  matExtensionRound,
  matPaletteRound,
  matSmartToyRound,
  matTerminalRound,
  matWidgetsRound
} from '@ng-icons/material-icons/round';
import { XuiBadgeImports } from '@xui/badge';
import { XuiButtonImports } from '@xui/button';
import { XuiCalloutImports } from '@xui/callout';
import { XuiCardImports } from '@xui/card';
import { XuiIconImports } from '@xui/icon';
import { XuiKbdImports } from '@xui/kbd';
import { XuiTagImports } from '@xui/tag';
import { XuiTextImports } from '@xui/text';
import { COMPONENTS, GROUPS, VERSION } from '../../generated/manifest';
import { SiteFooter } from '../layout/site-footer';
import { SiteHeader } from '../layout/site-header';
import { CodeBlock } from '../shared/code-block';

const FEATURES = [
  {
    icon: 'matExtensionRound',
    title: 'One package per component',
    body: 'Install @xui/button and you ship a button, not a library. Each package exports an imports barrel for standalone components.'
  },
  {
    icon: 'matBoltRound',
    title: 'Signals, OnPush, zoneless',
    body: 'Signal inputs and two-way models throughout. No zone.js, no change-detection tax for the parts of the page you are not touching.'
  },
  {
    icon: 'matPaletteRound',
    title: 'Themed by tokens',
    body: 'Components style themselves with bg-surface and text-foreground-muted. Light and dark both work without a single dark: class.'
  },
  {
    icon: 'matWidgetsRound',
    title: 'Angular CDK underneath',
    body: 'Overlays, focus traps, roving tabindex, typeahead and bidi come from the CDK, so keyboard behaviour is not reinvented per component.'
  },
  {
    icon: 'matTerminalRound',
    title: 'Typed variants that merge',
    body: 'Every visual axis is a typed input backed by CVA, and the class input merges through tailwind-merge, so your utility wins.'
  },
  {
    icon: 'matSmartToyRound',
    title: 'Built for coding agents',
    body: 'An MCP server exposes every package’s real API to your editor’s assistant, extracted from the sources rather than a hand-kept list.'
  }
];

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

@Component({
  selector: 'docs-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    NgIcon,
    XuiIconImports,
    XuiBadgeImports,
    XuiButtonImports,
    XuiCalloutImports,
    XuiCardImports,
    XuiKbdImports,
    XuiTagImports,
    XuiTextImports,
    SiteHeader,
    SiteFooter,
    CodeBlock
  ],
  providers: [
    provideIcons({
      matExtensionRound,
      matBoltRound,
      matPaletteRound,
      matWidgetsRound,
      matTerminalRound,
      matSmartToyRound
    })
  ],
  template: `
    <docs-site-header />

    <main id="main">
      <section class="mx-auto max-w-[100rem] px-4 pt-12 pb-12 sm:px-6 sm:pt-16 sm:pb-16">
        <div class="max-w-3xl">
          <xui-tag minimal color="primary" class="mb-5">Angular 22 · Tailwind 4 · zoneless</xui-tag>

          <h1 xuiHeading [level]="1" class="text-4xl leading-tight sm:text-5xl md:text-6xl">
            {{ componentCount }} Angular components,<br class="hidden sm:block" />
            one npm package each.
          </h1>

          <p xuiText color="muted" size="lg" class="mt-6 max-w-2xl">
            xUI is an Angular 22 component library styled with Tailwind CSS 4. Signal inputs, zoneless change detection,
            and a semantic token layer that makes light and dark a CSS variable rather than a fork.
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <a xuiButton size="lg" routerLink="/docs/getting-started">Get started</a>
            <a xuiButton size="lg" variant="outline" color="secondary" routerLink="/docs/components">
              Browse components
            </a>
          </div>

          <p xuiText color="subtle" size="sm" class="mt-6">
            Already have a workspace? <kbd xuiKbd>ng add @xui/core</kbd> wires the stylesheet for you.
          </p>
        </div>
      </section>

      <section class="mx-auto grid max-w-[100rem] gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-2">
        <div>
          <p xuiText weight="medium" class="mb-2">Install</p>
          <docs-code [code]="install" lang="bash" />
        </div>
        <div>
          <p xuiText weight="medium" class="mb-2">Use</p>
          <docs-code [code]="usage" lang="ts" />
        </div>
      </section>

      <section class="mx-auto max-w-[100rem] px-4 pb-16 sm:px-6">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (feature of features; track feature.title) {
            <div xuiCard [elevation]="1" class="h-full">
              <ng-icon xui [name]="feature.icon" size="1.5rem" color="primary" class="mb-3" />
              <h2 xuiHeading [level]="4" class="mb-2">{{ feature.title }}</h2>
              <p xuiText color="muted" size="sm">{{ feature.body }}</p>
            </div>
          }
        </div>
      </section>

      <section class="mx-auto max-w-[100rem] px-4 pb-16 sm:px-6">
        <h2 xuiHeading [level]="2" class="mb-2">Everything in the box</h2>
        <p xuiText color="muted" class="mb-6 max-w-2xl">
          Grouped the way the Storybook is, from form controls to a dock manager and a node graph.
        </p>

        <div class="flex flex-wrap gap-2">
          @for (group of groups; track group.name) {
            <a
              xuiCard
              interactive
              compact
              routerLink="/docs/components"
              [fragment]="group.anchor"
              class="flex items-center gap-2 no-underline"
            >
              <span xuiText weight="medium" size="sm">{{ group.name }}</span>
              <span xuiBadge color="secondary" size="md">{{ group.count }}</span>
            </a>
          }
        </div>
      </section>

      <section class="mx-auto max-w-[100rem] px-4 pb-20 sm:px-6">
        <xui-callout color="primary" title="Working with an AI assistant?">
          The
          <a routerLink="/docs/ai-agents">MCP server and agent skill</a>
          give your editor the real API of every package — selectors, signal inputs, variant axes — extracted from the
          library sources, so suggestions match the version you have installed.
        </xui-callout>
      </section>
    </main>

    <docs-site-footer />
  `
})
export class Home {
  protected readonly version = VERSION;
  protected readonly features = FEATURES;
  protected readonly install = INSTALL;
  protected readonly usage = USAGE;
  protected readonly componentCount = COMPONENTS.filter(component => component.kind === 'ui').length;

  protected readonly groups = GROUPS.map(name => ({
    name,
    anchor: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    count: COMPONENTS.filter(component => component.group === name).length
  })).filter(group => group.count > 0);
}
