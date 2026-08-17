import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

interface MediaUploadProps {
  onSelect: (media: { id: number; url: string; mime?: string }) => void;
  render: (props: { open: () => void }) => React.ReactNode;
}

let mockMediaUploadCalls: MediaUploadProps[] = [];
const mockOpens = [jest.fn(), jest.fn()];

jest.mock("@wordpress/block-editor", () => ({
  useBlockProps: () => ({}),
  InspectorControls: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUploadCheck: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUpload: (props: MediaUploadProps) => {
    const index = mockMediaUploadCalls.length;
    mockMediaUploadCalls.push(props);
    return <>{props.render({ open: mockOpens[index] })}</>;
  },
}));

import Edit from "./edit";

describe("model-viewer Edit", () => {
  beforeEach(() => {
    mockMediaUploadCalls = [];
    mockOpens.forEach((fn) => fn.mockClear());
  });

  const baseAttributes = {
    modelId: 0,
    modelUrl: "",
    posterId: 0,
    posterUrl: "",
    ariaLabel: "",
    clipName: "open",
    backgroundColor: "",
    aspectRatio: "16/9",
    enableOrbitControls: false,
    screenText: "",
  };

  it("shows Select buttons for both the model and the fallback image when nothing is chosen", () => {
    render(<Edit attributes={baseAttributes} setAttributes={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Select .glb model" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select fallback image" })).toBeInTheDocument();
  });

  it("shows the filename and a Replace button once a model is chosen", () => {
    render(
      <Edit
        attributes={{ ...baseAttributes, modelId: 5, modelUrl: "https://example.test/laptop.glb" }}
        setAttributes={jest.fn()}
      />
    );

    expect(screen.getByText("laptop.glb")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Replace .glb model" })).toBeInTheDocument();
  });

  it("calls setAttributes with the selected model id and url", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={baseAttributes} setAttributes={setAttributes} />);

    await user.click(screen.getByRole("button", { name: "Select .glb model" }));
    mockMediaUploadCalls[0].onSelect({ id: 7, url: "https://example.test/model.glb" });

    expect(setAttributes).toHaveBeenCalledWith({
      modelId: 7,
      modelUrl: "https://example.test/model.glb",
    });
  });

  it("calls setAttributes with the selected poster id and url", () => {
    const setAttributes = jest.fn();
    render(<Edit attributes={baseAttributes} setAttributes={setAttributes} />);

    mockMediaUploadCalls[1].onSelect({ id: 9, url: "https://example.test/poster.jpg" });

    expect(setAttributes).toHaveBeenCalledWith({
      posterId: 9,
      posterUrl: "https://example.test/poster.jpg",
    });
  });

  it("shows a warning notice when there is no fallback image", () => {
    const { container } = render(<Edit attributes={baseAttributes} setAttributes={jest.fn()} />);

    expect(container.querySelector(".components-notice.is-warning")?.textContent).toContain(
      "A fallback image is required"
    );
  });

  it("does not show the fallback-image warning once one is set", () => {
    const { container } = render(
      <Edit
        attributes={{ ...baseAttributes, posterUrl: "https://example.test/poster.jpg" }}
        setAttributes={jest.fn()}
      />
    );

    const noticeTexts = Array.from(container.querySelectorAll(".components-notice.is-warning")).map(
      (el) => el.textContent
    );
    expect(noticeTexts.some((text) => text?.includes("A fallback image is required"))).toBe(false);
  });

  it("updates the animation clip name via the text control", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={{ ...baseAttributes, clipName: "" }} setAttributes={setAttributes} />);

    await user.type(screen.getByLabelText("Animation clip name"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ clipName: "X" });
  });

  it("updates the aspect ratio via the select control", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={baseAttributes} setAttributes={setAttributes} />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Aspect ratio" }), "1/1");

    expect(setAttributes).toHaveBeenCalledWith({ aspectRatio: "1/1" });
  });

  it("renders the badge with the model filename once a model is set", () => {
    render(
      <Edit
        attributes={{ ...baseAttributes, modelUrl: "https://example.test/chair.glb" }}
        setAttributes={jest.fn()}
      />
    );

    expect(screen.getByText("3D Model: chair.glb")).toBeInTheDocument();
  });

  it("toggles enableOrbitControls via the drag-to-rotate toggle", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={baseAttributes} setAttributes={setAttributes} />);

    await user.click(screen.getByLabelText("Enable drag-to-rotate"));

    expect(setAttributes).toHaveBeenCalledWith({ enableOrbitControls: true });
  });

  it("updates the screen text via the textarea control", async () => {
    const setAttributes = jest.fn();
    const user = userEvent.setup();
    render(<Edit attributes={baseAttributes} setAttributes={setAttributes} />);

    await user.type(screen.getByLabelText("Screen text"), "X");

    expect(setAttributes).toHaveBeenCalledWith({ screenText: "X" });
  });
});
