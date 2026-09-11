---
name: storybook
description: "Write or fix a Storybook story for one of this theme's custom Gutenberg blocks. Use when asked to add Storybook coverage for a block, make a block's story interactive, mock its ServerSideRender/MediaUpload output, or fix a block that renders empty/errors/blank in Storybook. Pass the block as an argument, e.g. `/storybook banner-carousel`."
---

# Storybook

Target block: $ARGUMENTS

Read `docs/storybook.md` first — full rationale, the "missing WP runtime piece" table, and every gotcha below live there with the reasoning behind each. This skill is the condensed, actionable version of that doc; don't duplicate its explanations back into commit messages or comments, just follow it.

## 1. Find the block and its Edit export

```bash
ls src/blocks/<name>/
```

- `edit.tsx` present → that's where `Edit` (default export) and `{Block}Attributes` (named export) live. If either isn't exported, add `export` — a pure addition, nothing else changes. If the attributes interface has a generic name (`Attributes`, not `{Block}Attributes`), rename it on export to match this project's naming rule.
- No `edit.tsx`, only `index.tsx` → `Edit` and the attributes interface are almost always module-local there instead. Same fix: add `export` to both.
- Check the `Edit` component's own prop type: a narrow local type (`{ attributes; setAttributes }`) needs no extra help; `BlockEditProps<T>` (imported from `@wordpress/blocks`) needs `buildEditProps()` too (step 3).

## 2. Create the story file

Colocate and name to match the source file: `edit.stories.tsx` next to `edit.tsx`, `index.stories.tsx` next to `index.tsx`, `save.stories.tsx` next to `save.tsx` for a frontend-markup-focused story. One `Meta`/title per file — if the file registers two block types, write two story files, not two components under one default export.

## 3. Wire it up interactively, not statically

**Render through `RealBlockEdit`, not the bare `Edit` function.** Calling `Edit` directly skips `@wordpress/block-editor`'s real `BlockEdit` dispatcher, which is the only thing that seeds the context `InspectorControls.Slot` needs to actually show Fill content in the sidebar — every block's `InspectorControls` panel is invisible without it (confirmed on `breadcrumbs`, fixed in that same pass). It also makes the block's real `editor.BlockEdit` filters fire, so extensions like `modal-trigger` work without hand-reapplying their HOC.

```tsx
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import type { XAttributes } from "./edit";
import metadata from "./block.json";
import "./index";
import { getDefaultAttributes, useInteractiveAttributes, RealBlockEdit } from "@utils/storybook-edit-props";

function XStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<XAttributes>();
  return (
    <RealBlockEdit
      name="kotlinskidev/x"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta = {
  title: "Blocks/X",
  render: XStory,
};
export default meta;

type Story = StoryObj;
export const Default: Story = {
  args: { attributes: getDefaultAttributes<XAttributes>(metadata.attributes) },
};
```

`import "./index"` is required — `RealBlockEdit` looks the block up via `getBlockType(name)`, same requirement as `ServerSideRender` with an `attributes` prop. If the block renders completely blank with **zero console output**, check its `index.ts`/`index.tsx`: it must call `registerBlockType(metadata, {...})` with the full `block.json` object, not `registerBlockType(metadata.name, {...})` — the name-only form relies on WordPress's PHP-side bootstrap to fill in `attributes`/`supports`, which doesn't exist in Storybook (this exact bug existed in `breadcrumbs/index.ts`).

Never write `setAttributes: () => {}`. `useInteractiveAttributes()` gives real two-way binding (Controls panel ↔ the block's own UI) and logs every call to the Actions panel — that's the whole point of previewing an editable block.

**`render` must be the component itself, not a wrapper that renders it via JSX.** `render: XStory` works; `render: () => <XStory />` throws `hooks can only be called inside decorators and story functions` — Storybook only wires its hooks context around the function it calls directly, and React calls a JSX-nested child as a normal render, not as that function. Need a per-story parameter (a route, a variant)? Use a factory returning a differently-closured component (`makeXStory("variant")`), not a prop passed through JSX.

If the block's real markup varies by *external state* rather than by an attribute (e.g. a page-context-dependent trail, not anything in `block.json`), don't force it into a Control — add a React Context to `mock-server-side-render.tsx` (see `BreadcrumbsRouteContext`) and write one named story per variant, each setting the Provider's value.

No inline comments in the story file — export/story names carry the meaning.

## 4. Wire up whatever the block needs that a full WP admin normally provides

Check against `docs/storybook.md`'s table before assuming something's broken — most of these are already solved globally:

- **Block uses `ServerSideRender`** → if it passes an `attributes` prop, add `import "./index";` for block registration (`sanitizeBlockAttributes` needs `getBlockType()` to resolve). Then add a `BLOCK_MOCKS` entry in `.storybook/mock-server-side-render.tsx`: capture real markup via `wp eval 'echo render_block(["blockName" => "kotlinskidev/x", "attrs" => [...], "innerBlocks" => [], "innerHTML" => "", "innerContent" => []]);' --path=<wp-root>` against a real post, don't hand-guess the classes. Without an entry it falls back to a harmless "no mock configured yet" placeholder — better than the raw error, but still needs filling in. Before trusting the capture verbatim, read the PHP behind it: `$_SERVER['REQUEST_URI']` is unset under `wp eval`, so any `isset(...) ? ... : '<fallback>'` pattern keyed on the current URL behaves as if you're always on the homepage.
- **Block has its own `style.scss`** → it's only pulled in by that block's own `index.ts`/`init.ts` webpack entry, never a global bundle. Add `import "./style.scss";` to the story or it renders with zero of the block's own CSS.
- **Block uses `MediaUpload`** → already globally mocked (`.storybook/mock-media-upload.tsx`, `MOCK_MEDIA_LIBRARY`). Nothing to do unless the mock library's images are the wrong aspect ratio for this block (see below).
- **Block calls `useBlockProps.save()` (a real `save()` component)** → same registration requirement as `ServerSideRender` with attributes. Add `import "./index";`.
- **Block runs a JS animation/carousel/slider library (Swiper, GSAP, etc.) against real DOM** → render through `createPortal(<div ref={containerRef} />, document.body)`, not inline in the component tree. Confirmed the hard way: content nested inside the story's own `.editor-styles-wrapper` decorator chain can decode correctly but never *paint* once a `transform` reveals it — moving the identical DOM node to `document.body` was the fix, and no root cause narrower than "that ancestor chain" was ever found. Don't re-derive this — start with the portal.
- **Block shows an image-heavy layout (carousel, gallery)** → give the container a fixed height and pick same-aspect-ratio images from `.storybook/mock-assets.ts` (add a new named export there if nothing existing fits — pick by aspect ratio, not by file size). Mixing a near-square photo into a row of wide ones breaks the layout even with `object-fit: cover`.

## 5. Verify against a real build, not just the dev server

```bash
npx storybook build
```

A dev-server-only check can hide real build-time breakage (and vice versa — dev-only warnings that don't reflect the real build). Then run a headless check against the *built* `storybook-static/` output:

```bash
python3 -m http.server 6008 --directory storybook-static &
```

Use Playwright (already a devDependency) to load `http://localhost:6008/iframe.html?id=<story-id>&viewMode=story`, assert zero console errors, and screenshot it. For anything interactive (arrows, autoplay, a toggle), actually click/wait and re-screenshot — don't stop at "it built and the first frame looks right." Kill the test server and delete any throwaway script when done; never leave one in the repo.

## 6. Update `docs/treeview.md` and `CHANGELOG.md`

Per this repo's standing rule: any new/changed file gets a `docs/treeview.md` line, and anything notable (a new mock, a fixed bug, a new dependency) gets a 2–3 sentence `CHANGELOG.md` entry under `[Unreleased]`. If you discover a new gotcha along the way, add it to `docs/storybook.md`'s gotchas list too — that's the point of the doc.
