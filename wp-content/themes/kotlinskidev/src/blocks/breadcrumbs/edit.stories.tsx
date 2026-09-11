import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type BreadcrumbsAttributes } from "./edit";
import metadata from "./block.json";
import "./index";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import {
  BreadcrumbsRouteContext,
  type BreadcrumbsRoute,
} from "../../../.storybook/mock-server-side-render";

function makeBreadcrumbsStory(route: BreadcrumbsRoute) {
  return function BreadcrumbsStory() {
    const [attributes, setAttributes] = useInteractiveAttributes<BreadcrumbsAttributes>();

    return (
      <BreadcrumbsRouteContext.Provider value={route}>
        <RealBlockEdit
          name="kotlinskidev/breadcrumbs"
          attributes={attributes}
          setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
        />
      </BreadcrumbsRouteContext.Provider>
    );
  };
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Breadcrumbs",
  component: Edit,
  parameters: {
    docs: {
      description: {
        component:
          "The `showOnHomepage` toggle lives in the InspectorControls sidebar and is real and interactive — rendered through `RealBlockEdit` (the actual `@wordpress/block-editor` `BlockEdit` dispatcher, see `docs/storybook.md`), which is what makes the sidebar panel actually appear at all. Its own `ServerSideRender` call never forwards attributes to the REST preview (matches production — the toggle only ever affects the real frontend homepage, never the editor preview). The trail itself is a Storybook-only mock keyed by story: real markup differs by which page you're on (post, category archive, nested page), not by any block attribute, so each variant below is its own story rather than a control.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Edit>;

const args = {
  attributes: getDefaultAttributes<BreadcrumbsAttributes>(metadata.attributes),
};

export const Default: Story = {
  args,
  render: makeBreadcrumbsStory("post"),
};

export const CategoryArchive: Story = {
  args,
  render: makeBreadcrumbsStory("category"),
};

export const NestedPage: Story = {
  args,
  render: makeBreadcrumbsStory("page"),
};
