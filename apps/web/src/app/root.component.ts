import { NgDocRootComponent, NgDocNavbarComponent, NgDocSidebarComponent } from '@ng-doc/app';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { XuiSelect, XuiSelectModule } from '@xui/components';

@Component({
  standalone: true,
  imports: [RouterModule, NgDocRootComponent, NgDocNavbarComponent, NgDocSidebarComponent],
  selector: 'app-root',
  template: `
    <ng-doc-root [footerContent]="footerContent">
      <ng-doc-navbar>
        <a href="/" ngDocNavbarLeft>
          <h4 style="margin: 0">xUI</h4>
        </a>
      </ng-doc-navbar>
      <ng-doc-sidebar></ng-doc-sidebar>
      <router-outlet></router-outlet>
    </ng-doc-root>
    <ng-template #footerContent>
      <div style="display: flex; justify-content: center">Copyright © 2024 Rikarin</div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RootComponent {
  constructor(translations: TranslateService) {
    translations.setDefaultLang('en-US');
  }
}
