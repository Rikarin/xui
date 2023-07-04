import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'xui-docker-manager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div>foo bar</div> `
})
export class DockerManagerComponent {}
