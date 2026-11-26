import React, { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type FeatureCardCanvasAttributes } from "./edit";
import { useInteractiveAttributes, RealBlockEdit } from "@utils/storybook-edit-props";
import "./index";

const baseAttributes: FeatureCardCanvasAttributes = {
  variant: "browser-stream",
  aspectRatio: "16/9",
  labelOne: "Kotlin",
  labelTwo: "WordPress",
  labelThree: "React",
  description: "",
  accentColor: "",
  touchAutoplay: true,
  trigger: "hover",
};

function FeatureCanvasStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<FeatureCardCanvasAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/feature-card-canvas"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

function SchemeToggleStory() {
  const [dark, setDark] = useState(false);
  const [attributes, setAttributes] = useInteractiveAttributes<FeatureCardCanvasAttributes>();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark-mode", dark);
    root.classList.toggle("light-mode", !dark);
  }, [dark]);

  return (
    <>
      <button type="button" onClick={() => setDark((value) => !value)}>
        {dark ? "Switch to light" : "Switch to dark"}
      </button>
      <RealBlockEdit
        name="kotlinskidev/feature-card-canvas"
        attributes={attributes}
        setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
      />
    </>
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Feature Card Canvas",
  component: Edit,
  render: FeatureCanvasStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const BrowserStream: Story = {
  args: { attributes: { ...baseAttributes, variant: "browser-stream" } },
};

export const NodeTree: Story = {
  args: { attributes: { ...baseAttributes, variant: "node-tree" } },
};

export const DotImageStack: Story = {
  args: { attributes: { ...baseAttributes, variant: "dot-image-stack" } },
};

export const ChartGrowth: Story = {
  args: { attributes: { ...baseAttributes, variant: "chart-growth" } },
};

export const Storefront: Story = {
  args: { attributes: { ...baseAttributes, variant: "storefront" } },
};

export const LayoutBuilder: Story = {
  args: { attributes: { ...baseAttributes, variant: "layout-builder" } },
};

export const SpeedGauge: Story = {
  args: { attributes: { ...baseAttributes, variant: "speed-gauge" } },
};

export const NavAbout: Story = {
  args: { attributes: { ...baseAttributes, variant: "nav-about" } },
};

export const NavProjects: Story = {
  args: { attributes: { ...baseAttributes, variant: "nav-projects" } },
};

export const NavServices: Story = {
  args: { attributes: { ...baseAttributes, variant: "nav-services" } },
};

export const NavContact: Story = {
  args: { attributes: { ...baseAttributes, variant: "nav-contact" } },
};

export const SiteScroll: Story = {
  args: { attributes: { ...baseAttributes, variant: "site-scroll" } },
};

export const CheckoutFlow: Story = {
  args: { attributes: { ...baseAttributes, variant: "checkout-flow" } },
};

export const AppDashboard: Story = {
  args: { attributes: { ...baseAttributes, variant: "app-dashboard" } },
};

export const LoadWaterfall: Story = {
  args: { attributes: { ...baseAttributes, variant: "load-waterfall" } },
};

export const LocalSearch: Story = {
  args: { attributes: { ...baseAttributes, variant: "local-search" } },
};

export const SupportShield: Story = {
  args: { attributes: { ...baseAttributes, variant: "support-shield" } },
};

export const BenefitMarketing: Story = {
  args: { attributes: { ...baseAttributes, variant: "benefit-marketing" } },
};

export const BenefitSaas: Story = {
  args: { attributes: { ...baseAttributes, variant: "benefit-saas" } },
};

export const BenefitDesignSystem: Story = {
  args: { attributes: { ...baseAttributes, variant: "benefit-design-system" } },
};

export const BenefitApi: Story = {
  args: { attributes: { ...baseAttributes, variant: "benefit-api" } },
};

export const CustomAccent: Story = {
  args: { attributes: { ...baseAttributes, accentColor: "primary-dark" } },
};

export const LightDarkToggle: Story = {
  args: { attributes: baseAttributes },
  render: SchemeToggleStory,
};

export const CommerceConversion: Story = {
  args: { attributes: { ...baseAttributes, variant: "commerce-conversion" } },
};

export const CommerceScale: Story = {
  args: { attributes: { ...baseAttributes, variant: "commerce-scale" } },
};

export const CommerceSecure: Story = {
  args: { attributes: { ...baseAttributes, variant: "commerce-secure" } },
};

export const CommercePlatforms: Story = {
  args: { attributes: { ...baseAttributes, variant: "commerce-platforms" } },
};

export const IllusStorefront: Story = {
  args: { attributes: { ...baseAttributes, variant: "illus-storefront" } },
};

export const IllusAudit: Story = {
  args: { attributes: { ...baseAttributes, variant: "illus-audit" } },
};

export const IllusMobileFirst: Story = {
  args: { attributes: { ...baseAttributes, variant: "illus-mobile-first" } },
};

export const IllusVitals: Story = {
  args: { attributes: { ...baseAttributes, variant: "illus-vitals" } },
};

export const IllusMobileCheckout: Story = {
  args: { attributes: { ...baseAttributes, variant: "illus-mobile-checkout" } },
};

export const IllusSeoGrowth: Story = {
  args: { attributes: { ...baseAttributes, variant: "illus-seo-growth" } },
};

export const IllusHandover: Story = {
  args: { attributes: { ...baseAttributes, variant: "illus-handover" } },
};

export const IllusAppServices: Story = {
  args: { attributes: { ...baseAttributes, variant: "illus-app-services" } },
};

export const VsFrameworks: Story = {
  args: { attributes: { ...baseAttributes, variant: "vs-frameworks" } },
};

export const PwaInstall: Story = {
  args: { attributes: { ...baseAttributes, variant: "pwa-install" } },
};

export const SsrSmartedit: Story = {
  args: { attributes: { ...baseAttributes, variant: "ssr-smartedit" } },
};

export const NextjsArchitecture: Story = {
  args: { attributes: { ...baseAttributes, variant: "nextjs-architecture" } },
};

export const PerfByDesign: Story = {
  args: { attributes: { ...baseAttributes, variant: "perf-by-design" } },
};

export const SmartShoppingList: Story = {
  args: { attributes: { ...baseAttributes, variant: "smart-shopping-list" } },
};

export const WpCustomTheme: Story = {
  args: { attributes: { ...baseAttributes, variant: "wp-custom-theme" } },
};

export const WpStackOwnership: Story = {
  args: { attributes: { ...baseAttributes, variant: "wp-stack-ownership" } },
};

export const WpFlexControl: Story = {
  args: { attributes: { ...baseAttributes, variant: "wp-flex-control" } },
};
