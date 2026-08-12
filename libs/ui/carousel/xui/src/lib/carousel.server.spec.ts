import type { Type } from '@angular/core';
import { Component, PendingTasks, inject, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { XuiCarouselImports } from '../index';

/**
 * Autoplay on a platform that has no viewer.
 *
 * The carousel's autoplay is a `setInterval` started from a constructor
 * `effect`, and a constructor `effect` runs during server change detection like
 * any other. So the timer starts on the server, and every tick it manages before
 * the response is serialised moves `index` — which drives `transform`,
 * `opacity`, `aria-hidden`, `inert` and `aria-current`. The slide a reader sees
 * before hydration is therefore a function of how long the render took.
 *
 * Two things about *how* this is measured, both of which cost a wrong answer
 * first:
 *
 * - **Count the timers started, not the timers left pending.** `liveAfter` below
 *   is `0` whether or not the bug is present: `renderApplication` destroys the
 *   application, destroying the effect, and the effect's own `onCleanup` clears
 *   the interval. An "assert nothing is still scheduled" test passes green
 *   against the unguarded component and proves nothing at all. `started` is the
 *   count that bites.
 * - **Assert the slide is the first one, not that two renders agree.** Two
 *   renders that drifted by the same number of ticks compare equal, and in
 *   practice they often do — see the byte-for-byte case at the bottom, which is
 *   kept because it is the shape of the downstream gate, not because it is
 *   evidence on its own.
 *
 * `Sabotage` exists because every assertion here is of the form "a number is
 * zero" or "a value is the initial one", and all of them would read green
 * against a harness that never saw the component render at all. It is a
 * component with the defect written on purpose, and the three cases under "the
 * harness itself" prove this file notices each half of it.
 */

function render(root: Type<unknown>): Promise<string> {
  return renderApplication(context => bootstrapApplication(root, {}, context), {
    document: '<html><body><xui-root></xui-root></body></html>'
  });
}

interface Trace {
  /** Intervals started at any point during the render. The load-bearing number. */
  started: number;
  /**
   * Intervals still scheduled when the response resolved. `0` for anything that
   * schedules from an `effect`, whose cleanup the teardown runs; non-zero only
   * for a timer with no cleanup at all. See above for why that makes it a poor
   * detector of this particular defect.
   */
  liveAfter: number;
  html: string;
}

/** Renders `root`, counting every `setInterval` the render starts. */
async function trace(root: Type<unknown>): Promise<Trace> {
  const realSet = globalThis.setInterval;
  const realClear = globalThis.clearInterval;
  const live = new Set<unknown>();
  let started = 0;

  (globalThis as unknown as { setInterval: unknown }).setInterval = (...args: unknown[]) => {
    const id = (realSet as (...a: unknown[]) => unknown)(...args);
    started++;
    live.add(id);
    return id;
  };
  (globalThis as unknown as { clearInterval: unknown }).clearInterval = (id: unknown) => {
    live.delete(id);
    return (realClear as (a: unknown) => unknown)(id);
  };

  try {
    const html = await render(root);
    return { started, liveAfter: live.size, html };
  } finally {
    globalThis.setInterval = realSet;
    globalThis.clearInterval = realClear;
    // Whatever the render left behind must not outlive this case, or a leak here
    // becomes a mystery somewhere else in the file.
    for (const id of live) {
      realClear(id as ReturnType<typeof setInterval>);
    }
  }
}

/** Holds the application unstable, so the render takes real time — as a data fetch would. */
@Component({ selector: 'xui-slow', template: `` })
class Slow {
  private readonly tasks = inject(PendingTasks);

  constructor() {
    this.tasks.run(() => new Promise<void>(resolve => setTimeout(resolve, 250)));
  }
}

/**
 * `[loop]="false"` on every case that asserts which slide was served, and that
 * is not incidental.
 *
 * Looping over three slides returns to the first every third tick, so a render
 * that drifted had a one-in-three chance of drifting all the way back to the
 * right answer — and measured against the unguarded component these cases came
 * up green about as often as red. A test that is only sometimes capable of
 * failing is the same defect as a test that never is, spread thinner.
 *
 * With looping off, `next()` clamps at the last slide, so a single tick moves
 * `index` off zero and nothing ever brings it back. One tick anywhere in the
 * render is then enough to fail, whatever the machine was doing at the time.
 */
@Component({
  selector: 'xui-root',
  imports: [XuiCarouselImports, Slow],
  template: `
    <xui-slow />
    <xui-carousel autoplay [loop]="false" [interval]="20">
      <xui-carousel-item>One</xui-carousel-item>
      <xui-carousel-item>Two</xui-carousel-item>
      <xui-carousel-item>Three</xui-carousel-item>
    </xui-carousel>
  `
})
class AutoplayingSlowly {}

@Component({
  selector: 'xui-root',
  imports: [XuiCarouselImports, Slow],
  template: `
    <xui-slow />
    <xui-carousel autoplay effect="fade" [loop]="false" [interval]="20">
      <xui-carousel-item>One</xui-carousel-item>
      <xui-carousel-item>Two</xui-carousel-item>
      <xui-carousel-item>Three</xui-carousel-item>
    </xui-carousel>
  `
})
class FadingSlowly {}

/** The looping default, for the byte-for-byte case, which does not name a slide. */
@Component({
  selector: 'xui-root',
  imports: [XuiCarouselImports, Slow],
  template: `
    <xui-slow />
    <xui-carousel autoplay [interval]="20">
      <xui-carousel-item>One</xui-carousel-item>
      <xui-carousel-item>Two</xui-carousel-item>
      <xui-carousel-item>Three</xui-carousel-item>
    </xui-carousel>
  `
})
class LoopingSlowly {}

/**
 * The defect, written on purpose, in a component this library does not ship.
 * Proves `trace` can see an interval and that the drift is visible in the markup
 * — without which every green below is green for lack of looking.
 */
@Component({
  selector: 'xui-root',
  imports: [Slow],
  template: `<xui-slow />
    <p>{{ ticks() }}</p>`
})
class Sabotage {
  readonly ticks = signal(0);

  constructor() {
    setInterval(() => this.ticks.update(n => n + 1), 20);
  }
}

/**
 * Which dot carries `aria-current`, zero-based, or -1.
 *
 * Reads the whole tag rather than the text after `aria-label`, because the
 * attribute order is not stable and says so: on a slide that never moved, the
 * bindings land in template order and `aria-current` precedes `aria-label`; on
 * one that drifted, it was removed and re-added and trails everything. Matching
 * only forwards found the drifted markup and missed the correct markup, which is
 * the wrong way round for a regression test.
 */
function activeDot(html: string): number {
  const dots = [...html.matchAll(/<button[^>]*>/g)].filter(([tag]) => tag.includes('Go to slide'));
  return dots.findIndex(([tag]) => tag.includes('aria-current'));
}

const transform = (html: string) => /translateX\((-?\d+(?:\.\d+)?)%\)/.exec(html)?.[1];

describe('XuiCarousel on the server', () => {
  describe('the harness itself', () => {
    it('counts an interval a render starts', async () => {
      const { started } = await trace(Sabotage);

      expect(started).toBeGreaterThan(0);
    });

    it('sees a timer move what gets served', async () => {
      // The other half: an interval that fires is only a defect because its
      // effect reaches the response. If a rendered value could not move, the
      // "first slide" assertions below would hold against anything.
      const { html } = await trace(Sabotage);

      expect(html).not.toContain('<p>0</p>');
    });

    it('does see a timer that really is left behind', async () => {
      // `Sabotage` schedules its interval bare, with no cleanup, so it survives
      // the render — which is what makes `liveAfter` a real detector rather than
      // a number that is always 0.
      //
      // It is also the contrast that explains the carousel's own case below.
      // The carousel schedules from an `effect` with an `onCleanup`, and
      // destroying the application runs it, so the carousel's `liveAfter` was
      // already 0 *with the defect present*. That is why the case that had to go
      // red first is `started`, not `liveAfter`.
      const { started, liveAfter } = await trace(Sabotage);

      expect(started).toBeGreaterThan(0);
      expect(liveAfter).toBeGreaterThan(0);
    });
  });

  it('starts no autoplay timer during a render', async () => {
    const { started, liveAfter } = await trace(AutoplayingSlowly);

    // `started`, not "nothing is left scheduled" — see the note at the top of
    // this file. A guard that skipped `next()` but still called `setInterval`
    // would satisfy every markup assertion below and still burn a timer per
    // request, and `liveAfter` would not notice either way.
    expect(started).toBe(0);
    // Kept because a timer outliving a request is the worse failure and this is
    // where it would show. It is not what turned this case red: it read 0
    // against the unguarded component too.
    expect(liveAfter).toBe(0);
  });

  it('serves the first slide however long the render takes', async () => {
    const { html } = await trace(AutoplayingSlowly);

    // The *first* slide, named. "The two renders agree" is not this assertion:
    // two renders that drifted equally agree.
    expect(transform(html)).toBe('0');
    expect(activeDot(html)).toBe(0);
  });

  // There is deliberately no case here for a render with nothing to wait for.
  // A warm render does sometimes drift — measured at one tick with no pending
  // work at all — but whether it beats the first tick depends on the machine,
  // and even at a 1ms interval it came up green against the unguarded component
  // more often than red. An assertion that cannot be relied on to fail against
  // the defect is the failure this file is otherwise built to avoid, so the
  // observation is recorded here rather than pinned by a case that would mostly
  // pass for the wrong reason.

  it('leaves the first slide visible and the rest inert when crossfading', async () => {
    // `fade` reaches the response through different attributes than `scrollx`:
    // opacity and inert rather than a transform.
    const { html } = await trace(FadingSlowly);

    const slides = [...html.matchAll(/col-start-1 row-start-1[^>]*>/g)].map(([tag]) => tag);
    expect(slides).toHaveLength(3);
    expect(slides[0]).toContain('opacity: 1');
    expect(slides[0]).not.toContain('inert');
    expect(slides[1]).toContain('inert');
    expect(slides[2]).toContain('inert');
    expect(activeDot(html)).toBe(0);
  });

  it('renders the same bytes twice', async () => {
    // The shape of the downstream SSR gate: two concurrent renders compared with
    // no waiver. Kept because that is the gate this fix is for, and explicitly
    // not as evidence — measured against the unguarded component it failed some
    // runs and passed others, because two renders that drifted by the same
    // number of ticks agree with each other while both being wrong. Every
    // assertion above names the first slide for that reason.
    const [a, b] = await Promise.all([render(LoopingSlowly), render(LoopingSlowly)]);

    expect(a).toBe(b);
  });
});
