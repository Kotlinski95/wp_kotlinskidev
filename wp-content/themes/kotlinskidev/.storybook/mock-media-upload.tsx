import React from "react";
import { addFilter } from "@wordpress/hooks";
import { dispatch } from "@wordpress/data";
import { store as blockEditorStore } from "@wordpress/block-editor";
import { MOCK_IMAGE_HERO, MOCK_IMAGE_BACKGROUND, MOCK_IMAGE_MAP } from "./mock-assets";

export interface MockMediaItem {
  id: number;
  url: string;
  alt?: string;
  sizes?: Record<string, { url: string }>;
}

export const MOCK_MEDIA_LIBRARY: MockMediaItem[] = [
  { id: 9001, url: MOCK_IMAGE_HERO, alt: "Storybook mock banner 1" },
  { id: 9002, url: MOCK_IMAGE_BACKGROUND, alt: "Storybook mock banner 2" },
  { id: 9003, url: MOCK_IMAGE_MAP, alt: "Storybook mock banner 3" },
];

interface MockMediaUploadProps {
  onSelect: (media: MockMediaItem | MockMediaItem[]) => void;
  multiple?: boolean;
  render: (args: { open: () => void }) => React.ReactNode;
}

function MockMediaUpload({ onSelect, multiple, render }: MockMediaUploadProps) {
  const open = () => {
    onSelect(multiple ? MOCK_MEDIA_LIBRARY : MOCK_MEDIA_LIBRARY[0]);
  };

  return <>{render({ open })}</>;
}

addFilter("editor.MediaUpload", "kotlinskidev/storybook-mock-media-upload", () => MockMediaUpload);

dispatch(blockEditorStore).updateSettings({ mediaUpload: () => {} });
