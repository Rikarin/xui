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

const slide = (n: number, color: string) =>
  `<div class="flex h-56 w-full items-center justify-center text-3xl font-semibold text-white ${color}">${n}</div>`;

export const Basic: Story = {
  render: () => ({
    template: `
      <xui-carousel class="w-[560px]">
        <xui-carousel-item>${slide(1, 'bg-sky-600')}</xui-carousel-item>
        <xui-carousel-item>${slide(2, 'bg-indigo-600')}</xui-carousel-item>
        <xui-carousel-item>${slide(3, 'bg-emerald-600')}</xui-carousel-item>
      </xui-carousel>
    `
  })
};

export const Autoplay: Story = {
  render: () => ({
    template: `
      <xui-carousel autoplay [interval]="2000" class="w-[560px]">
        <xui-carousel-item>${slide(1, 'bg-rose-600')}</xui-carousel-item>
        <xui-carousel-item>${slide(2, 'bg-amber-600')}</xui-carousel-item>
        <xui-carousel-item>${slide(3, 'bg-teal-600')}</xui-carousel-item>
      </xui-carousel>
    `
  })
};

export const Fade: Story = {
  render: () => ({
    template: `
      <xui-carousel effect="fade" class="w-[560px]">
        <xui-carousel-item>${slide(1, 'bg-fuchsia-600')}</xui-carousel-item>
        <xui-carousel-item>${slide(2, 'bg-cyan-600')}</xui-carousel-item>
        <xui-carousel-item>${slide(3, 'bg-lime-600')}</xui-carousel-item>
      </xui-carousel>
    `
  })
};
