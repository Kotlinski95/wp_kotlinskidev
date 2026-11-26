import { __ } from "@wordpress/i18n";

export const ALLOWED_BLOCKS = ["kotlinskidev/content-tabs-item"];

const buildTabTemplate = (label: string, content: string) => [
  "kotlinskidev/content-tabs-item",
  {},
  [
    ["kotlinskidev/content-tabs-nav-link", { label }],
    [
      "core/paragraph",
      {
        content,
        placeholder: __("Describe this service…", "kotlinskidev"),
      },
    ],
  ],
];

export const TABS_TEMPLATE = [
  buildTabTemplate(
    __("Creating Websites", "kotlinskidev"),
    __(
      "Custom-built, fast-loading sites tailored to your business, from first sketch to launch.",
      "kotlinskidev"
    )
  ),
  buildTabTemplate(
    __("Performance Analysis", "kotlinskidev"),
    __(
      "In-depth audits of load speed, Core Web Vitals, and rendering bottlenecks, with a clear fix list.",
      "kotlinskidev"
    )
  ),
  buildTabTemplate(
    __("Website Optimization", "kotlinskidev"),
    __(
      "Ongoing tuning of caching, assets, and queries to keep the site fast as it grows.",
      "kotlinskidev"
    )
  ),
] as [string, object][];
