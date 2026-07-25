import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Theme } from './core/theme';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class AppComponent {
  // Constructed here so the class on <html> is owned from the first render, not from whichever
  // component happens to inject it first.
  private readonly theme = inject(Theme);
}
