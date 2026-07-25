import type { ResolveFn, Routes } from '@angular/router';
import { LOADERS } from '../generated/loaders';
import { COMPONENTS } from '../generated/manifest';
import type { ComponentDoc } from './core/docs.model';

/**
 * Loads one component's documentation chunk.
 *
 * Resolving rather than loading inside the page keeps the server render complete: the HTML that
 * leaves the worker already has the API tables and previews in it, instead of a shell that fills in
 * once the browser has hydrated.
 */
export const componentDoc: ResolveFn<ComponentDoc | undefined> = async route => {
  const loader = LOADERS[route.paramMap.get('slug') ?? ''];

  return loader ? (await loader()).doc : undefined;
};

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home').then(m => m.Home),
    title: 'xUI — Angular components, one package each'
  },
  {
    path: 'docs',
    loadComponent: () => import('./layout/docs-layout').then(m => m.DocsLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'getting-started' },
      {
        path: 'getting-started',
        loadComponent: () => import('./pages/getting-started').then(m => m.GettingStarted),
        title: 'Getting started — xUI'
      },
      {
        path: 'theming',
        loadComponent: () => import('./pages/theming').then(m => m.Theming),
        title: 'Theming — xUI'
      },
      {
        path: 'ai-agents',
        loadComponent: () => import('./pages/ai-agents').then(m => m.AiAgents),
        title: 'MCP server and agent skill — xUI'
      },
      {
        path: 'components',
        loadComponent: () => import('./pages/components-index').then(m => m.ComponentsIndex),
        title: 'Components — xUI'
      },
      {
        path: 'components/:slug',
        loadComponent: () => import('./pages/component-detail').then(m => m.ComponentDetail),
        resolve: { doc: componentDoc },
        // Read from the manifest rather than the resolved data: the title strategy runs against a
        // snapshot whose `data` does not yet carry the resolver's result.
        title: route => {
          const slug = route.paramMap.get('slug');
          const component = COMPONENTS.find(entry => entry.slug === slug);

          return component ? `${component.title} — xUI` : 'Not found — xUI';
        }
      }
    ]
  },
  { path: '**', loadComponent: () => import('./pages/not-found').then(m => m.NotFound), title: 'Not found — xUI' }
];
