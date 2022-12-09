import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';
import { RouterModule } from '@angular/router';
import { XuiLayoutModule } from 'xui';

@NgModule({
  declarations: [LayoutComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: LayoutComponent
      }
    ]),
    XuiLayoutModule
  ]
})
export class DesignerModule {}
