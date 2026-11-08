import React from "react";
import { render, screen } from "@testing-library/react";
import { createReduxStore, register } from "@wordpress/data";

interface MediaUploadProps {
  onSelect: (media: { id: number; url: string }) => void;
  render: (props: { open: () => void }) => React.ReactNode;
}

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: () => ({}),
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUploadCheck: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUpload: (props: MediaUploadProps) => <>{props.render({ open: jest.fn() })}</>,
}));

register(
  createReduxStore("core", {
    reducer: (state = {}) => state,
    selectors: {
      getMedia: () => null,
    },
  })
);

import Edit from "./edit";

describe("device-frame Edit", () => {
  const baseAttributes = {
    device: "desktop" as const,
    aspectRatio: "",
    imageId: 0,
    imageUrl: "",
    alt: "",
    positionStyle: "" as const,
    keepEffectOnMobile: false,
    objectPosition: "",
  };

  it("hides the focal point picker until an image is set", () => {
    render(<Edit attributes={baseAttributes} setAttributes={jest.fn()} />);

    expect(screen.queryByText("Focal point")).not.toBeInTheDocument();
  });

  it("shows the focal point picker once an image is set", () => {
    render(
      <Edit
        attributes={{ ...baseAttributes, imageId: 5, imageUrl: "https://example.test/shot.webp" }}
        setAttributes={jest.fn()}
      />
    );

    expect(screen.getByText("Focal point")).toBeInTheDocument();
  });

  it("applies the stored object-position to the preview image", () => {
    const { container } = render(
      <Edit
        attributes={{
          ...baseAttributes,
          imageId: 5,
          imageUrl: "https://example.test/shot.webp",
          objectPosition: "30% 70%",
        }}
        setAttributes={jest.fn()}
      />
    );

    expect(container.querySelector(".kt-device-frame__image")).toHaveStyle({
      objectPosition: "30% 70%",
    });
  });
});
