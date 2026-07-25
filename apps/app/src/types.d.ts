/**
 * `AngularAppEngine` is exported by `@angular/ssr` at runtime — the built server bundle re-exports
 * it — but 22.0.8 leaves it out of the published types, which describe only the Node entry point.
 * Declared here so the Workers entry can be written against it without an `any`.
 *
 * The `export {}` matters: without it this file is a script rather than a module, and the block
 * below would replace `@angular/ssr`'s types instead of adding to them.
 */
export {};

declare module '@angular/ssr' {
  export class AngularAppEngine {
    handle(request: Request, requestContext?: unknown): Promise<Response | null>;
  }
}
