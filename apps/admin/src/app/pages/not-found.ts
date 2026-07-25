import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { XuiButtonImports } from '@xui/button';
import { XuiNonIdealStateImports } from '@xui/non-ideal-state';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, XuiButtonImports, XuiNonIdealStateImports],
  template: `
    <xui-non-ideal-state
      class="py-20"
      title="No such page"
      description="The link may be out of date, or the record it pointed at has been removed."
    >
      <a xuiButton routerLink="/dashboard">Back to the dashboard</a>
    </xui-non-ideal-state>
  `
})
export class NotFound {}
