import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import apiFetch from "@wordpress/api-fetch";

interface MockPickedMedia {
  id: number;
  url: string;
  type: string;
  width: number;
}

let mockPicked: MockPickedMedia = { id: 7, url: "https://x.test/m.mp4", type: "video", width: 720 };

jest.mock("@wordpress/api-fetch", () => ({ __esModule: true, default: jest.fn() }));

jest.mock("@wordpress/block-editor", () => ({
  MediaUploadCheck: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MediaUpload: ({
    render: renderTrigger,
    onSelect,
    allowedTypes,
  }: {
    render: (args: { open: () => void }) => React.ReactNode;
    onSelect: (media: MockPickedMedia) => void;
    allowedTypes: string[];
  }) => (
    <div data-allowed={allowedTypes.join(",")}>
      {renderTrigger({ open: () => onSelect(mockPicked) })}
    </div>
  ),
}));

import ResponsiveMediaPanel, { fetchFeaturedPoster, resolveResponsiveMedia } from "./panel";

const mockedFetch = apiFetch as unknown as jest.Mock;

const renderPanel = (
  overrides: Partial<React.ComponentProps<typeof ResponsiveMediaPanel>> = {}
) => {
  const onChange = jest.fn();
  render(
    <ResponsiveMediaPanel
      slots={{}}
      onChange={onChange}
      allowedTypes={["video"]}
      desktopLabel="Slide media"
      desktopUrl="https://x.test/d.mp4"
      {...overrides}
    />
  );
  return onChange;
};

beforeEach(() => {
  mockedFetch.mockReset();
  mockPicked = { id: 7, url: "https://x.test/m.mp4", type: "video", width: 720 };
});

describe("resolveResponsiveMedia", () => {
  it("falls back mobile to tablet to desktop", () => {
    expect(resolveResponsiveMedia("d", { tablet: { url: "t" } })).toEqual({
      desktop: "d",
      tablet: "t",
      mobile: "t",
    });
  });
});

describe("fetchFeaturedPoster", () => {
  it("returns the featured image id and url of a video", async () => {
    mockedFetch
      .mockResolvedValueOnce({ featured_media: 9 })
      .mockResolvedValueOnce({ source_url: "https://x.test/p.webp" });

    await expect(fetchFeaturedPoster(7)).resolves.toEqual({
      posterId: 9,
      posterUrl: "https://x.test/p.webp",
    });
  });

  it("returns nothing when the video has no featured image or the request fails", async () => {
    mockedFetch.mockResolvedValueOnce({ featured_media: 0 });
    await expect(fetchFeaturedPoster(7)).resolves.toEqual({});

    mockedFetch.mockRejectedValueOnce(new Error("offline"));
    await expect(fetchFeaturedPoster(7)).resolves.toEqual({});
  });
});

describe("ResponsiveMediaPanel", () => {
  it("passes the allowed media types to the picker", async () => {
    renderPanel({ allowedTypes: ["image"] });
    await userEvent.setup().click(screen.getByRole("button", { name: /Responsive media/ }));

    expect(document.querySelector("[data-allowed='image']")).not.toBeNull();
  });

  it("auto-fills the poster from the picked video's featured image", async () => {
    mockedFetch
      .mockResolvedValueOnce({ featured_media: 9 })
      .mockResolvedValueOnce({ source_url: "https://x.test/p.webp" });
    const onChange = renderPanel();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Responsive media/ }));
    await user.click(screen.getAllByRole("button", { name: "Select media" })[0]);

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        mobile: {
          id: 7,
          url: "https://x.test/m.mp4",
          type: "video",
          width: 720,
          posterId: 9,
          posterUrl: "https://x.test/p.webp",
        },
      })
    );
  });

  it("does not look up a poster for an image", async () => {
    mockPicked = { id: 4, url: "https://x.test/m.webp", type: "image", width: 828 };
    const onChange = renderPanel({ allowedTypes: ["image"] });
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Responsive media/ }));
    await user.click(screen.getAllByRole("button", { name: "Select media" })[0]);

    expect(mockedFetch).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith({
      mobile: { id: 4, url: "https://x.test/m.webp", type: "image", width: 828 },
    });
  });

  it("warns when a variant is wider than the desktop media", async () => {
    renderPanel({
      desktopWidth: 640,
      slots: { mobile: { url: "https://x.test/m.mp4", width: 1280 } },
    });
    await userEvent.setup().click(screen.getByRole("button", { name: /Responsive media/ }));

    expect(document.querySelector(".components-notice")).toHaveTextContent(
      /larger than the desktop one/
    );
  });

  it("does not warn when the variant is smaller", async () => {
    renderPanel({
      desktopWidth: 1920,
      slots: { mobile: { url: "https://x.test/m.mp4", width: 720 } },
    });
    await userEvent.setup().click(screen.getByRole("button", { name: /Responsive media/ }));

    expect(document.querySelector(".components-notice")).toBeNull();
  });

  it("uses the desktop label for the desktop summary", async () => {
    renderPanel();
    await userEvent.setup().click(screen.getByRole("button", { name: /Responsive media/ }));

    expect(screen.getByText(/Desktop uses:/)).toHaveTextContent("Slide media");
  });

  it("shows the Safari HEVC alpha picker only for an alpha slide and stores it on the slot", async () => {
    renderPanel();
    await userEvent.setup().click(screen.getByRole("button", { name: /Responsive media/ }));
    expect(screen.queryByText(/Select Safari HEVC alpha file/)).toBeNull();
  });

  it("stores the alpha file next to the slot's WebM", async () => {
    mockPicked = { id: 11, url: "https://x.test/m-hevc.mov", type: "video", width: 0 };
    const onChange = renderPanel({
      hasAlphaVideo: true,
      slots: { mobile: { id: 7, url: "https://x.test/m.webm" } },
    });
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Responsive media/ }));
    await user.click(screen.getAllByRole("button", { name: "Select Safari HEVC alpha file" })[0]);

    expect(onChange).toHaveBeenCalledWith({
      mobile: {
        id: 7,
        url: "https://x.test/m.webm",
        alphaId: 11,
        alphaUrl: "https://x.test/m-hevc.mov",
      },
    });
  });
});
