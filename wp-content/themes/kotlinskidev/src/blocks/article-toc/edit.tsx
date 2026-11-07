import React from "react";
import {
  InspectorControls,
  PanelColorSettings,
  useBlockProps,
  useSettings,
} from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";

export interface ArticleTocAttributes {
  accentColor?: string;
  customAccentColor?: string;
  activeBackgroundColor?: string;
  customActiveBackgroundColor?: string;
}

interface PaletteColor {
  name: string;
  slug: string;
  color: string;
}

interface EditProps {
  attributes: ArticleTocAttributes;
  setAttributes: (attributes: Partial<ArticleTocAttributes>) => void;
}

const SAMPLE_LABELS = ["Introduction", "Key elements", "Common mistakes", "Final checklist"];
const SAMPLE_ACTIVE_INDEX = 1;

export function resolveColor(slug?: string, custom?: string): string | undefined {
  if (slug) {
    return `var(--wp--preset--color--${slug})`;
  }
  return custom || undefined;
}

function findSlug(palette: PaletteColor[], value?: string): string | undefined {
  return palette.find((entry) => entry.color.toLowerCase() === (value ?? "").toLowerCase())?.slug;
}

export default function Edit({ attributes, setAttributes }: Readonly<EditProps>) {
  const { accentColor, customAccentColor, activeBackgroundColor, customActiveBackgroundColor } =
    attributes;
  const [palette] = useSettings("color.palette") as [PaletteColor[] | undefined];
  const colors = palette ?? [];

  const accent = resolveColor(accentColor, customAccentColor);
  const activeBackground = resolveColor(activeBackgroundColor, customActiveBackgroundColor);

  const blockProps = useBlockProps({
    className: "kt-article-toc-block kt-article-toc",
    style: {
      ...(accent ? { "--kt-article-toc-accent": accent, "--kt-article-toc-bar": accent } : {}),
      ...(activeBackground ? { "--kt-article-toc-active-bg": activeBackground } : {}),
    } as React.CSSProperties,
  });

  const lookupColor = (slug?: string, custom?: string): string | undefined => {
    if (slug) {
      return colors.find((entry) => entry.slug === slug)?.color;
    }
    return custom;
  };

  return (
    <>
      <InspectorControls>
        <PanelColorSettings
          title={__("Table of contents colors", "kotlinskidev")}
          initialOpen
          colorSettings={[
            {
              label: __("Accent (numbers and active bar)", "kotlinskidev"),
              colors,
              value: lookupColor(accentColor, customAccentColor),
              onChange: (value?: string) =>
                setAttributes({
                  accentColor: findSlug(colors, value),
                  customAccentColor: findSlug(colors, value) ? undefined : value,
                }),
            },
            {
              label: __("Active item background", "kotlinskidev"),
              colors,
              value: lookupColor(activeBackgroundColor, customActiveBackgroundColor),
              onChange: (value?: string) =>
                setAttributes({
                  activeBackgroundColor: findSlug(colors, value),
                  customActiveBackgroundColor: findSlug(colors, value) ? undefined : value,
                }),
            },
          ]}
        />
      </InspectorControls>
      <div {...blockProps}>
        <p className="kt-article-toc__title">{__("Table of contents", "kotlinskidev")}</p>
        <ol className="kt-article-toc__list">
          {SAMPLE_LABELS.map((label, index) => (
            <li className="kt-article-toc__item" key={label}>
              <a
                className={`kt-article-toc__link${index === SAMPLE_ACTIVE_INDEX ? " is-active" : ""}`}
                href={`#sample-${index + 1}`}
                onClick={(event) => event.preventDefault()}
              >
                <span className="kt-article-toc__number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="kt-article-toc__label">{label}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
