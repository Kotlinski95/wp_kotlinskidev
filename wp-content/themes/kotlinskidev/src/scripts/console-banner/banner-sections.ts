import {
  FRAME_STYLE,
  INDIGO_LINE_STYLE,
  PURPLE_LINE_STYLE,
  SECTION_HEADING_STYLE,
  VIOLET_LINE_STYLE,
} from "./banner-styles";
import { logStyled, logStyledLines } from "./styled-log";

type BannerSection = {
  heading: string;
  lines: string[];
  lineStyle: string;
};

const FRAME_TOP = "┌─────────────────────────────────────────────────────────────";
const FRAME_BOTTOM = "└─────────────────────────────────────────────────────────────";
const FRAME_SEPARATOR = "│";

const TECH_STACK_SECTION: BannerSection = {
  heading: "│  🏗️  TECH STACK",
  lineStyle: INDIGO_LINE_STYLE,
  lines: [
    "│  • WordPress Custom Theme",
    "│  • TypeScript & Modern JavaScript",
    "│  • SCSS with custom styling",
    "│  • Responsive design with mobile-first approach",
    "│  • Dark/Light theme switcher",
    "│  • Custom Gutenberg blocks",
  ],
};

const FEATURES_SECTION: BannerSection = {
  heading: "│  🎨  FEATURES",
  lineStyle: VIOLET_LINE_STYLE,
  lines: [
    "│  • Interactive hamburger navigation",
    "│  • Smooth scroll animations",
    "│  • Language switcher (multilingual support)",
    "│  • Image lightbox functionality",
    "│  • Scroll-to-top button",
    "│  • SEO optimized structure",
  ],
};

const DEVELOPMENT_SECTION: BannerSection = {
  heading: "│  🔧  DEVELOPMENT",
  lineStyle: PURPLE_LINE_STYLE,
  lines: [
    "│  • Built with modern web standards",
    "│  • Optimized for performance",
    "│  • Cross-browser compatibility",
    "│  • Accessibility features included",
    "│  • Custom post types & fields support",
  ],
};

const FILE_STRUCTURE_SECTION: BannerSection = {
  heading: "│  📁  FILE STRUCTURE",
  lineStyle: INDIGO_LINE_STYLE,
  lines: [
    "│  src/",
    "│  ├── scripts/          # TypeScript modules",
    "│  ├── styles/           # SCSS stylesheets",
    "│  ├── blocks/           # Custom Gutenberg blocks",
    "│  └── index.ts          # Main entry point",
  ],
};

function logSection({ heading, lines, lineStyle }: BannerSection): void {
  logStyled(heading, SECTION_HEADING_STYLE);
  logStyledLines(lines, lineStyle);
}

export function logBannerFrame(): void {
  logStyled(FRAME_TOP, FRAME_STYLE);
  logSection(TECH_STACK_SECTION);
  logStyled(FRAME_SEPARATOR, FRAME_STYLE);
  logSection(FEATURES_SECTION);
  logStyled(FRAME_SEPARATOR, FRAME_STYLE);
  logSection(DEVELOPMENT_SECTION);
  logStyled(FRAME_SEPARATOR, FRAME_STYLE);
  logSection(FILE_STRUCTURE_SECTION);
  logStyled(FRAME_BOTTOM, FRAME_STYLE);
}
