import type { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { xui } from '@xui/core';
import { cva, VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

export const navbarVariants = cva('bg-surface border-border flex h-12 items-center border-b px-4', {
  variants: {
    fixedToTop: {
      true: 'sticky top-0 z-10 shadow-elevation-1',
      false: ''
    }
  },
  defaultVariants: {
    fixedToTop: false
  }
});

export type NavbarVariants = VariantProps<typeof navbarVariants>;

/**
 * The bar across the top of an application.
 *
 * ```html
 * <nav xuiNavbar fixedToTop>
 *   <div xuiNavbarGroup>
 *     <span xuiNavbarHeading>xUI</span>
 *     <div xuiNavbarDivider></div>
 *     <a xuiLink href="/docs">Docs</a>
 *   </div>
 *   <div xuiNavbarGroup align="end">…</div>
 * </nav>
 * ```
 *
 * A directive so the host can be a real `<nav>` or `<header>` landmark, which
 * is what lets assistive technology jump straight to it.
 */
@Directive({
  selector: '[xuiNavbar]',
  exportAs: 'xuiNavbar',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiNavbar {
  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');

  /** Stick to the top of the viewport as the page scrolls. */
  readonly fixedToTop = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    xui(navbarVariants({ fixedToTop: this.fixedToTop() }), this.class())
  );
}

export const navbarGroupVariants = cva('flex h-full items-center gap-2', {
  variants: {
    align: {
      start: 'me-auto',
      end: 'ms-auto',
      center: 'mx-auto'
    }
  },
  defaultVariants: {
    align: 'start'
  }
});

export type NavbarGroupVariants = VariantProps<typeof navbarGroupVariants>;

/** A cluster of navbar items pushed to one side. */
@Directive({
  selector: '[xuiNavbarGroup]',
  exportAs: 'xuiNavbarGroup',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiNavbarGroup {
  /** The user-defined classes. Merged last so they win over the variant classes. */
  readonly class = input<ClassValue>('');
  readonly align = input<NavbarGroupVariants['align']>('start');

  protected readonly computedClass = computed(() => xui(navbarGroupVariants({ align: this.align() }), this.class()));
}

/** The application or section name, usually the first item in the bar. */
@Directive({
  selector: '[xuiNavbarHeading]',
  exportAs: 'xuiNavbarHeading',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiNavbarHeading {
  /** The user-defined classes. Merged last so they win over the base classes. */
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    xui('text-foreground me-2 font-semibold whitespace-nowrap', this.class())
  );
}

/**
 * A vertical rule between navbar groups.
 *
 * Presentational rather than a `separator`: inside a navbar the rule is visual
 * grouping, and announcing a separator between every cluster is noise.
 */
@Directive({
  selector: '[xuiNavbarDivider]',
  exportAs: 'xuiNavbarDivider',
  host: {
    role: 'presentation',
    'aria-hidden': 'true',
    '[class]': 'computedClass()'
  }
})
export class XuiNavbarDivider {
  /** The user-defined classes. Merged last so they win over the base classes. */
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => xui('border-border mx-2 h-5 self-center border-s', this.class()));
}
