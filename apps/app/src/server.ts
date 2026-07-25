import { AngularAppEngine, createRequestHandler } from '@angular/ssr';

/**
 * Cloudflare Workers entry point.
 *
 * There is no Node runtime here — no Express, no `fs`, no long-lived process. Wrangler serves
 * everything under `dist/apps/app/browser` (which includes every prerendered page) from the assets
 * binding, and only a request matching no asset reaches this handler.
 */
const angularApp = new AngularAppEngine();

const handler = createRequestHandler(async (request: Request) => {
  const response = await angularApp.handle(request);

  return response ?? new Response('Not found', { status: 404 });
});

export default { fetch: handler };
export { handler as reqHandler };
