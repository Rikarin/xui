import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XuiLayout } from './layout';
import { XuiHeader } from './header';
import { XuiSider } from './sider';
import { XuiContent } from './content';
import { XuiFooter } from './footer';

@NgModule({
  imports: [CommonModule],
  declarations: [XuiLayout, XuiHeader, XuiSider, XuiContent, XuiFooter],
  exports: [XuiLayout, XuiHeader, XuiSider, XuiContent, XuiFooter]
})
export class XuiLayoutModule {}
