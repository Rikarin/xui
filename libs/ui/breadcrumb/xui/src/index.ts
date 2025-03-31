import { NgModule } from '@angular/core';
import { XuiBreadcrumbEllipsisComponent } from './lib/breadcrumb-ellipsis.component';
import { XuiBreadcrumbItemDirective } from './lib/breadcrumb-item.directive';
import { XuiBreadcrumbLinkDirective } from './lib/breadcrumb-link.directive';
import { XuiBreadcrumbListDirective } from './lib/breadcrumb-list.directive';
import { XuiBreadcrumbPageDirective } from './lib/breadcrumb-page.directive';
import { XuiBreadcrumbSeparatorComponent } from './lib/breadcrumb-separator.component';
import { XuiBreadcrumbDirective } from './lib/breadcrumb.directive';

export * from './lib/breadcrumb-ellipsis.component';
export * from './lib/breadcrumb-item.directive';
export * from './lib/breadcrumb-link.directive';
export * from './lib/breadcrumb-list.directive';
export * from './lib/breadcrumb-page.directive';
export * from './lib/breadcrumb-separator.component';
export * from './lib/breadcrumb.directive';

export const XuiBreadcrumbImports = [
  XuiBreadcrumbDirective,
  XuiBreadcrumbEllipsisComponent,
  XuiBreadcrumbItemDirective,
  XuiBreadcrumbLinkDirective,
  XuiBreadcrumbListDirective,
  XuiBreadcrumbPageDirective,
  XuiBreadcrumbSeparatorComponent
] as const;

@NgModule({
  imports: [...XuiBreadcrumbImports],
  exports: [...XuiBreadcrumbImports]
})
export class XuiBreadcrumbModule {}
