import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { XuiCarousel, XuiCarouselImports } from '@xui/carousel';

/**
 * A slideshow with arrows, dot indicators, keyboard support and optional
 * autoplay (paused on hover). Choose the sliding (`scrollx`) or crossfade
 * (`fade`) transition.
 */
const meta: Meta<XuiCarousel> = {
  title: 'Data display/Carousel',
  component: XuiCarousel,
  decorators: [moduleMetadata({ imports: [XuiCarouselImports] })]
};

export default meta;
type Story = StoryObj<XuiCarousel>;

// The slides are written out rather than built by a helper. The docs extractor strips a `${…}` out
// of a story template, and a helper call there left every item empty in the rendered example.

export const Basic: Story = {
  render: () => ({
    template: `
      <xui-carousel class="w-[560px]">
        <xui-carousel-item>
          <div class="flex h-56 w-full items-center justify-center bg-sky-600 text-3xl font-semibold text-white">1</div>
        </xui-carousel-item>
        <xui-carousel-item>
          <div class="flex h-56 w-full items-center justify-center bg-indigo-600 text-3xl font-semibold text-white">
            2
          </div>
        </xui-carousel-item>
        <xui-carousel-item>
          <div class="flex h-56 w-full items-center justify-center bg-emerald-600 text-3xl font-semibold text-white">
            3
          </div>
        </xui-carousel-item>
      </xui-carousel>
    `
  })
};

export const Autoplay: Story = {
  render: () => ({
    template: `
      <xui-carousel autoplay [interval]="2000" class="w-[560px]">
        <xui-carousel-item>
          <div class="flex h-56 w-full items-center justify-center bg-rose-600 text-3xl font-semibold text-white">1</div>
        </xui-carousel-item>
        <xui-carousel-item>
          <div class="flex h-56 w-full items-center justify-center bg-amber-600 text-3xl font-semibold text-white">
            2
          </div>
        </xui-carousel-item>
        <xui-carousel-item>
          <div class="flex h-56 w-full items-center justify-center bg-teal-600 text-3xl font-semibold text-white">3</div>
        </xui-carousel-item>
      </xui-carousel>
    `
  })
};

export const Fade: Story = {
  render: () => ({
    template: `
      <xui-carousel effect="fade" class="w-[560px]">
        <xui-carousel-item>
          <div class="flex h-56 w-full items-center justify-center bg-fuchsia-600 text-3xl font-semibold text-white">
            1
          </div>
        </xui-carousel-item>
        <xui-carousel-item>
          <div class="flex h-56 w-full items-center justify-center bg-cyan-600 text-3xl font-semibold text-white">2</div>
        </xui-carousel-item>
        <xui-carousel-item>
          <div class="flex h-56 w-full items-center justify-center bg-lime-600 text-3xl font-semibold text-white">3</div>
        </xui-carousel-item>
      </xui-carousel>
    `
  })
};
