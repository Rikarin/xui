import { Component } from '@angular/core';

@Component({
  selector: 'xui-hint',
  template: '<ng-content />',
  host: {
    class: 'block text-sm text-foreground/50'
  }
})
export class XuiHintComponent {}
