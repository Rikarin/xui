import { Injectable, inject } from '@angular/core';

let sequence = 0;

/**
 * Allocates the generated DOM ids a page needs, one set of counters per
 * application.
 *
 * The counters have to be scoped to something, and the process is the one scope
 * that is wrong. A server renders many pages from one process, so an id drawn
 * from a module-level counter makes the response a function of how many pages
 * the process has already served: the same request answered twice comes back
 * with `xui-dialog-title-1` once and `xui-dialog-title-4` the next time. Nothing
 * identifying leaks — it is a monotonic counter — but the response stops being a
 * function of the request, so nothing downstream can compare, cache or diff two
 * renders.
 *
 * `providedIn: 'root'` puts the counters in the application's own injector, and
 * an application is exactly one render — one server request, or one page in the
 * browser. Two renders count from the same place, and so does the client that
 * takes over from either. It also removes the need for a reset hook: a test that
 * pins an exact id gets a fresh injector from `TestBed`, which is a fresh set of
 * counters.
 *
 * Counting per prefix rather than from one shared counter costs a map and buys
 * ids that hold still. `xui-dialog-title-0` stays `xui-dialog-title-0` when a
 * tooltip is added elsewhere on the page, so a consumer's selector, snapshot or
 * anchor link survives edits to markup it has nothing to do with. Two prefixes
 * cannot collide with each other: a generated id is a prefix followed by
 * `-<digits>`, so agreeing on a value would take two callers agreeing on a
 * prefix.
 */
@Injectable({ providedIn: 'root' })
export class XIdSequence {
  private readonly counters = new Map<string, number>();

  /** This application's next id under `prefix`. */
  next(prefix: string): string {
    const count = this.counters.get(prefix) ?? 0;
    this.counters.set(prefix, count + 1);

    return `${prefix}-${count}`;
  }
}

/**
 * A DOM id that is unique within the page. Call it from an injection context.
 *
 * Overlay surfaces wire `aria-labelledby`/`aria-describedby` between elements
 * that live in different parts of the tree, so they need a stable id even when
 * the consumer did not supply one.
 *
 * ```ts
 * protected readonly titleId = injectUniqueId('xui-dialog-title');
 * ```
 *
 * A field initialiser is an injection context, and it is where an id that
 * reaches markup belongs: the id has to exist before the first render and must
 * not change afterwards. Anything allocated later is a value the client would
 * disagree with the server about.
 */
export function injectUniqueId(prefix = 'xui'): string {
  return inject(XIdSequence).next(prefix);
}

/**
 * A process-wide DOM id.
 *
 * @deprecated Use {@link injectUniqueId}, which counts per application rather
 * than per process. An id from this counter depends on how many pages the
 * process has already rendered, so two server responses to the same request
 * differ — see {@link XIdSequence}. Kept working for callers outside an
 * injection context; it goes in the next major.
 */
export function uniqueId(prefix = 'xui'): string {
  return `${prefix}-${sequence++}`;
}

/**
 * Reset the process-wide counter.
 *
 * @deprecated Only {@link uniqueId} reads it, and {@link injectUniqueId} needs no
 * reset: every `TestBed` gets a fresh application injector, and with it a fresh
 * set of counters.
 */
export function resetUniqueIdSequence(): void {
  sequence = 0;
}

/**
 * Resolve a caller-supplied id, generating one when absent.
 *
 * @deprecated Generates from the process-wide {@link uniqueId}, and from a
 * `computed` at that — which allocates during change detection rather than
 * before the first render. Declare the fallback where the id is declared, so it
 * comes from the application's own sequence:
 *
 * ```ts
 * readonly id = input<string | null>(injectUniqueId('xui-dialog-title'));
 * ```
 */
export function resolveId(id: string | null | undefined, prefix = 'xui'): string {
  return id ?? uniqueId(prefix);
}
