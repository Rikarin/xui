import { XuiCarousel } from './lib/carousel';
import { XuiCarouselItem } from './lib/carousel-item';

export * from './lib/carousel';
export * from './lib/carousel-item';

export const XuiCarouselImports = [XuiCarousel, XuiCarouselItem] as const;
