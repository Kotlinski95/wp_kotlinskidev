# Hero alpha video on iOS

The hero carousel plays a transparent mesh video over a dark background. This note records why iOS needed a canvas and how to test it.

## Problem

- On iPhone (Safari and Chrome, both WebKit) the banner showed a light, fully opaque blue mesh while the video played, and the intended dark look (soft glow over `#191919`) between plays or when only the poster was visible.
- Desktop Chrome plays `hero-mesh-alpha-1.webm` (VP9 alpha) correctly, and desktop Safari plays the `.mov` (HEVC alpha) correctly.

## Findings

- The `.mov` does carry alpha, and iOS decodes it: a per-frame readout from a test page showed a mean alpha of about 35 out of 255 on every frame. The iOS compositor still drew the `<video>` layer opaque, so the raw colours showed. Re-encoding the file (`hevc_videotoolbox -alpha_quality`) made no difference.
- The poster is correct. It has the same transparency as the video and composites to the same dark look.
- Hiding the video for the first second did not help, because the video looks wrong whenever it is visible.
- Drawing the decoded frames onto a `<canvas>` composites the alpha correctly on iOS.

## Fix

- `src/blocks/hero-carousel/alpha-canvas.ts`: on iOS WebKit (`isIosWebKit()` in `src/utils/is-webkit-browser.ts`) the slide's `<video>` stays in the DOM, invisible, and `requestVideoFrameCallback` (or `requestAnimationFrame`) draws each frame to a 480px-wide canvas that CSS scales with `object-fit: cover`.
- The poster becomes a background image of `.hero-carousel__bg` (`--kt-hero-poster`) until the first frame is drawn; the drawing loop runs only while the video plays.
- Styles are in `src/blocks/hero-carousel/style.scss` (`__bg--alpha-canvas`, `__bg--alpha-drawing`, `__alpha-canvas`). Other browsers keep the native video.

## How to test

- Real iPhone: open an about or home page with the hero banner and watch the first seconds on every load; the banner must stay dark with the soft mesh glow and never turn light blue.
- Emulation: Playwright WebKit with the `iPhone 12 Pro Max` descriptor takes the canvas path (`.hero-carousel__bg--alpha-canvas` and `--alpha-drawing` classes, video opacity 0). It cannot reproduce the iOS compositor bug itself.

## Slide changes (iOS): investigated, no fix kept

- Symptom: on iPhone, moving forward to the next slide showed the incoming slide's backdrop dim or empty for a moment; backward looked fine.
- A throttled test page showed that starting the incoming video when the slide settles (what `hero-carousel/init.ts` does) blinks, while starting it when the slide begins did not. The real page was not confirmed.
- Two attempts on the real page were reverted. Seeking to 0.001s and starting `play()` at `slideChangeTransitionStart` gave a black slide on the first swipe, because iOS drops the poster at `play()` before any data has loaded. Waiting for `canplay` before `play()` stopped the videos from starting at all on a real iPhone, because iOS does not buffer a paused video (Low Power Mode, or `preload` not honoured), so `canplay` never fires.
- Rules for any future attempt: never gate `play()` on `canplay` or `readyState`, always keep a poster, and test on a real iPhone with the slow test page and then the real page. Ideas not tried: start the neighbour slide's video muted on the first drag move, and replace the poster handoff with a canvas like the alpha slide.

## Permanent poster background

- Instead of changing when videos start (which failed twice on a real iPhone), every opaque slide's poster is also set as a CSS background of `.hero-carousel__bg` (`--kt-hero-poster`, set in `applySlidePoster`). Whenever the video layer is empty (iOS drops the `poster` attribute at `play()`, a seek, a slow load) the slide shows its own poster instead of the plain dark layer. An opaque video covers it once frames draw.
- Alpha-video slides get no poster background on non-iOS browsers, because their poster is already translucent and would add to the video; on iOS the canvas path sets its own poster background and removes it after the first drawn frame.
- Checked in Chromium emulation by hiding the active video: the slide stays at the poster's brightness (about 45) instead of dropping to the dark layer (about 25). Not verified on a real iPhone.

## Overlay during slide changes (iOS)

- Symptom: on iPhone the dark overlay (`.hero-carousel__overlay`, `--overlay-opacity` 0.4) seemed to disappear while a slide moved in and returned about 0.2s after it settled. In a screen recording the brightness of the incoming slide dropped from about 43 to 33 at the moment the slide stopped.
- The overlay is a plain `rgba` layer over the video and no script touches it. The suspected cause is an iOS compositing order problem: a video inside a transformed (sliding) slide is painted above later siblings until the animation ends.
- Change (CSS only): `.hero-carousel__bg` is `isolation: isolate`, the slide video is `position: relative; z-index: 0`, and the overlay has `z-index: 1` and `transform: translateZ(0)`. No video logic changed. Not verified on a real iPhone; if it does not help, revert this style block.

## First video start (iOS)

- Symptom: on iPhone the first time a hero video starts, the poster is replaced for a moment by a black screen with iOS's own loading spinner (even over the heading text), then the video plays. It does not repeat when going forward or back, because the video is then already loaded.
- Cause (inferred from a screen recording): when playback begins, iOS drops the poster and paints the video layer black with its native buffering indicator until the first frame arrives, and that layer can sit above the page content.
- Change: `video-first-frame.ts` (`holdVideoUntilFirstFrame`, called from `prepareSlideVideo` on iOS WebKit for opaque slides) adds `.hero-carousel__bg--video-pending`, which makes the video `opacity: 0` and paints the slide's poster as the container background (`--kt-hero-poster`). The class is removed when `requestVideoFrameCallback` reports the first presented frame (`timeupdate` fallback, and a 4s timeout so a stalled video never stays hidden). `play()` is not delayed.
- Checked in WebKit emulation with the iPhone user agent: the class appears at init and is removed about 400ms later when playback starts. Not verified on a real iPhone, where the black frame and spinner come from iOS itself.
