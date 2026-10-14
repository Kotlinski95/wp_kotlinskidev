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
import { Popover } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

type ActiveFormat = NonNullable<ReturnType<typeof getActiveFormat>> & {
  attributes?: Record<string, string>;
};
type UseAnchorSettings = NonNullable<Parameters<typeof useAnchor>[0]["settings"]>;

const GLOW_FORMAT = "kotlinskidev/glow-text" as const;

const GLOW_ANCHOR_SETTINGS = {
  tagName: "span",
  className: "has-enhanced-hover-glow",
} as unknown as UseAnchorSettings;

interface FormatEditProps {
  isActive: boolean;
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

function GlowIcon(): JSX.Element {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="3.5" fill="currentColor" />
      <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function GlowTextButton({ isActive, value, onChange, contentRef }: FormatEditProps): JSX.Element {
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

  const activeFormat = getActiveFormat(value, GLOW_FORMAT) as ActiveFormat | undefined;
  const isEitherActive = isActive || !!activeFormat;

  const currentValue = extractStyleProp(
    activeFormat?.attributes?.style,
    "--hover-text-spotlight-color"
  );

  const liveAnchor = useAnchor({
    editableContentElement: contentRef.current,
    settings: GLOW_ANCHOR_SETTINGS,
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

  const justAppliedRef = useRef(false);

  const handleColorChange = (color: string | undefined) => {
    const targetValue = capturedValueRef.current ?? value;
    if (color !== undefined) {
      justAppliedRef.current = true;
      const newValue = applyFormat(targetValue, {
        type: GLOW_FORMAT,
        attributes: { style: `--hover-text-spotlight-color: ${color}` },
      } as unknown as Parameters<typeof applyFormat>[1]);
      commitFormat(newValue);
    } else if (justAppliedRef.current) {
      justAppliedRef.current = false;
    } else {
      commitFormat(removeFormat(targetValue, GLOW_FORMAT));
    }
  };

  return (
    <>
      <RichTextToolbarButton
        icon={<GlowIcon />}
        title={__("Cursor Glow", "kotlinskidev")}
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
          <div
            role="toolbar"
            aria-label={__("Cursor Glow settings", "kotlinskidev")}
            onMouseDown={preventEditorBlur}
          >
            <div className="kt-gradient-popover__panel">
              <ColorGradientControl
                label={__("Glow color", "kotlinskidev")}
                colorValue={currentValue}
                onColorChange={handleColorChange}
                gradients={[]}
                disableCustomGradients
                clearable
                __nextHasNoMarginBottom
              />
            </div>
          </div>
        </Popover>
      )}
    </>
  );
}

registerFormatType(GLOW_FORMAT, {
  title: __("Cursor Glow", "kotlinskidev"),
  tagName: "span",
  className: "has-enhanced-hover-glow",
  attributes: { style: "style" },
  edit: GlowTextButton,
} as unknown as Parameters<typeof registerFormatType>[1]);
