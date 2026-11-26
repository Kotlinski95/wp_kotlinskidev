# Responsive media

Editors can attach a lighter or differently cropped image or video for tablet and mobile to a block. The browser downloads only the file that matches its viewport, and the desktop file stays the default and the one the lightbox opens.

## How it works

A block stores an optional `responsiveMedia` attribute:

```json
{
  "responsiveMedia": {
    "tablet": { "id": 0, "url": "", "type": "image|video", "posterId": 0, "posterUrl": "" },
    "mobile": { "id": 0, "url": "", "type": "image|video", "posterId": 0, "posterUrl": "" }
  }
}
```

- An empty slot falls back to the next larger one: mobile, then tablet, then the block's own (desktop) media.
- Breakpoints come from `kotlinskidev_get_breakpoints()` and `window.kotlinskiTheme.breakpoints` (mobile up to 781 px, tablet 782-1023 px, desktop from 1024 px).
- The attribute is the same for every supported block, so content already saved on `core/cover` keeps working.

## Supported blocks

`src/blocks/responsive-media/blocks.json` is the single list of supported blocks. The editor panel (`src/blocks/responsive-media/index.tsx`) and the PHP renderer (`functions/responsive-media.php`) both read it, so the two cannot drift apart. Currently registered:

| Block | Frontend delivery |
| --- | --- |
| `core/image` | `<picture>` with breakpoint sources |
| `core/cover` | `<picture>` for image covers; `data-kt-src-*` and `data-kt-poster-*` for video covers |
| `core/video` | `data-kt-src-*` and `data-kt-poster-*` |
| `kotlinskidev/hero-carousel-slide` | `<picture>` poster plus `data-kt-src-*` video source |
| `kotlinskidev/device-frame` | `<picture>` poster plus `data-kt-src-*` video source |

Core blocks get the attribute from `blocks.registerBlockType` and PHP `register_block_type_args`. Dynamic custom blocks must declare `responsiveMedia` in their own `block.json`, because a JS-only attribute makes the editor's server-side preview fail with HTTP 400.

## Delivery rules

- **Images** use `<picture><source media srcset>` built on the server from the slot's attachment, so the saved block markup does not change.
- **Videos** do not use `<source media>` (browsers ignore it for `<video>`). The server prints `data-kt-src-{device}` and `data-kt-poster-{device}` and no `src`. `src/utils/responsive-media.ts` (`currentDevice()`, `applyResponsiveVideo()`) picks the file when the video activates and again on resize.
- **Above-the-fold device-frame videos with variants** print an eager `<img class="kt-device-frame__poster">` (a `<picture>` when the poster varies) under the `<video>`, which starts after load and idle and hides the poster once playing.
- **No device detection on the server.** Cloudflare caches one HTML page per URL, so the choice is always made in the browser.
- **Preload:** `kotlinskidev_claim_lcp_slot()` in `functions/above-fold-media.php` prints one `<link rel="preload" as="image">` per breakpoint. Each carries the same `media` string as its `<source>`, so only one of them matches.
- **No mobile slot set:** a lazy video's mobile poster defaults to the `medium_large` size of the desktop poster.
- **Lightbox and zoom** always open the desktop or full-size file, never `currentSrc`.

## Alpha video slides

A hero slide with `bgVideoAlphaUrl` uses two files: `bgVideoUrl` (VP9 WebM with alpha, Chrome and Firefox) and `bgVideoAlphaUrl` (HEVC alpha `.mov`, Safari and iOS). A mobile or tablet slot on such a slide supplies both: `url` is the WebM and `alphaUrl` (with `alphaId`) is the HEVC file, picked in the panel's "Safari HEVC alpha file" control. The server prints `data-kt-src-{device}` and `data-kt-src-alpha-{device}`; `prepareSlideVideo()` picks the alpha pair with the same browser detection as before. A slot with `url` but no `alphaUrl` is ignored on an alpha slide, so the next larger slot or the desktop pair is used and a non-alpha file never reaches it. Saved content without `alphaUrl` is unchanged.

## Making the variants

Name every variant with a `-mobile` (or `-tablet`) suffix before the extension, so it is clear in the Media Library which file is which.

```bash
cwebp -q 72 -resize 828 0 hero.jpg -o hero-mobile.webp
cwebp -q 75 -resize 1536 0 hero.jpg -o hero-tablet.webp

ffmpeg -i hero.mp4 -vf "crop=ih*9/16:ih,scale=540:960" -an -c:v libx264 -profile:v high -preset slow -crf 30 -pix_fmt yuv420p -movflags +faststart hero-mobile.mp4

ffmpeg -i hero.webp -vf "crop=ih*9/16:ih,scale=540:960" hero-mobile-poster.png && cwebp -q 72 hero-mobile-poster.png -o hero-mobile-poster.webp
```

Targets: a mobile image up to 80 KB, a tablet image up to 150 KB, a mobile hero video up to about 1 MB (the 30 s silver-planet loop needed `-crf 37` to get under that). Use `crop=ih*9/16:ih` only when the slide should be a portrait crop. Check where the subject sits, because the crop is centred.

Videos should have a poster. Set the poster as the video attachment's featured image before picking the video; the panel then fills in `posterId` and `posterUrl` automatically.

## Moving media to production

Attachment IDs differ between local and production, so never paste local IDs into production content. Upload the files to production, then reference the production IDs. `npm run push-page -- <slug>` (see `bin/push-page.mjs`) uploads the referenced media and rewrites the `...Id` keys and upload URLs, but it does not copy a video's featured poster, so set that on production afterwards.

After deploying, purge the Cloudflare cache so stale HTML does not point at old assets.

## GIFs in device frames

A looping GIF is much heavier than the same clip as a video, so slideshow GIFs inside a device frame are replaced by short MP4s (`ffmpeg -i in.gif -vf "scale='min(1440,iw)':-2:flags=lanczos,format=yuv420p" -an -c:v libx264 -preset slow -crf 28 -movflags +faststart out.mp4`). The device frame already plays muted, looping video with the attachment's featured image as the poster.

## Verification

- `npm run build`, `npm run test:unit` and `npm run test:php`.
- With a page that uses a mobile variant, open the Network tab at 390 px and at 1440 px: exactly one hero image request per width, and the matching video file.
- Run Lighthouse in mobile mode before and after (`node_modules/.bin/lighthouse <url> --form-factor=mobile`). If the site redirects by language, pass `--extra-headers='{"Accept-Language":"pl-PL"}'`.

## Not covered by this system

- `kotlinskidev/gallery-lightbox` keeps its own "mobile set" (`useMobileMedia`/`mobileImages`), because it swaps the whole set and can change the number of items.
- `kotlinskidev/banner-carousel` images, `nav-banner`, `nav-image` and the `model-viewer` poster are not registered yet; the plan is to add them as further adapters in `blocks.json`.
- `kotlinskidev/responsive-image` duplicates this system and uses a different breakpoint (767 px). It is not retired yet; prefer `core/image` with a mobile slot for new content.
