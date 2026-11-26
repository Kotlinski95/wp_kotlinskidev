import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { applyFilters } from "@wordpress/hooks";
import type { ComponentType } from "react";
import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";

export type AttributeSet = Record<string, unknown>;

interface BlockFixture {
  name: string;
  attributes?: Record<string, unknown>;
  supports?: Record<string, unknown>;
}

interface ExtraPropsSeed {
  label: string;
  value: Record<string, unknown>;
}

const SAMPLE_DYNAMIC_BLOCK = DYNAMIC_PREVIEW_BLOCKS[0];

export const BLOCK_FIXTURES: BlockFixture[] = [
  { name: "core/group", attributes: { className: { type: "string" } }, supports: { color: true } },
  {
    name: "core/paragraph",
    attributes: { content: { type: "string" } },
    supports: { typography: { fontSize: true } },
  },
  { name: "core/image", attributes: { url: { type: "string" } } },
  { name: "core/columns", attributes: { verticalAlignment: { type: "string" } } },
  { name: "core/cover", attributes: { url: { type: "string" } }, supports: { color: true } },
  {
    name: "core/heading",
    attributes: { level: { type: "number", default: 2 } },
    supports: { typography: { fontSize: true } },
  },
  { name: "core/button", attributes: { text: { type: "string" } } },
  { name: "core/html", attributes: { content: { type: "string" } } },
  { name: "core/code", attributes: { content: { type: "string" } } },
  { name: "core/navigation-link", attributes: { label: { type: "string" } } },
  { name: "kotlinskidev/button", attributes: { text: { type: "string" } } },
  { name: "kotlinskidev/nav-link", attributes: { label: { type: "string" } } },
  { name: "kotlinskidev/marquee", attributes: { speed: { type: "number", default: 20 } } },
  { name: SAMPLE_DYNAMIC_BLOCK, attributes: { limit: { type: "number", default: 3 } } },
  { name: "core/group" },
  { name: "core/paragraph", attributes: undefined, supports: { typography: false } },
];

const EXTRA_PROPS_SEEDS: ExtraPropsSeed[] = [
  { label: "empty", value: {} },
  {
    label: "existing-class-and-style",
    value: { className: "wp-block-example has-custom", style: { color: "red" }, id: "anchor" },
  },
];

const cloneFixture = (fixture: BlockFixture): Record<string, unknown> =>
  JSON.parse(JSON.stringify(fixture));

const cloneSeed = (seed: ExtraPropsSeed): Record<string, unknown> =>
  JSON.parse(JSON.stringify(seed.value));

const registeredDefaults = (settings: Record<string, unknown>): AttributeSet => {
  const attributes = (settings.attributes ?? {}) as Record<string, { default?: unknown }>;
  return Object.fromEntries(
    Object.entries(attributes)
      .filter(([, definition]) => definition && "default" in definition)
      .map(([key, definition]) => [key, definition.default])
  );
};

export const characterizeRegistration = (): unknown =>
  BLOCK_FIXTURES.map((fixture) => {
    const input = cloneFixture(fixture);
    const output = applyFilters("blocks.registerBlockType", input, fixture.name) as Record<
      string,
      unknown
    >;
    return {
      name: fixture.name,
      sameObject: output === input,
      result: output,
    };
  });

export const characterizeExtraProps = (attributeSets: Record<string, AttributeSet>): unknown => {
  const rows: unknown[] = [];

  BLOCK_FIXTURES.forEach((fixture) => {
    const registered = applyFilters(
      "blocks.registerBlockType",
      cloneFixture(fixture),
      fixture.name
    ) as Record<string, unknown>;
    const withDefaults = { defaults: registeredDefaults(registered), ...attributeSets };

    Object.entries(withDefaults).forEach(([label, attributes]) => {
      EXTRA_PROPS_SEEDS.forEach((seed) => {
        const extraProps = cloneSeed(seed);
        let outcome: unknown;
        try {
          outcome = applyFilters(
            "blocks.getSaveContent.extraProps",
            extraProps,
            { name: fixture.name },
            JSON.parse(JSON.stringify(attributes))
          );
        } catch (error) {
          outcome = { thrown: (error as Error).constructor.name };
        }
        rows.push({ block: fixture.name, attributes: label, seed: seed.label, outcome });
      });
    });
  });

  return rows;
};

interface RecordedProps {
  className?: unknown;
  wrapperProps?: unknown;
  [key: string]: unknown;
}

export const characterizeBlockListBlock = (
  attributeSets: Record<string, AttributeSet | undefined>
): unknown => {
  const rows: unknown[] = [];

  Object.entries(attributeSets).forEach(([label, attributes]) => {
    [undefined, "existing-class"].forEach((className) => {
      let recorded: RecordedProps = {};
      const Stub: ComponentType<RecordedProps> = (props) => {
        recorded = props;
        return null;
      };
      const Wrapped = applyFilters("editor.BlockListBlock", Stub) as ComponentType<RecordedProps>;
      let outcome: unknown;
      try {
        render(
          <Wrapped
            attributes={attributes}
            className={className}
            wrapperProps={{ style: { color: "blue" } }}
          />
        );
        outcome = { className: recorded.className, wrapperProps: recorded.wrapperProps };
      } catch (error) {
        outcome = { thrown: (error as Error).constructor.name };
      }
      rows.push({ attributes: label, incomingClass: className ?? null, outcome });
    });
  });

  return rows;
};

const openEveryPanel = (container: HTMLElement): void => {
  container
    .querySelectorAll<HTMLButtonElement>("button.components-panel__body-toggle")
    .forEach((toggle) => fireEvent.click(toggle));
};

export const characterizeBlockEditMarkup = (
  attributeSets: Record<string, AttributeSet>,
  blockNames: string[]
): unknown => {
  const rows: unknown[] = [];

  blockNames.forEach((name) => {
    Object.entries(attributeSets).forEach(([label, attributes]) => {
      if (label.startsWith("invalid")) {
        return;
      }
      const Original: ComponentType = () => <div data-testid="original" />;
      const Wrapped = applyFilters("editor.BlockEdit", Original) as ComponentType<
        Record<string, unknown>
      >;
      let markup: string;
      try {
        const { container, unmount } = render(
          <Wrapped
            name={name}
            clientId="client-1"
            attributes={JSON.parse(JSON.stringify(attributes))}
            setAttributes={() => undefined}
          />
        );
        openEveryPanel(container);
        markup = container.innerHTML;
        unmount();
      } catch (error) {
        markup = `thrown:${(error as Error).constructor.name}`;
      }
      rows.push({ block: name, attributes: label, markup });
    });
  });

  return rows;
};
