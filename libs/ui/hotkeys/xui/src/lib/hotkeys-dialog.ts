import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { formatXCombo } from '@xui/core/hotkeys';
import { XuiKbd } from '@xui/kbd';
import { XuiHotkeysService } from './hotkeys.service';

/**
 * The `?`-triggered help overlay listing every registered hotkey, grouped. Mounted
 * by {@link XuiHotkeysService.openHelp}; not intended to be used directly.
 */
@Component({
  selector: 'xui-hotkeys-dialog',
  imports: [XuiKbd],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="px-6 py-5">
      <h2 class="text-foreground mb-4 text-base font-semibold">Keyboard shortcuts</h2>

      @if (groups().length) {
        <div class="flex flex-col gap-5">
          @for (group of groups(); track group.group) {
            <section>
              <h3 class="text-foreground-muted mb-2 text-xs font-semibold tracking-wide uppercase">
                {{ group.group }}
              </h3>
              <ul class="m-0 flex list-none flex-col gap-1.5 p-0">
                @for (hotkey of group.items; track hotkey.combo + hotkey.label) {
                  <li class="flex items-center justify-between gap-4 text-sm">
                    <span class="text-foreground">{{ hotkey.label }}</span>
                    <span class="flex items-center gap-1">
                      @for (key of keys(hotkey.combo); track $index) {
                        <kbd xuiKbd>{{ key }}</kbd>
                      }
                    </span>
                  </li>
                }
              </ul>
            </section>
          }
        </div>
      } @else {
        <p class="text-foreground-muted text-sm">No shortcuts are registered.</p>
      }
    </div>
  `
})
export class XuiHotkeysDialog {
  private readonly service = inject(XuiHotkeysService);

  protected readonly groups = computed(() => this.service.grouped());

  protected keys(combo: string): string[] {
    return formatXCombo(combo, this.service.isMac);
  }
}
