import { NgModule } from '@angular/core';
import { XuiSkeletonComponent } from './lib/skeleton.component';
export * from './lib/skeleton.component';

export const XuiSkeletonImports = [XuiSkeletonComponent] as const;

@NgModule({
  imports: [...XuiSkeletonImports],
  exports: [...XuiSkeletonImports]
})
export class XuiSkeletonModule {}
