import React, { useState, useRef, useEffect } from "react";
import {
  registerFormatType,
  applyFormat,
  removeFormat,
  getActiveFormat,
  useAnchor,
} from "@wordpress/rich-text";
import type { RichTextValue } from "@wordpress/rich-text";
import {
  RichTextToolbarButton,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { Popover, TabPanel } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

type ActiveFormat = NonNullable<ReturnType<typeof getActiveFormat>> & {
  attributes?: Record<string, string>;
};
type UseAnchorSettings = NonNullable<Parameters<typeof useAnchor>[0]["settings"]>;

const HIGHLIGHT_FORMAT = "kotlinskidev/highlight-gradient" as const;
const TEXT_FORMAT = "kotlinskidev/gradient-text" as const;

const HIGHLIGHT_ANCHOR_SETTINGS = {
  tagName: "mark",
  className: "kt-highlight-gradient",
} as unknown as UseAnchorSettings;

interface FormatEditProps {
  isActive: boolean;
  activeAttributes: Record<string, string>;
  value: RichTextValue;
  onChange: (value: RichTextValue) => void;
  contentRef: React.MutableRefObject<HTMLElement>;
}

function extractStyleProp(styleStr: string | undefined, prop: string): string | undefined {
  if (!styleStr) {
    return undefined;
  }
  const prefix = `${prop}:`;
  const idx = styleStr.indexOf(prefix);
  if (idx === -1) {
    return undefined;
  }
  const raw = styleStr.slice(idx + prefix.length);
  const end = raw.indexOf(";");
  return (end === -1 ? raw : raw.slice(0, end)).trim() || undefined;
}

function GradientPickerIcon(): JSX.Element {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="kt-gp-icon" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(130,9,211)" />
          <stop offset="100%" stopColor="rgb(59,130,246)" />
        </linearGradient>
      </defs>
      <path
        d="M5 17L9.5 5h1L15 17h-1.5L12 13H8L6.5 17H5zm3.5-5.5h3L10 7.5l-1.5 4z"
        fill="url(#kt-gp-icon)"
      />
      <rect x="3" y="19" width="18" height="3" rx="1.5" fill="url(#kt-gp-icon)" />
    </svg>
  );
}

function GradientPickerButton({
  isActive,
  value,
  onChange,
  contentRef,
}: FormatEditProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const capturedValueRef = useRef<RichTextValue | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (isOpen) {
      return;
    }
    if (value.start !== undefined && value.end !== undefined && value.start !== value.end) {
      capturedValueRef.current = value;
    }
  }, [value, isOpen]);

  const textActiveFormat = getActiveFormat(value, TEXT_FORMAT) as ActiveFormat | undefined;
  const highlightActiveFormat = getActiveFormat(value, HIGHLIGHT_FORMAT) as
    | ActiveFormat
    | undefined;

  const isEitherActive = isActive || !!textActiveFormat;

  // "background:" stores the highlight value (survives wp_kses_post sanitization)
  const highlightCurrentValue = extractStyleProp(
    highlightActiveFormat?.attributes?.style,
    "background"
  );
  // "background-image:" stores the text gradient value (survives wp_kses_post; doesn't reset background-clip)
  const textCurrentValue = extractStyleProp(
    textActiveFormat?.attributes?.style,
    "background-image"
  );

  const highlightIsGradient = highlightCurrentValue?.includes("gradient") ?? false;
  const textIsGradient = textCurrentValue?.includes("gradient") ?? false;

  // Freeze the anchor when the popover is open so clicking color swatches
  // (which shift browser focus/selection) doesn't cause the popover to drift.
  const liveAnchor = useAnchor({
    editableContentElement: contentRef.current,
    settings: HIGHLIGHT_ANCHOR_SETTINGS,
  });
  const frozenAnchorRef = useRef<typeof liveAnchor>(null);
  if (!isOpen && liveAnchor) {
    frozenAnchorRef.current = liveAnchor;
  }
  const popoverAnchor = isOpen ? (frozenAnchorRef.current ?? liveAnchor) : liveAnchor;

  useEffect(() => {
    if (!isEitherActive) {
      setIsOpen(false);
    }
  }, [isEitherActive]);

  const preventEditorBlur = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest("input, textarea, select, [contenteditable], button");
    if (!isInteractive) {
      e.preventDefault();
    }
  };

  const commitFormat = (newValue: RichTextValue) => {
    onChangeRef.current(newValue);
    contentRef.current?.focus({ preventScroll: true });
  };

  const highlightJustAppliedRef = useRef(false);
  const textJustAppliedRef = useRef(false);

  const handleHighlightColorChange = (color: string | undefined) => {
    const targetValue = capturedValueRef.current ?? value;
    if (color !== undefined) {
      highlightJustAppliedRef.current = true;
      const newValue = applyFormat(targetValue, {
        type: HIGHLIGHT_FORMAT,
        attributes: { style: `background: ${color}` },
      } as unknown as Parameters<typeof applyFormat>[1]);
      commitFormat(newValue);
    } else if (highlightJustAppliedRef.current) {
      highlightJustAppliedRef.current = false;
    } else {
      commitFormat(removeFormat(targetValue, HIGHLIGHT_FORMAT));
    }
  };

  const handleHighlightGradientChange = (gradient: string | undefined) => {
    const targetValue = capturedValueRef.current ?? value;
    if (gradient !== undefined) {
      highlightJustAppliedRef.current = true;
      const newValue = applyFormat(targetValue, {
        type: HIGHLIGHT_FORMAT,
        attributes: { style: `background: ${gradient}` },
      } as unknown as Parameters<typeof applyFormat>[1]);
      commitFormat(newValue);
    } else if (highlightJustAppliedRef.current) {
      highlightJustAppliedRef.current = false;
    } else {
      commitFormat(removeFormat(targetValue, HIGHLIGHT_FORMAT));
    }
  };

  const handleTextColorChange = (color: string | undefined) => {
    const targetValue = capturedValueRef.current ?? value;
    if (color !== undefined) {
      textJustAppliedRef.current = true;
      // Solid colors must be wrapped in a gradient so they can be stored as
      // background-image (which doesn't reset background-clip unlike background shorthand).
      const imageValue = `linear-gradient(${color}, ${color})`;
      const newValue = applyFormat(targetValue, {
        type: TEXT_FORMAT,
        attributes: { style: `background-image: ${imageValue}` },
      } as unknown as Parameters<typeof applyFormat>[1]);
      commitFormat(newValue);
    } else if (textJustAppliedRef.current) {
      textJustAppliedRef.current = false;
    } else {
      commitFormat(removeFormat(targetValue, TEXT_FORMAT));
    }
  };

  const handleTextGradientChange = (gradient: string | undefined) => {
    const targetValue = capturedValueRef.current ?? value;
    if (gradient !== undefined) {
      textJustAppliedRef.current = true;
      const newValue = applyFormat(targetValue, {
        type: TEXT_FORMAT,
        attributes: { style: `background-image: ${gradient}` },
      } as unknown as Parameters<typeof applyFormat>[1]);
      commitFormat(newValue);
    } else if (textJustAppliedRef.current) {
      textJustAppliedRef.current = false;
    } else {
      commitFormat(removeFormat(targetValue, TEXT_FORMAT));
    }
  };

  return (
    <>
      <RichTextToolbarButton
        icon={<GradientPickerIcon />}
        title={__("Gradient Colors", "kotlinskidev")}
        onClick={() => setIsOpen((prev) => !prev)}
        isActive={isEitherActive}
      />
      {isOpen && (
        <Popover
          anchor={popoverAnchor}
          onClose={() => setIsOpen(false)}
          placement="bottom"
          shift
          focusOnMount={false}
          className="kt-gradient-popover"
        >
          <div onMouseDown={preventEditorBlur}>
            <TabPanel
              className="kt-gradient-popover__tabs"
              tabs={[
                { name: "background", title: __("Highlight", "kotlinskidev") },
                { name: "text", title: __("Text", "kotlinskidev") },
              ]}
            >
              {(tab) =>
                tab.name === "background" ? (
                  <div className="kt-gradient-popover__panel">
                    <ColorGradientControl
                      label={__("Highlight color", "kotlinskidev")}
                      colorValue={
                        highlightCurrentValue && !highlightIsGradient
                          ? highlightCurrentValue
                          : undefined
                      }
                      gradientValue={highlightIsGradient ? highlightCurrentValue : undefined}
                      onColorChange={handleHighlightColorChange}
                      onGradientChange={handleHighlightGradientChange}
                      clearable
                      __nextHasNoMarginBottom
                    />
                  </div>
                ) : (
                  <div className="kt-gradient-popover__panel">
                    <ColorGradientControl
                      label={__("Text gradient", "kotlinskidev")}
                      colorValue={
                        textCurrentValue && !textIsGradient ? textCurrentValue : undefined
                      }
                      gradientValue={textIsGradient ? textCurrentValue : undefined}
                      onColorChange={handleTextColorChange}
                      onGradientChange={handleTextGradientChange}
                      clearable
                      __nextHasNoMarginBottom
                    />
                  </div>
                )
              }
            </TabPanel>
          </div>
        </Popover>
      )}
    </>
  );
}

registerFormatType(HIGHLIGHT_FORMAT, {
  title: __("Gradient Highlight", "kotlinskidev"),
  tagName: "mark",
  className: "kt-highlight-gradient",
  attributes: { style: "style" },
  edit: GradientPickerButton,
} as unknown as Parameters<typeof registerFormatType>[1]);

registerFormatType(TEXT_FORMAT, {
  title: __("Gradient Text", "kotlinskidev"),
  tagName: "span",
  className: "kt-gradient-text",
  attributes: { style: "style" },
  edit: () => null,
} as unknown as Parameters<typeof registerFormatType>[1]);
