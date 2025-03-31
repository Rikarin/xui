import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, numberAttribute } from '@angular/core';
import { xui } from '@xui/core';
import type { ClassValue } from 'clsx';
import { NgxSonnerToaster, ToasterProps } from 'ngx-sonner';

@Component({
  selector: 'xui-sonner',
  imports: [NgxSonnerToaster],
  template: `
    <ngx-sonner-toaster
      [class]="computedClass()"
      [invert]="invert()"
      [theme]="theme()"
      [position]="position()"
      [hotKey]="hotKey()"
      [richColors]="richColors()"
      [expand]="expand()"
      [duration]="duration()"
      [visibleToasts]="visibleToasts()"
      [closeButton]="closeButton()"
      [toastOptions]="toastOptions()"
      [offset]="offset()"
      [dir]="dir()"
      [style]="style()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XuiSonnerComponent {
  readonly invert = input<ToasterProps['invert'], boolean | string>(false, {
    transform: booleanAttribute
  });
  readonly theme = input<ToasterProps['theme']>('light');
  readonly position = input<ToasterProps['position']>('bottom-right');
  readonly hotKey = input<ToasterProps['hotkey']>(['altKey', 'KeyT']);
  readonly richColors = input<ToasterProps['richColors'], boolean | string>(true, {
    transform: booleanAttribute
  });
  readonly expand = input<ToasterProps['expand'], boolean | string>(false, {
    transform: booleanAttribute
  });
  readonly duration = input<ToasterProps['duration'], number | string>(4000, {
    transform: numberAttribute
  });
  readonly visibleToasts = input<ToasterProps['visibleToasts'], number | string>(3, {
    transform: numberAttribute
  });
  readonly closeButton = input<ToasterProps['closeButton'], boolean | string>(false, {
    transform: booleanAttribute
  });
  readonly toastOptions = input<ToasterProps['toastOptions']>({
    classes: {
      toast:
        'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
      description: 'group-[.toast]:text-muted-foreground',
      actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
      cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground'
    }
  });
  readonly offset = input<ToasterProps['offset']>(null);
  readonly dir = input<ToasterProps['dir']>('auto');
  readonly class = input<ClassValue>('');
  readonly style = input<Record<string, string>>({});

  protected readonly computedClass = computed(() => xui('toaster group', this.class()));
}
