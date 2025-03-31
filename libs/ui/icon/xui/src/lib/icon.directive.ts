import { Directive, computed, input } from '@angular/core';
import { injectXuiIconConfig } from './icon.token';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none' | (Record<never, never> & string);

@Directive({
  selector: 'ng-icon[xui]',
  host: {
    '[style.--ng-icon__size]': 'computedSize()'
  }
})
export class XuiIconDirective {
  private readonly config = injectXuiIconConfig();
  readonly size = input<IconSize>(this.config.size);

  protected readonly computedSize = computed(() => {
    const size = this.size();

    switch (size) {
      case 'xs':
        return '12px';
      case 'sm':
        return '16px';
      case 'md':
        return '24px';
      case 'lg':
        return '32px';
      case 'xl':
        return '48px';
      default: {
        return size;
      }
    }
  });
}
