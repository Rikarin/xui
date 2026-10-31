import { Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';
import { XuiButtonImports } from '@xui/button';

/**
 * The bezelled skin defined in `libs/core/styles/bezel.css` (published as
 * `@xui/core/styles/bezel.css`): a Logic Pro / current-macOS reading of xUI for
 * desktop-shaped applications.
 *
 * It is opt-in through `data-skin="bezel"`. The Skin toolbar sets that on the
 * document, which is what a consuming app does in its `index.html`; the stories
 * below set it on their own wrapper instead, so the materials are visible
 * whatever the toolbar says — and so this page doubles as a demonstration that
 * the skin scopes to a subtree.
 *
 * Every panel is rendered with the composite utility an application would use,
 * so this is also a regression check: if a material stops compiling, its panel
 * falls back to a bare box.
 */
const meta: Meta = {
  title: 'Foundations/Bezelled skin',
  decorators: [moduleMetadata({ imports: [XuiButtonImports] })]
};

export default meta;
type Story = StoryObj;

function section(title: string, note: string, body: string): string {
  return `
    <section class="mb-8">
      <h2 class="text-foreground mb-1 text-lg font-semibold">${title}</h2>
      <p class="text-foreground-muted mb-3 text-sm">${note}</p>
      ${body}
    </section>`;
}

/** Everything is wrapped so the skin's tokens resolve without the toolbar. */
function skinned(body: string): string {
  return `<div data-skin="bezel" class="bg-background text-foreground rounded-lg p-6">${body}</div>`;
}

export const Materials: Story = {
  render: () => ({
    template: skinned(`
      ${section(
        'Chrome',
        'A window bar and a translucent toolbar: a soft vertical gradient, a highlight on top, a hairline beneath.',
        `<div class="border-hairline overflow-hidden rounded-lg border">
           <div class="chrome-bar flex h-11 items-center px-3 text-sm font-medium">Window chrome</div>
           <div class="glass-bar flex h-9 items-center px-3 text-xs">Toolbar over content</div>
           <div class="bg-surface h-12"></div>
         </div>`
      )}

      ${section(
        'Pane',
        'A pane in the near-black window, with its graded title bar.',
        `<div class="pane w-80">
           <div class="pane-header flex h-7 items-center px-3">Inspector</div>
           <div class="p-3">
             <p class="section-label mb-2">Group</p>
             <p class="text-foreground-muted text-sm">Pane body on the surface step.</p>
           </div>
         </div>`
      )}

      ${section(
        'Bezels',
        'Raised faces for chrome controls that are not xUI components. Hover lightens, pressed sinks; ' +
          'the third button is held down with aria-pressed.',
        `<div class="flex items-center gap-3">
           <button type="button" class="bezel h-6.5 px-3 text-xs">Single</button>
           <div class="bezel-group h-6.5 text-xs">
             <button type="button" class="px-3">Cut</button>
             <button type="button" class="px-3">Copy</button>
             <button type="button" class="px-3" aria-pressed="true">Paste</button>
           </div>
         </div>`
      )}

      ${section(
        'LCD and well',
        'A glass readout with a glare across its top half, and a recess cut into the surface.',
        `<div class="flex items-center gap-4">
           <div class="lcd-glass readout flex h-10 items-center gap-4 px-4">
             <span class="text-lcd-foreground text-[15px] font-semibold">001 | 01 | 000</span>
             <span class="text-lcd-muted text-[11px] uppercase">bars</span>
             <span class="text-lcd-accent text-[15px] font-semibold">120.00</span>
           </div>
           <div class="well h-10 w-40 rounded-md"></div>
         </div>`
      )}

      ${section(
        'xUI controls',
        'The library’s own controls, restyled through the data-variant each one reflects — no component ' +
          'change and no selecting on utility classes.',
        `<div class="flex flex-wrap items-center gap-3">
           <button xuiButton>Filled</button>
           <button xuiButton variant="outline">Outline</button>
           <button xuiButton variant="outline" color="error">Delete</button>
           <button xuiButton variant="ghost">Ghost</button>
         </div>`
      )}
    `)
  })
};
