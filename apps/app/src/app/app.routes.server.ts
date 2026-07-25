import { RenderMode, type ServerRoute } from '@angular/ssr';
import { COMPONENTS } from '../generated/manifest';

/**
 * Documentation reads the same for everyone, so every page the app knows about is rendered at build
 * time and served as a static asset — no worker invocation, no cold start, and the HTML carries the
 * API tables and previews for anything that does not run JavaScript.
 *
 * The catch-all stays on server rendering so an unknown path still gets a real 404 page.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'docs', renderMode: RenderMode.Prerender },
  { path: 'docs/getting-started', renderMode: RenderMode.Prerender },
  { path: 'docs/theming', renderMode: RenderMode.Prerender },
  { path: 'docs/ai-agents', renderMode: RenderMode.Prerender },
  { path: 'docs/components', renderMode: RenderMode.Prerender },
  {
    path: 'docs/components/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => COMPONENTS.map(component => ({ slug: component.slug }))
  },
  { path: '**', renderMode: RenderMode.Server }
];
