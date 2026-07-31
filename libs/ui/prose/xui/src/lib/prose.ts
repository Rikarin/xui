import { computed, Directive, input } from '@angular/core';
import { xui } from '@xui/core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { injectXuiProseConfig } from './prose.token';

/**
 * The type scale, per size. Split from the structural rules below because only
 * these change with `size` — everything else is the same document at any scale.
 */
const typeScale = {
  sm: [
    'text-sm leading-6',
    '[&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-base [&_h4]:text-sm',
    '[&_code]:text-[0.8125em] [&_pre]:text-xs'
  ],
  md: [
    'text-base leading-7',
    '[&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-lg [&_h4]:text-base',
    '[&_code]:text-[0.875em] [&_pre]:text-[0.8125rem]'
  ],
  lg: [
    'text-lg leading-8',
    '[&_h1]:text-4xl [&_h2]:text-3xl [&_h3]:text-xl [&_h4]:text-lg',
    '[&_code]:text-[0.875em] [&_pre]:text-sm'
  ]
} as const;

export const proseVariants = cva(
  [
    'text-foreground min-w-0',

    // Headings. The document supplies the tags; this supplies the voice.
    '[&_h1]:text-foreground [&_h1]:font-bold [&_h1]:tracking-tight',
    '[&_h2]:text-foreground [&_h2]:font-semibold [&_h2]:tracking-tight',
    '[&_h3]:text-foreground [&_h3]:font-semibold',
    '[&_h4]:text-foreground [&_h4]:font-semibold',
    '[&_h5]:text-foreground [&_h5]:text-sm [&_h5]:font-semibold',
    '[&_h6]:text-foreground-muted [&_h6]:text-sm [&_h6]:font-semibold [&_h6]:uppercase',
    // A rule under the top two levels, which is what makes a long page scannable.
    '[&_h2]:border-border [&_h2]:border-b [&_h2]:pb-2',

    // Body copy.
    '[&_p]:text-foreground',
    '[&_strong]:text-foreground [&_strong]:font-semibold',
    '[&_em]:italic',
    '[&_small]:text-foreground-muted [&_small]:text-sm',
    '[&_mark]:bg-warning-subtle [&_mark]:text-foreground [&_mark]:rounded [&_mark]:px-1',
    '[&_abbr]:decoration-border [&_abbr]:cursor-help [&_abbr]:underline [&_abbr]:decoration-dotted',

    // Links. `text-link` already carries its own hover step.
    '[&_a]:text-link [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-link-hover',
    '[&_a]:focus-visible:outline-focus [&_a]:rounded-sm [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2',

    // Lists. Markers are muted so the text keeps the weight.
    '[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ps-6 [&_ol]:ps-6',
    '[&_li]:marker:text-foreground-subtle',
    '[&_ul_ul]:list-[circle] [&_ol_ol]:list-[lower-alpha]',
    // A task list is a list without bullets — GitHub-flavoured markdown emits exactly this shape.
    '[&_li:has(>input[type=checkbox])]:list-none [&_li>input[type=checkbox]]:me-2',

    // Code. An inline run is a chip; a block is a surface, and defers to
    // `@xui/code-block` when the sample was tokenised at build time.
    '[&_code]:bg-surface-inset [&_code]:text-foreground [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono',
    '[&_pre]:bg-surface-inset [&_pre]:border-border [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:p-4 [&_pre]:font-mono',
    '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit',

    // Quotes and rules.
    '[&_blockquote]:border-border [&_blockquote]:text-foreground-muted [&_blockquote]:border-s-4 [&_blockquote]:ps-4 [&_blockquote]:italic',
    '[&_hr]:border-border [&_hr]:border-t',

    // Tables. `w-full` plus a scroll container on the wrapper is the only shape
    // that survives a wide table in a narrow column.
    '[&_table]:w-full [&_table]:border-collapse [&_table]:text-start [&_table]:text-[0.9375em]',
    '[&_thead]:border-border [&_thead]:border-b',
    '[&_th]:text-foreground [&_th]:px-3 [&_th]:py-2 [&_th]:text-start [&_th]:font-semibold',
    '[&_td]:border-border-muted [&_td]:border-t [&_td]:px-3 [&_td]:py-2 [&_td]:align-top',

    // Figures and media.
    '[&_img]:max-w-full [&_img]:rounded-lg',
    '[&_video]:max-w-full [&_video]:rounded-lg',
    '[&_figcaption]:text-foreground-muted [&_figcaption]:text-center [&_figcaption]:text-sm',
    '[&_kbd]:bg-surface-raised [&_kbd]:border-border [&_kbd]:text-foreground [&_kbd]:rounded [&_kbd]:border [&_kbd]:px-1.5 [&_kbd]:py-0.5 [&_kbd]:font-mono [&_kbd]:text-[0.8125em]',

    // A document should not open on a gap.
    '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0'
  ],
  {
    variants: {
      size: typeScale,
      /**
       * Vertical rhythm. `compact` is for prose in a panel or a card, where the
       * page has already spent its space on chrome.
       */
      density: {
        comfortable: [
          '[&_h1]:mt-0 [&_h1]:mb-6',
          '[&_h2]:mt-10 [&_h2]:mb-4',
          '[&_h3]:mt-8 [&_h3]:mb-3',
          '[&_h4]:mt-6 [&_h4]:mb-2 [&_h5]:mt-6 [&_h5]:mb-2 [&_h6]:mt-6 [&_h6]:mb-2',
          '[&_p]:my-4 [&_ul]:my-4 [&_ol]:my-4 [&_li]:my-1',
          '[&_pre]:my-4 [&_blockquote]:my-6 [&_table]:my-6 [&_hr]:my-10 [&_figure]:my-6'
        ],
        compact: [
          '[&_h1]:mt-0 [&_h1]:mb-3',
          '[&_h2]:mt-6 [&_h2]:mb-2',
          '[&_h3]:mt-5 [&_h3]:mb-2',
          '[&_h4]:mt-4 [&_h4]:mb-1 [&_h5]:mt-4 [&_h5]:mb-1 [&_h6]:mt-4 [&_h6]:mb-1',
          '[&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5',
          '[&_pre]:my-3 [&_blockquote]:my-3 [&_table]:my-4 [&_hr]:my-6 [&_figure]:my-4'
        ]
      }
    },
    defaultVariants: {
      size: 'md',
      density: 'comfortable'
    }
  }
);

export type XuiProseVariants = VariantProps<typeof proseVariants>;

/**
 * Typography for rendered markdown: styles the raw HTML a renderer produced,
 * with no per-element classes to add.
 *
 * ```html
 * <article xuiProse [innerHTML]="page.html"></article>
 * ```
 *
 * `@tailwindcss/typography` is the usual answer and the wrong one here — it
 * carries its own greys, so a document styled with it stops following the active
 * theme the moment it is dark. Every rule below resolves to a semantic token
 * instead, which is why this is a package and not a plugin config.
 *
 * The rules are descendant selectors, so they reach content that arrives as a
 * string (`innerHTML`) as readily as content written in a template — which
 * ordinary component styles, scoped to the emitting component, would not.
 */
@Directive({
  selector: '[xuiProse]',
  exportAs: 'xuiProse',
  host: {
    '[class]': 'computedClass()'
  }
})
export class XuiProse {
  private readonly config = injectXuiProseConfig();

  /** Extra classes, merged into the directive's own rather than replacing them. */
  readonly class = input<ClassValue>('');

  /** The type scale the document is set at. */
  readonly size = input<XuiProseVariants['size']>(this.config.size);

  /** How much air the document gets between its blocks. */
  readonly density = input<XuiProseVariants['density']>(this.config.density);

  protected readonly computedClass = computed(() =>
    xui(proseVariants({ size: this.size(), density: this.density() }), this.class())
  );
}
