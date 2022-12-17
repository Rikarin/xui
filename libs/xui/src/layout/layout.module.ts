import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import { HeaderComponent } from './header.component';
import { SiderComponent } from './sider.component';
import { ContentComponent } from './content.component';
import { FooterComponent } from './footer.component';

@NgModule({
  imports: [CommonModule],
  declarations: [LayoutComponent, HeaderComponent, SiderComponent, ContentComponent, FooterComponent],
  exports: [LayoutComponent, HeaderComponent, SiderComponent, ContentComponent, FooterComponent]
})
export class XuiLayoutModule {}
