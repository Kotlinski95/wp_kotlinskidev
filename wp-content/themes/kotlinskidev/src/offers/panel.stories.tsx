import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import {
  OfferPanel,
  createEmptyVariant,
  moveVariant,
  removeVariant,
  updateVariant,
  type OfferVariant,
} from "./panel";

function OfferPanelPreview(): JSX.Element {
  const [variants, setVariants] = React.useState<OfferVariant[]>([
    { ...createEmptyVariant(0), key: "landing", label: "Landing page", price_from: 999 },
  ]);

  return (
    <div style={{ maxWidth: 320 }}>
      <button
        type="button"
        onClick={() => setVariants([...variants, createEmptyVariant(variants.length)])}
      >
        Add
      </button>
      <ul>
        {variants.map((variant, index) => (
          <li key={index}>
            {variant.key} - {variant.label}
            <button type="button" onClick={() => setVariants(moveVariant(variants, index, -1))}>
              Up
            </button>
            <button type="button" onClick={() => setVariants(removeVariant(variants, index))}>
              Remove
            </button>
            <button
              type="button"
              onClick={() => setVariants(updateVariant(variants, index, { label: "Updated" }))}
            >
              Rename
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const meta: Meta<typeof OfferPanel> = {
  title: "Offers/Panel",
  component: OfferPanel,
  render: OfferPanelPreview,
};

export default meta;

type Story = StoryObj<typeof OfferPanel>;

export const Default: Story = {};
