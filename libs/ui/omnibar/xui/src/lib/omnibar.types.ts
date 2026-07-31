import type { Observable } from 'rxjs';

/** One filter chip above the results. */
export interface XuiOmnibarTag {
  /** What `selectedTags` holds, and what `itemTags` is matched against. */
  id: string;

  /** The chip's label. */
  label: string;

  /** Name of a registered `@ng-icons` icon, shown before the label. */
  icon?: string;
}

/**
 * Fetches the results for a query.
 *
 * Called on every settled keystroke, including the empty query, so a provider
 * decides for itself what an empty search means — everything, nothing, or the
 * things it thinks you want.
 */
export type XuiOmnibarProvider<T> = (query: string) => Promise<readonly T[]> | Observable<readonly T[]>;

/** A rendered row: either a group heading or one of the results. */
export type XuiOmnibarRow<T> = { kind: 'group'; label: string } | { kind: 'item'; item: T; index: number };
