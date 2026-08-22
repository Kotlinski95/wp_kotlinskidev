import { test, expect, type Page } from "@playwright/test";
import { acceptCookies } from "./utils";
import { createFixturePage, deleteFixturePage } from "./wp-cli";

function buildSlides(count: number, withLink = false): string {
  const slides = [];
  for (let i = 0; i < count; i += 1) {
    // A ticker's slides continuously scroll out of view, so a link on only
    // one slide can't reliably be targeted by position — put it on every
    // slide instead, and the test picks whichever instance is on-screen.
    const inner = withLink
      ? `<div class="wp-block-cover__inner-container"><p>Banner heading ${i}</p><a href="#slide-${i}">Read more</a></div>`
      : `<div class="wp-block-cover__inner-container"><p>Banner heading ${i}</p></div>`;
    slides.push(
      `<div class="swiper-slide" data-slide-id="${i}" style="width:300px;height:200px">${inner}</div>`
    );
  }
  return slides.join("");
}

function buildSliderContent(attrs: Record<string, unknown>, slidesHtml: string): string {
  const attrsJson = JSON.stringify(attrs);
  return `<!-- wp:wpe/slider ${attrsJson} -->\n${slidesHtml}\n<!-- /wp:wpe/slider -->`;
}

async function getWrapperTranslateX(page: Page): Promise<number> {
  return page.evaluate(() => {
    const wrapper = document.querySelector(".wp-block-wpe-slider .swiper-wrapper") as HTMLElement;
    const transform = getComputedStyle(wrapper).transform;
    if (!transform || transform === "none") {
      return 0;
    }
    const match = transform.match(/matrix\(([^)]+)\)/);
    if (!match) {
      return 0;
    }
    return parseFloat(match[1].split(",")[4].trim());
  });
}

// Arms a requestAnimationFrame sampler that records { t, x } from the moment
// it's called. Must be armed *before* the leave/blur action so the very
// first frames of the resumed transition are captured — a plain
// before/after poll can miss a fast, small discontinuity entirely.
async function armHighFrequencySampler(page: Page, durationMs = 500): Promise<void> {
  await page.evaluate((duration) => {
    const wrapper = document.querySelector(".wp-block-wpe-slider .swiper-wrapper") as HTMLElement;
    const samples: Array<{ t: number; x: number }> = [];
    (window as unknown as { __samples: typeof samples }).__samples = samples;
    const start = performance.now();
    const parse = () => {
      const transform = getComputedStyle(wrapper).transform;
      if (!transform || transform === "none") {
        return 0;
      }
      const m = transform.match(/matrix\(([^)]+)\)/);
      if (!m) {
        return 0;
      }
      return parseFloat(m[1].split(",")[4].trim());
    };
    const tick = () => {
      samples.push({ t: performance.now() - start, x: parse() });
      if (performance.now() - start < duration) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, durationMs);
}

async function readSamples(page: Page): Promise<Array<{ t: number; x: number }>> {
  return page.evaluate(
    () => (window as unknown as { __samples: Array<{ t: number; x: number }> }).__samples
  );
}

async function getOnScreenLinkCenter(page: Page): Promise<{ x: number; y: number }> {
  const sliderBox = await page.locator(".wp-block-wpe-slider").boundingBox();
  if (!sliderBox) {
    throw new Error("slider not found");
  }
  const links = page.locator(".wp-block-wpe-slider a");
  const count = await links.count();
  for (let i = 0; i < count; i += 1) {
    const box = await links.nth(i).boundingBox();
    if (box && box.x >= sliderBox.x && box.x + box.width <= sliderBox.x + sliderBox.width) {
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    }
  }
  throw new Error("no on-screen link found");
}

test.describe("Slider (wpe/slider) — continuousAutoplay", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  const slug = "e2e-fixture-slider-continuous";
  let fixtureUrl: string;

  test.beforeAll(() => {
    const content =
      `<div style="height:1400px">Spacer</div>` +
      buildSliderContent(
        {
          continuousAutoplay: true,
          autoplay: true,
          autoplayTime: 2,
          loop: true,
          pagination: false,
          navigation: false,
        },
        buildSlides(4, true)
      );
    fixtureUrl = createFixturePage(slug, "E2E Fixture — Slider Continuous Autoplay", content).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
  });

  test("does not move while still off-screen", async ({ page }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await expect(slider).toHaveClass(/swiper-initialized/);

    const before = await getWrapperTranslateX(page);
    await page.waitForTimeout(500);
    const after = await getWrapperTranslateX(page);

    expect(after).toBe(before);
  });

  test("starts moving once scrolled into view", async ({ page }) => {
    await page.locator(".wp-block-wpe-slider").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const before = await getWrapperTranslateX(page);
    await page.waitForTimeout(500);
    const after = await getWrapperTranslateX(page);

    expect(after).not.toBe(before);
  });

  test("hovering over the carousel freezes it at its exact current position — no snap, no jump", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await slider.hover();
    const atHover = await getWrapperTranslateX(page);
    await page.waitForTimeout(800);
    const afterHold = await getWrapperTranslateX(page);

    expect(afterHold).toBe(atHover);
  });

  test("hovering over a nested link inside a slide also pauses it (not just the bare container)", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // The link lives inside the continuously-translating .swiper-wrapper, so
    // Playwright's own .hover() can never see it as "stable", and any single
    // slide's link cycles in and out of view as the ticker scrolls — move
    // the real cursor to whichever link instance is currently on-screen.
    const center = await getOnScreenLinkCenter(page);
    await page.mouse.move(center.x, center.y);

    const atHover = await getWrapperTranslateX(page);
    await page.waitForTimeout(800);
    const afterHold = await getWrapperTranslateX(page);

    expect(afterHold).toBe(atHover);
  });

  test("resumes moving from the exact frozen position once the pointer leaves", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const box = await slider.boundingBox();
    expect(box).not.toBeNull();

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.waitForTimeout(400);
    const frozenAt = await getWrapperTranslateX(page);

    await page.mouse.move(10, 10);
    await page.waitForTimeout(2000);
    const later = await getWrapperTranslateX(page);
    expect(later).not.toBe(frozenAt);
  });

  test("dragging by hand and releasing the mouse while still over the carousel keeps it paused — only leaving afterward resumes it", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const box = await slider.boundingBox();
    expect(box).not.toBeNull();
    const center = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };

    await page.mouse.move(center.x, center.y);
    await page.waitForTimeout(200);
    await page.mouse.down();
    await page.mouse.move(center.x - 60, center.y, { steps: 10 });
    await page.mouse.move(center.x - 120, center.y, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(200);
    const afterRelease = await getWrapperTranslateX(page);
    await page.waitForTimeout(800);
    const afterHold = await getWrapperTranslateX(page);

    expect(afterHold).toBe(afterRelease);

    await page.mouse.move(10, 10);
    await page.waitForTimeout(800);
    const afterLeave = await getWrapperTranslateX(page);
    expect(afterLeave).not.toBe(afterHold);
  });

  test("a slow drag held past Swiper's own internal 200ms threshold still stays paused on release while still hovering — Swiper's FreeMode module force-resumes autoplay via _freeModeStaticRelease once a drag runs that long, regardless of our own hover tracking, unless explicitly overridden", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const box = await slider.boundingBox();
    expect(box).not.toBeNull();
    const center = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };

    await page.mouse.move(center.x, center.y);
    await page.waitForTimeout(200);
    await page.mouse.down();
    await page.mouse.move(center.x - 40, center.y, { steps: 5 });
    await page.waitForTimeout(150);
    await page.mouse.move(center.x - 80, center.y, { steps: 5 });
    await page.waitForTimeout(150);
    await page.mouse.move(center.x - 120, center.y, { steps: 5 });
    // Total elapsed since mousedown is now well past the 200ms threshold.
    await page.mouse.up();
    await page.waitForTimeout(200);
    const afterRelease = await getWrapperTranslateX(page);
    await page.waitForTimeout(1000);
    const afterHold = await getWrapperTranslateX(page);

    expect(afterHold).toBe(afterRelease);

    await page.mouse.move(10, 10);
    await page.waitForTimeout(800);
    const afterLeave = await getWrapperTranslateX(page);
    expect(afterLeave).not.toBe(afterHold);
  });

  test("after letting several full autoplay cycles complete naturally first, dragging and releasing inside still stays paused (checks for a stale transitionend-driven auto-resume left dangling from an earlier cycle)", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    // autoplayTime is 2s (2000ms speed per cycle) in this fixture — let ~3
    // full natural cycles complete untouched before ever touching the mouse.
    await page.waitForTimeout(6500);

    const box = await slider.boundingBox();
    expect(box).not.toBeNull();
    const center = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };

    await page.mouse.move(center.x, center.y);
    await page.waitForTimeout(200);
    await page.mouse.down();
    await page.mouse.move(center.x - 60, center.y, { steps: 10 });
    await page.mouse.move(center.x - 120, center.y, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(200);
    const afterRelease = await getWrapperTranslateX(page);

    // Hold well past a full cycle length — long enough for any dangling
    // transitionend listener from an earlier cycle to have fired and forced
    // a resume, if one exists.
    await page.waitForTimeout(3000);
    const afterHold = await getWrapperTranslateX(page);

    expect(afterHold).toBe(afterRelease);

    await page.mouse.move(10, 10);
    await page.waitForTimeout(800);
    const afterLeave = await getWrapperTranslateX(page);
    expect(afterLeave).not.toBe(afterHold);
  });

  test("pause, resume (real mouse-out), then re-pause (real mouse-in) again while the resumed transition is still mid-flight — must stay paused, not get force-resumed once that in-flight transition eventually finishes", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const box = await slider.boundingBox();
    expect(box).not.toBeNull();
    const center = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
    const outside = { x: 10, y: 10 };

    // Cycle 1: real hover in/out with a real resumed transition each time,
    // never dragging — pure hover pause/resume, repeated several times so
    // any dangling transitionend-driven auto-resume from an earlier cycle
    // has a chance to misfire against a later, still-active pause.
    for (let i = 0; i < 4; i += 1) {
      await page.mouse.move(center.x, center.y);
      await page.waitForTimeout(150);
      await page.mouse.move(outside.x, outside.y);
      await page.waitForTimeout(150);
    }

    // Now pause and hold for a long time — long enough for several of the
    // short resumed transitions above to have long since completed, so any
    // dangling listener from them would have already misfired if it exists.
    await page.mouse.move(center.x, center.y);
    await page.waitForTimeout(300);
    const frozenAt = await getWrapperTranslateX(page);
    await page.waitForTimeout(3000);
    const stillFrozenAt = await getWrapperTranslateX(page);

    expect(stillFrozenAt).toBe(frozenAt);
  });

  test("dragging by hand and releasing the mouse outside the carousel resumes it, without needing a separate hover-out", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const box = await slider.boundingBox();
    expect(box).not.toBeNull();
    const center = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };

    await page.mouse.move(center.x, center.y);
    await page.waitForTimeout(200);
    await page.mouse.down();
    await page.mouse.move(10, center.y, { steps: 10 });
    await page.mouse.move(10, 10, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(200);
    const afterRelease = await getWrapperTranslateX(page);
    await page.waitForTimeout(800);
    const afterHold = await getWrapperTranslateX(page);

    expect(afterHold).not.toBe(afterRelease);
  });

  test("measures resumed-segment velocity vs baseline velocity across many different pause timings within a cycle, across a loop-boundary crossing — must never run faster than normal before self-correcting on the next cycle", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const box = await slider.boundingBox();
    const center = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };

    const baselineA = await getWrapperTranslateX(page);
    await page.waitForTimeout(200);
    const baselineB = await getWrapperTranslateX(page);
    const baselineRate = Math.abs(baselineB - baselineA) / 200;

    interface SwiperInternals {
      activeIndex: number;
      realIndex: number;
      snapGrid: number[];
      animating: boolean;
      translate: number;
    }

    const results: Array<{
      holdMs: number;
      resumedRate: number;
      ratio: number;
      atFreeze: SwiperInternals;
      atResumeCall: SwiperInternals;
    }> = [];
    const holdPattern = [50, 90, 130, 170, 210, 260, 310, 370, 430, 500, 600, 750, 950, 1250];

    const getInternals = (): Promise<SwiperInternals> =>
      page.evaluate(() => {
        const el = document.querySelector(".wp-block-wpe-slider") as HTMLElement & {
          swiper: {
            activeIndex: number;
            realIndex: number;
            snapGrid: number[];
            animating: boolean;
            translate: number;
          };
        };
        return {
          activeIndex: el.swiper.activeIndex,
          realIndex: el.swiper.realIndex,
          snapGrid: el.swiper.snapGrid,
          animating: el.swiper.animating,
          translate: el.swiper.translate,
        };
      });

    for (let cycle = 0; cycle < 20; cycle += 1) {
      const holdMs = holdPattern[cycle % holdPattern.length];
      await page.mouse.move(center.x, center.y);
      await page.waitForTimeout(holdMs);
      const atFreeze = await getInternals();

      await armHighFrequencySampler(page, 250);
      await page.mouse.move(10, 10);
      const atResumeCall = await getInternals();
      await page.waitForTimeout(300);
      const samples = await readSamples(page);

      const early = samples.filter((s) => s.t < 120);
      if (early.length >= 2) {
        const first = early[0];
        const last = early[early.length - 1];
        const resumedRate = Math.abs(last.x - first.x) / (last.t - first.t || 1);
        const ratio = resumedRate / baselineRate;
        results.push({ holdMs, resumedRate, ratio, atFreeze, atResumeCall });
      }

      await page.waitForTimeout(200 + (cycle % 5) * 70);
    }

    results.forEach(({ holdMs, resumedRate, ratio, atFreeze, atResumeCall }) => {
      expect(
        resumedRate,
        `holdMs=${holdMs} ratio=${ratio} atFreeze=${JSON.stringify(atFreeze)} atResumeCall=${JSON.stringify(atResumeCall)}`
      ).toBeLessThan(baselineRate * 1.5);
    });
  });

  test("dragging left then right back to the exact starting position (still held), then releasing outside the carousel, never produces a visible teleport on resume — the drag-end catch-up must never re-navigate through Swiper's own index API for the leftover distance", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const box = await slider.boundingBox();
    expect(box).not.toBeNull();
    const center = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };

    for (let cycle = 0; cycle < 6; cycle += 1) {
      await page.mouse.move(center.x, center.y);
      await page.waitForTimeout(120 + cycle * 60);
      const startX = await getWrapperTranslateX(page);

      await page.mouse.down();
      await page.mouse.move(center.x - 80, center.y, { steps: 8 });
      await page.mouse.move(center.x, center.y, { steps: 8 });

      await armHighFrequencySampler(page, 300);
      await page.mouse.move(10, 10);
      await page.mouse.up();
      await page.waitForTimeout(400);
      const samples = await readSamples(page);

      for (let i = 1; i < samples.length; i += 1) {
        const frameDelta = Math.abs(samples[i].x - samples[i - 1].x);
        expect(
          frameDelta,
          `cycle=${cycle} startX=${startX} frame ${i}: ${JSON.stringify(samples[i - 1])} -> ${JSON.stringify(samples[i])}`
        ).toBeLessThan(40);
      }

      await page.waitForTimeout(300);
    }
  });

  test("resume-on-hover-out starts from the exact frozen pixel — the saved paused position is the real starting point, not a snap elsewhere", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const box = await slider.boundingBox();
    expect(box).not.toBeNull();

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.waitForTimeout(400);
    const frozenAt = await getWrapperTranslateX(page);

    await armHighFrequencySampler(page, 400);
    await page.mouse.move(10, 10);
    await page.waitForTimeout(500);
    const samples = await readSamples(page);

    // Every sample taken in the first 20ms after leaving must sit within one
    // animation frame's distance of the frozen value (a real OS-level mouse
    // event has a few ms of its own CDP round-trip jitter that a
    // programmatic .focus() doesn't — the equivalent focus-out test below
    // asserts an exact match). A genuine "jump to start" is nowhere close to
    // this small: it lands near translateX:0 or a full slide-width away.
    const earlySamples = samples.filter((s) => s.t < 20);
    expect(earlySamples.length).toBeGreaterThan(0);
    earlySamples.forEach((s) => expect(Math.abs(s.x - frozenAt)).toBeLessThan(10));

    // From there on, motion must be monotonic in one direction and never
    // jump more than a few px between consecutive ~8-16ms frames — a real
    // "jump to start" shows up as one enormous single-frame delta.
    for (let i = 1; i < samples.length; i += 1) {
      const frameDelta = Math.abs(samples[i].x - samples[i - 1].x);
      expect(frameDelta).toBeLessThan(30);
    }
  });

  test("resume-on-focus-out also starts from the exact frozen pixel, not just hover", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const center = await getOnScreenLinkCenter(page);
    await page.mouse.move(center.x, center.y);
    // A real click focuses the link too; use .focus() via a fresh locator at
    // this exact point isn't available, so approximate real usage with a
    // direct move+down+up which both hovers and focuses the link.
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(400);
    const frozenAt = await getWrapperTranslateX(page);

    await armHighFrequencySampler(page, 400);
    // Move the mouse away (clearing hover) and Tab focus elsewhere (clearing
    // focus) — both pause reasons must clear for resume to fire.
    await page.mouse.move(10, 10);
    await page.keyboard.press("Tab");
    await page.waitForTimeout(500);
    const samples = await readSamples(page);

    const earlySamples = samples.filter((s) => s.t < 20);
    expect(earlySamples.length).toBeGreaterThan(0);
    earlySamples.forEach((s) => expect(s.x).toBe(frozenAt));
  });

  test("resumes at roughly the same visual speed regardless of how much of the interrupted transition was already covered — finishing it at the full nominal duration would move slower than normal until the next natural cycle restores speed", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const beforePauseA = await getWrapperTranslateX(page);
    await page.waitForTimeout(200);
    const beforePauseB = await getWrapperTranslateX(page);
    const baselineRate = Math.abs(beforePauseB - beforePauseA) / 200;

    const box = await slider.boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.waitForTimeout(800);
    await page.mouse.move(10, 10);

    await page.waitForTimeout(30);
    const resumedA = await getWrapperTranslateX(page);
    await page.waitForTimeout(200);
    const resumedB = await getWrapperTranslateX(page);
    const resumedRate = Math.abs(resumedB - resumedA) / 200;

    expect(resumedRate).toBeGreaterThan(baselineRate * 0.6);
    expect(resumedRate).toBeLessThan(baselineRate * 1.6);
  });

  test("repeated pause/resume cycles each start from their own exact frozen pixel — no cumulative drift or jump on the 2nd/3rd cycle", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const box = await slider.boundingBox();
    const center = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };

    for (let cycle = 0; cycle < 3; cycle += 1) {
      await page.mouse.move(center.x, center.y);
      await page.waitForTimeout(300);
      const frozenAt = await getWrapperTranslateX(page);

      await armHighFrequencySampler(page, 200);
      await page.mouse.move(10, 10);
      await page.waitForTimeout(250);
      const samples = await readSamples(page);
      const earlySamples = samples.filter((s) => s.t < 20);

      expect(earlySamples.length).toBeGreaterThan(0);
      earlySamples.forEach((s) => expect(Math.abs(s.x - frozenAt)).toBeLessThan(10));

      await page.waitForTimeout(300);
    }
  });

  test("rapid repeated hover in/out never advances the active slide — resuming finishes the interrupted transition instead of firing a brand-new slideNext() on every hover-out", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const box = await slider.boundingBox();
    const inside = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
    const outside = { x: 10, y: 10 };

    const activeIndexBefore = await page.evaluate(
      () =>
        (
          document.querySelector(".wp-block-wpe-slider") as HTMLElement & {
            swiper: { activeIndex: number };
          }
        ).swiper.activeIndex
    );

    for (let i = 0; i < 8; i += 1) {
      await page.mouse.move(inside.x, inside.y);
      await page.waitForTimeout(30);
      await page.mouse.move(outside.x, outside.y);
      await page.waitForTimeout(30);
    }

    const activeIndexAfter = await page.evaluate(
      () =>
        (
          document.querySelector(".wp-block-wpe-slider") as HTMLElement & {
            swiper: { activeIndex: number };
          }
        ).swiper.activeIndex
    );

    expect(activeIndexAfter).toBe(activeIndexBefore);
  });

  test("pressing (pointerdown) on plain non-focusable slide text also pauses it", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const heading = page.locator(".wp-block-wpe-slider p", { hasText: "Banner heading 0" });
    await heading.dispatchEvent("pointerdown");
    const atPress = await getWrapperTranslateX(page);
    await page.waitForTimeout(800);
    const afterHold = await getWrapperTranslateX(page);

    expect(afterHold).toBe(atPress);
  });

  test("clicking inside the carousel while already hover-paused does not resume it", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const box = await slider.boundingBox();
    expect(box).not.toBeNull();
    const center = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };

    await page.mouse.move(center.x, center.y);
    await page.waitForTimeout(400);
    const frozenAt = await getWrapperTranslateX(page);

    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(800);
    const afterClick = await getWrapperTranslateX(page);

    expect(afterClick).toBe(frozenAt);
  });

  test("resumes once the user clicks outside the carousel after a click-triggered pause", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const heading = page.locator(".wp-block-wpe-slider p", { hasText: "Banner heading 0" });
    await heading.dispatchEvent("pointerdown");
    await page.waitForTimeout(300);
    const frozenAt = await getWrapperTranslateX(page);

    await page.mouse.move(10, 10);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(800);
    const later = await getWrapperTranslateX(page);

    expect(later).not.toBe(frozenAt);
  });

  test("full lifecycle: page load, scroll into view, hover in/out, focus in/out, click in/out — each transition holds or resumes correctly with no jump at any step", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");

    // 1. Page load — off-screen, must not be moving yet.
    await expect(slider).toHaveClass(/swiper-initialized/);
    const beforeScroll1 = await getWrapperTranslateX(page);
    await page.waitForTimeout(300);
    const beforeScroll2 = await getWrapperTranslateX(page);
    expect(beforeScroll2).toBe(beforeScroll1);

    // 2. Scroll into view — must start moving.
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const movingA = await getWrapperTranslateX(page);
    await page.waitForTimeout(400);
    const movingB = await getWrapperTranslateX(page);
    expect(movingB).not.toBe(movingA);

    const box = await slider.boundingBox();
    const center = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };

    // 3. Hover in — freezes.
    await page.mouse.move(center.x, center.y);
    await page.waitForTimeout(300);
    const frozenAtHover = await getWrapperTranslateX(page);
    await page.waitForTimeout(300);
    expect(await getWrapperTranslateX(page)).toBe(frozenAtHover);

    // 4. Hover out — resumes from that exact frozen pixel, no jump.
    await armHighFrequencySampler(page, 300);
    await page.mouse.move(10, 10);
    await page.waitForTimeout(400);
    const samplesAfterHover = await readSamples(page);
    samplesAfterHover
      .filter((s) => s.t < 20)
      .forEach((s) => expect(Math.abs(s.x - frozenAtHover)).toBeLessThan(10));

    // 5. Focus in (Tab to the on-screen link) — freezes again.
    const linkCenter = await getOnScreenLinkCenter(page);
    await page.mouse.move(linkCenter.x, linkCenter.y);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(300);
    const frozenAtFocus = await getWrapperTranslateX(page);
    await page.waitForTimeout(300);
    expect(await getWrapperTranslateX(page)).toBe(frozenAtFocus);

    // 6. Focus out (Tab away) — resumes from that exact frozen pixel.
    await armHighFrequencySampler(page, 300);
    await page.mouse.move(10, 10);
    await page.keyboard.press("Tab");
    await page.waitForTimeout(400);
    const samplesAfterFocus = await readSamples(page);
    samplesAfterFocus
      .filter((s) => s.t < 20)
      .forEach((s) => expect(Math.abs(s.x - frozenAtFocus)).toBeLessThan(10));

    // 7. Click (mousedown) inside — freezes again.
    await page.mouse.move(center.x, center.y);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(300);
    const frozenAtClick = await getWrapperTranslateX(page);
    await page.waitForTimeout(300);
    expect(await getWrapperTranslateX(page)).toBe(frozenAtClick);

    // 8. Click outside — resumes from that exact frozen pixel.
    await armHighFrequencySampler(page, 300);
    await page.mouse.move(10, 10);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(400);
    const samplesAfterClick = await readSamples(page);
    samplesAfterClick
      .filter((s) => s.t < 20)
      .forEach((s) => expect(Math.abs(s.x - frozenAtClick)).toBeLessThan(10));
  });

  test("stress: repeated pause/resume across many cycles (spanning a full loop wrap) never produces a large jump", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const box = await slider.boundingBox();
    const center = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };

    // A real jump (the originally reported bug) was on the order of
    // 700-1700px. Normal transition-start timing variance tops out around
    // 60-70px. This threshold sits well between the two, and running many
    // cycles at varying intervals guarantees at least one pause lands near
    // Swiper's internal loop-wrap boundary, which is exactly where the
    // original bug only showed up (never on the first couple of cycles).
    const JUMP_THRESHOLD = 150;

    for (let cycle = 0; cycle < 12; cycle += 1) {
      await page.mouse.move(center.x, center.y);
      await page.waitForTimeout(150);
      const frozenAt = await getWrapperTranslateX(page);

      await page.mouse.move(10, 10);
      await page.waitForTimeout(30);
      const afterLeave = await getWrapperTranslateX(page);

      expect(Math.abs(afterLeave - frozenAt)).toBeLessThan(JUMP_THRESHOLD);

      await page.waitForTimeout(300 + cycle * 60);
    }
  });

  test("stress: hovering never causes a jump at the moment of pause itself, across many cycles — loopFix()'s own append/prepend reshuffle can re-snap translate to a slide's exact grid position mid-transition unless it's told to preserve the arbitrary current position instead", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const box = await slider.boundingBox();
    const center = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };

    const MAX_FRAME_DELTA = 40;

    for (let cycle = 0; cycle < 12; cycle += 1) {
      await page.waitForTimeout(300 + cycle * 60);
      await armHighFrequencySampler(page, 400);
      await page.waitForTimeout(60);
      await page.mouse.move(center.x, center.y);
      await page.waitForTimeout(300);
      const samples = await readSamples(page);

      for (let i = 1; i < samples.length; i += 1) {
        expect(Math.abs(samples[i].x - samples[i - 1].x)).toBeLessThan(MAX_FRAME_DELTA);
      }

      await page.mouse.move(10, 10);
      await page.waitForTimeout(50);
    }
  });
});

test.describe("Slider (wpe/slider) — regular autoplay, pagination, progress", () => {
  const slug = "e2e-fixture-slider-settings";
  let fixtureUrl: string;

  test.beforeAll(() => {
    const content = buildSliderContent(
      {
        autoplay: true,
        autoplayTime: 1,
        loop: true,
        pagination: true,
        showProgress: true,
        navigation: false,
      },
      buildSlides(5)
    );
    fixtureUrl = createFixturePage(slug, "E2E Fixture — Slider Settings", content).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
  });

  test("regular autoplay advances the active slide over time", async ({ page }) => {
    const firstSlide = page.locator(".swiper-slide").first();
    await expect(firstSlide).toHaveClass(/swiper-slide-active/);

    await expect
      .poll(async () => (await firstSlide.getAttribute("class"))?.includes("swiper-slide-active"), {
        timeout: 5000,
      })
      .toBe(false);
  });

  test("pagination bullet count matches the real slide count", async ({ page }) => {
    await expect(page.locator(".swiper-pagination-bullet")).toHaveCount(5);
  });

  test("clicking a pagination bullet navigates to that slide", async ({ page }) => {
    await page.locator(".swiper-pagination-bullet").nth(2).click();

    await expect(page.locator(".swiper-pagination-bullet").nth(2)).toHaveClass(
      /swiper-pagination-bullet-active/
    );
  });

  test("the progress circle fills up over time during autoplay", async ({ page }) => {
    const circle = page.locator(".swiper-progress-fill");
    await expect(circle).toHaveCount(1);

    const before = await circle.evaluate((el) => (el as SVGCircleElement).style.strokeDashoffset);
    await page.waitForTimeout(500);
    const after = await circle.evaluate((el) => (el as SVGCircleElement).style.strokeDashoffset);

    expect(after).not.toBe(before);
  });
});

test.describe("Slider (wpe/slider) — centerSlides pagination stays in sync", () => {
  const slug = "e2e-fixture-slider-center-slides";
  let fixtureUrl: string;

  test.beforeAll(() => {
    const content = buildSliderContent(
      {
        autoplay: false,
        loop: true,
        pagination: true,
        centerSlides: true,
        slidesPerView: 1,
      },
      buildSlides(5)
    );
    fixtureUrl = createFixturePage(slug, "E2E Fixture — Slider Center Slides", content).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test("bullet count matches real slide count and survives a window resize", async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);

    await expect(page.locator(".swiper-pagination-bullet")).toHaveCount(5);

    await page.setViewportSize({ width: 900, height: 700 });
    await page.waitForTimeout(300);

    await expect(page.locator(".swiper-pagination-bullet")).toHaveCount(5);
  });

  test("every pagination bullet click reliably switches to that exact slide, even clicked rapidly and out of sequence — Swiper's own clickable-pagination handler takes a slideNext()/slidePrev() shortcut for adjacent bullets that can desync from loop-mode's own realIndex under rapid clicks", async ({
    page,
  }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
    await page.waitForTimeout(300);

    const getRealIndex = () =>
      page.evaluate(() => {
        const el = document.querySelector(".wp-block-wpe-slider") as HTMLElement & {
          swiper: { realIndex: number };
        };
        return el.swiper.realIndex;
      });

    const bulletCount = await page.locator(".swiper-pagination-bullet").count();
    expect(bulletCount).toBe(5);

    const sequence = [2, 4, 1, 3, 0, 4, 2, 0, 3, 1, 2, 4, 0, 1, 3, 4, 2, 1, 0, 3];
    for (const target of sequence) {
      await page.locator(".swiper-pagination-bullet").nth(target).click();
      await page.waitForTimeout(15);
      expect(await getRealIndex()).toBe(target);
    }
  });
});

test.describe("Slider (wpe/slider) — continuousAutoplay with centerSlides — hover pauses on the exact slide under the cursor", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  const slug = "e2e-fixture-slider-continuous-center-identity";
  let fixtureUrl: string;

  test.beforeAll(() => {
    const content =
      `<div style="height:1400px">Spacer</div>` +
      buildSliderContent(
        {
          continuousAutoplay: true,
          autoplay: true,
          autoplayTime: 2,
          loop: true,
          pagination: false,
          navigation: false,
          centerSlides: true,
        },
        buildSlides(6)
      );
    fixtureUrl = createFixturePage(
      slug,
      "E2E Fixture — Slider Continuous CenterSlides Identity",
      content
    ).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
  });

  test("the slide under the cursor right before hovering is still the same slide right after pausing — not the adjacent one", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const box = await slider.boundingBox();
    const center = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };

    const slideIdAt = async (x: number, y: number) =>
      page.evaluate(
        ([px, py]) => {
          const el = document.elementFromPoint(px, py);
          const slide = el?.closest(".swiper-slide") as HTMLElement | null;
          return slide?.getAttribute("data-slide-id") ?? null;
        },
        [x, y]
      );

    for (let cycle = 0; cycle < 6; cycle += 1) {
      const predicted = await slideIdAt(center.x, center.y);
      await page.mouse.move(center.x, center.y);
      const actual = await slideIdAt(center.x, center.y);

      if (predicted !== null && actual !== null) {
        expect(actual).toBe(predicted);
      }

      await page.mouse.move(10, 10);
      await page.waitForTimeout(300 + cycle * 50);
    }
  });
});

test.describe("Slider (wpe/slider) — regular autoplay full lifecycle scenario matrix", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  const slug = "e2e-fixture-slider-regular-lifecycle";
  let fixtureUrl: string;

  test.beforeAll(() => {
    const content = buildSliderContent(
      {
        autoplay: true,
        autoplayTime: 1,
        loop: true,
        pagination: false,
        navigation: false,
      },
      buildSlides(4, true)
    );
    fixtureUrl = createFixturePage(slug, "E2E Fixture — Slider Regular Lifecycle", content).url;
  });

  test.afterAll(() => {
    deleteFixturePage(slug);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(fixtureUrl);
    await acceptCookies(page);
  });

  test("starts autoplaying immediately on page load — unlike continuousAutoplay, regular mode does not wait for the carousel to scroll into view", async ({
    page,
  }) => {
    const firstSlide = page.locator(".swiper-slide").first();
    await expect(firstSlide).toHaveClass(/swiper-slide-active/);

    // No scrollIntoView here — the block is off-screen the whole time.
    await expect
      .poll(async () => (await firstSlide.getAttribute("class"))?.includes("swiper-slide-active"), {
        timeout: 3000,
      })
      .toBe(false);
  });

  test("clicking inside pauses it — the active slide does not change while paused", async ({
    page,
  }) => {
    await page.locator(".wp-block-wpe-slider").scrollIntoViewIfNeeded();
    // Autoplay starts eagerly and advances every 1s — read the active index
    // only *after* the click, not before, so a race between reading and
    // clicking can't be mistaken for a pause failure.
    await page.locator(".wp-block-wpe-slider").click();
    const activeAfterClick = await page
      .locator(".swiper-slide-active")
      .getAttribute("data-swiper-slide-index");

    await page.waitForTimeout(1500);

    const stillActive = page.locator(".swiper-slide-active");
    await expect(stillActive).toHaveAttribute("data-swiper-slide-index", activeAfterClick ?? "");
  });

  test("clicking outside resumes it after a click-triggered pause", async ({ page }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();

    await slider.click();
    await page.waitForTimeout(300);
    const firstSlide = page.locator(".swiper-slide").first();
    const wasActive = (await firstSlide.getAttribute("class"))?.includes("swiper-slide-active");

    await page.mouse.click(10, 10);

    if (wasActive) {
      await expect
        .poll(
          async () => (await firstSlide.getAttribute("class"))?.includes("swiper-slide-active"),
          { timeout: 3000 }
        )
        .toBe(false);
    }
  });

  test("hovering does NOT pause regular autoplay — that's continuousAutoplay-only behavior", async ({
    page,
  }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    const box = await slider.boundingBox();

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);

    const firstSlide = page.locator(".swiper-slide").first();
    await expect
      .poll(async () => (await firstSlide.getAttribute("class"))?.includes("swiper-slide-active"), {
        timeout: 3000,
      })
      .toBe(false);
  });

  test("focusing a link does NOT pause regular autoplay either", async ({ page }) => {
    const slider = page.locator(".wp-block-wpe-slider");
    await slider.scrollIntoViewIfNeeded();
    const box = await slider.boundingBox();
    const links = page.locator(".wp-block-wpe-slider a");
    const count = await links.count();
    let onScreenLink = links.first();
    for (let i = 0; i < count; i += 1) {
      const b = await links.nth(i).boundingBox();
      if (b && b.x >= box!.x && b.x + b.width <= box!.x + box!.width) {
        onScreenLink = links.nth(i);
        break;
      }
    }
    await onScreenLink.focus();

    const firstSlide = page.locator(".swiper-slide").first();
    await expect
      .poll(async () => (await firstSlide.getAttribute("class"))?.includes("swiper-slide-active"), {
        timeout: 3000,
      })
      .toBe(false);
  });
});
