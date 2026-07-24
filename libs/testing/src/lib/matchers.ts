/**
 * Assertions for CVA-generated class lists.
 *
 * Component classes come out of `xui()` (clsx + tailwind-merge), so their order
 * is an implementation detail and the full string changes whenever a variant is
 * re-tuned. Tests should assert that the classes carrying the behaviour under
 * test are present, never that the whole string equals a literal.
 */

/**
 * The element's classes as a set, order-independent.
 *
 * Reads `classList` rather than `className`, which on an SVG element is an
 * `SVGAnimatedString` rather than a string.
 */
export function classesOf(element: Element): Set<string> {
  return new Set(element.classList);
}

/** The element's classes as a string, for error messages. */
function classNameOf(element: Element): string {
  return element.getAttribute('class') ?? '';
}

/** Assert every listed class is applied. */
export function expectClasses(element: Element, ...classes: string[]): void {
  const applied = classesOf(element);
  const missing = classes.filter(c => !applied.has(c));

  if (missing.length > 0) {
    throw new Error(`Expected classes ${missing.join(', ')} to be applied.\nGot: ${classNameOf(element)}`);
  }
}

/** Assert none of the listed classes is applied. */
export function expectNoClasses(element: Element, ...classes: string[]): void {
  const applied = classesOf(element);
  const present = classes.filter(c => applied.has(c));

  if (present.length > 0) {
    throw new Error(`Expected classes ${present.join(', ')} not to be applied.\nGot: ${classNameOf(element)}`);
  }
}

/**
 * Assert the element carries every listed `aria-*`/`data-*`/plain attribute.
 *
 * A `null` expectation asserts the attribute is absent, which is how Angular
 * removes an attribute binding — distinct from an empty-string value.
 */
export function expectAttributes(element: Element, attributes: Record<string, string | null>): void {
  for (const [name, expected] of Object.entries(attributes)) {
    const actual = element.getAttribute(name);

    if (actual !== expected) {
      throw new Error(
        `Expected attribute ${name} to be ${expected === null ? 'absent' : `"${expected}"`}, got ${actual === null ? 'absent' : `"${actual}"`}.`
      );
    }
  }
}
