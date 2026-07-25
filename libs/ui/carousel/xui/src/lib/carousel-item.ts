import { ChangeDetectionStrategy, Component, TemplateRef, viewChild, ViewEncapsulation } from '@angular/core';

/** One slide inside {@link XuiCarousel}. Its projected content is the slide. */
@Component({
  selector: 'xui-carousel-item',
  template: `<ng-template #content><ng-content /></ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class XuiCarouselItem {
  readonly content = viewChild.required<TemplateRef<unknown>>('content');
}
