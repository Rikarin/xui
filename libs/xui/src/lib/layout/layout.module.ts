import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiLayoutComponent } from './layout.component';
import { XuiHeaderComponent } from './header.component';
import { XuiSiderComponent } from './sider.component';
import { XuiContentComponent } from './content.component';
import { XuiFooterComponent } from './footer.component';

@NgModule({
  imports: [CommonModule],
  declarations: [XuiLayoutComponent, XuiHeaderComponent, XuiSiderComponent, XuiContentComponent, XuiFooterComponent],
  exports: [XuiLayoutComponent, XuiHeaderComponent, XuiSiderComponent, XuiContentComponent, XuiFooterComponent]
})
export class XuiLayoutModule {}
