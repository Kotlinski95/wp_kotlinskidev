import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

interface MediaUploadProps {
  onSelect: (media: { id: number; url: string }) => void;
  render: (props: { open: () => void }) => React.ReactNode;
}

let mockMediaUploadCalls: MediaUploadProps[] = [];
const mockOpens = [jest.fn(), jest.fn()];

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: (props: Record<string, unknown>) => props,
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUploadCheck: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  InnerBlocks: ({ template }: { template: unknown[] }) => (
    <div data-testid="inner-blocks" data-template-length={template.length} />
  ),
  MediaUpload: (props: MediaUploadProps) => {
    const index = mockMediaUploadCalls.length;
    mockMediaUploadCalls.push(props);
    return <>{props.render({ open: mockOpens[index] })}</>;
  },
  __experimentalGetSpacingClassesAndStyles: () => ({ style: {} }),
}));

import Edit from "./edit";

describe("hero-carousel/slide Edit", () => {
  beforeEach(() => {
    mockMediaUploadCalls = [];
    mockOpens.forEach((fn) => fn.mockClear());
  });

  it("shows Set Image with no remove button when there is no background image", () => {
    render(<Edit attributes={{} as never} setAttributes={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Set Image" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove Image" })).not.toBeInTheDocument();
  });

  it("shows Change Image and Remove Image once a background image is set", () => {
    render(
      <Edit
        attributes={{ bgImageUrl: "bg.jpg", bgImageId: 1 } as never}
        setAttributes={jest.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Change Image" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Image" })).toBeInTheDocument();
  });

  it("shows a placeholder message on the canvas when there is no background image", () => {
    render(<Edit attributes={{} as never} setAttributes={jest.fn()} />);

    expect(screen.getByText("Set a background image in the sidebar.")).toBeInTheDocument();
  });

  it("renders the background image on the canvas when set and no video is chosen", () => {
    const { container } = render(
      <Edit
        attributes={{ bgImageUrl: "bg.jpg", bgImageId: 1 } as never}
        setAttributes={jest.fn()}
      />
    );

    expect(container.querySelector(".hero-carousel__bg img")).toHaveAttribute("src", "bg.jpg");
    expect(container.querySelector(".hero-carousel__bg video")).toBeNull();
  });

  it("renders the background video instead of the image once both are set", () => {
    const { container } = render(
      <Edit
        attributes={
          { bgImageUrl: "bg.jpg", bgImageId: 1, bgVideoUrl: "bg.mp4", bgVideoId: 2 } as never
        }
        setAttributes={jest.fn()}
      />
    );

    expect(container.querySelector(".hero-carousel__bg video")).toHaveAttribute("src", "bg.mp4");
    expect(container.querySelector(".hero-carousel__bg img")).toBeNull();
  });

  it("shows Set Video with no remove button when there is no video yet", () => {
    render(<Edit attributes={{} as never} setAttributes={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Set Video" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove Video" })).not.toBeInTheDocument();
  });

  it("shows Change Video and Remove Video once a video is set", () => {
    render(
      <Edit
        attributes={{ bgVideoUrl: "bg.mp4", bgVideoId: 2 } as never}
        setAttributes={jest.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Change Video" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Video" })).toBeInTheDocument();
  });

  it("sets bgImageUrl/Id when an image is selected", () => {
    const setAttributes = jest.fn();
    render(<Edit attributes={{} as never} setAttributes={setAttributes} />);

    mockMediaUploadCalls[0].onSelect({ id: 3, url: "chosen.jpg" });

    expect(setAttributes).toHaveBeenCalledWith({ bgImageUrl: "chosen.jpg", bgImageId: 3 });
  });

  it("clears bgImageUrl/Id when the image is removed", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(
      <Edit
        attributes={{ bgImageUrl: "bg.jpg", bgImageId: 1 } as never}
        setAttributes={setAttributes}
      />
    );

    await user.click(screen.getByRole("button", { name: "Remove Image" }));

    expect(setAttributes).toHaveBeenCalledWith({ bgImageUrl: "", bgImageId: 0 });
  });

  it("sets bgVideoUrl/Id when a video is selected", () => {
    const setAttributes = jest.fn();
    render(<Edit attributes={{} as never} setAttributes={setAttributes} />);

    mockMediaUploadCalls[1].onSelect({ id: 4, url: "chosen.mp4" });

    expect(setAttributes).toHaveBeenCalledWith({ bgVideoUrl: "chosen.mp4", bgVideoId: 4 });
  });

  it("clears bgVideoUrl/Id when the video is removed", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(
      <Edit
        attributes={{ bgVideoUrl: "bg.mp4", bgVideoId: 2 } as never}
        setAttributes={setAttributes}
      />
    );

    await user.click(screen.getByRole("button", { name: "Remove Video" }));

    expect(setAttributes).toHaveBeenCalledWith({ bgVideoUrl: "", bgVideoId: 0 });
  });

  it("defaults the overlay opacity to 0.4 and reflects it as a CSS variable", () => {
    const { container } = render(<Edit attributes={{} as never} setAttributes={jest.fn()} />);

    expect(screen.getByRole("slider", { name: "Overlay Opacity" })).toHaveValue("0.4");
    expect(
      (container.querySelector(".hero-carousel__slide") as HTMLElement).style.getPropertyValue(
        "--overlay-opacity"
      )
    ).toBe("0.4");
  });

  it("updates the overlay opacity via the range control", () => {
    const setAttributes = jest.fn();
    render(<Edit attributes={{} as never} setAttributes={setAttributes} />);

    const slider = screen.getByRole("slider", { name: "Overlay Opacity" });
    fireEvent.change(slider, { target: { value: "0.7" } });

    expect(setAttributes).toHaveBeenCalledWith({ bgOverlay: 0.7 });
  });

  it("renders the slide's inner-blocks template with heading, paragraph, and buttons", () => {
    render(<Edit attributes={{} as never} setAttributes={jest.fn()} />);

    expect(screen.getByTestId("inner-blocks")).toHaveAttribute("data-template-length", "3");
  });
});
