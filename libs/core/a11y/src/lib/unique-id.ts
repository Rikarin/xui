let sequence = 0;

/**
 * A DOM id that is unique within the document.
 *
 * Overlay surfaces wire `aria-labelledby`/`aria-describedby` between elements
 * that live in different parts of the tree, so they need a stable id even when
 * the consumer did not supply one.
 *
 * The counter is module-scoped, so ids are stable per bundle instance and
 * therefore reproducible in tests — reset it with {@link resetUniqueIdSequence}
 * if a test asserts on the exact value.
 */
export function uniqueId(prefix = 'xui'): string {
  return `${prefix}-${sequence++}`;
}

/** Reset the id counter. Intended for tests that assert on generated ids. */
export function resetUniqueIdSequence(): void {
  sequence = 0;
}

/**
 * Resolve a caller-supplied id, generating one when absent.
 *
 * ```ts
 * readonly id = input<string | null>(null);
 * protected readonly resolvedId = computed(() => resolveId(this.id(), 'xui-dialog-title'));
 * ```
 */
export function resolveId(id: string | null | undefined, prefix = 'xui'): string {
  return id ?? uniqueId(prefix);
}
