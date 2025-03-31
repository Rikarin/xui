import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgDocNavbarComponent, NgDocRootComponent, NgDocSidebarComponent } from '@ng-doc/app';

@Component({
  imports: [RouterModule, NgDocRootComponent, NgDocNavbarComponent, NgDocSidebarComponent],
  selector: 'app-root',
  template: `<ng-doc-root>
    <ng-doc-navbar>
      <h3 class="brand" style="margin: 0" ngDocNavbarLeft>xUI</h3>
    </ng-doc-navbar>
    <ng-doc-sidebar></ng-doc-sidebar>
    <router-outlet></router-outlet>
  </ng-doc-root>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}
