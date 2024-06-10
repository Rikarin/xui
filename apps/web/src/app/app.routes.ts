import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  { path: 'theme-designer', loadChildren: () => import('./designer/designer.module').then(x => x.DesignerModule) },
  { path: 'docs', loadChildren: () => import('./docs/docs.module').then(x => x.DocsModule) },
  { path: '', redirectTo: '/docs', pathMatch: 'full' }
];
