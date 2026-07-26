import { RenderMode, type ServerRoute } from '@angular/ssr';
import { COMPONENTS } from '../generated/manifest';

/**
 * Documentation reads the same for everyone, so every page the app knows about is rendered at build
 * time and served as a static asset — no worker invocation, no cold start, and the HTML carries the
 * API tables and previews for anything that does not run JavaScript.
 *
 * Which is every page there is, so the site ships without a server at all: the catch-all renders in
 * the browser, and an unknown path gets its 404 from the app once it has booted. Rendering that one
 * page in a worker cost a worker — and `@angular/ssr` puts a copy of all 111 prerendered pages
 * inside it, for routes the assets binding serves first.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'docs', renderMode: RenderMode.Prerender },
  { path: 'docs/getting-started', renderMode: RenderMode.Prerender },
  { path: 'docs/theming', renderMode: RenderMode.Prerender },
  { path: 'docs/theme-builder', renderMode: RenderMode.Prerender },
  { path: 'docs/ai-agents', renderMode: RenderMode.Prerender },
  { path: 'docs/components', renderMode: RenderMode.Prerender },
  {
    path: 'docs/components/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => COMPONENTS.map(component => ({ slug: component.slug }))
  },
  { path: '404', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client }
];
