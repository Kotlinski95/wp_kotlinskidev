export interface ModelViewerAttributes {
  modelId: number;
  modelUrl: string;
  posterId: number;
  posterUrl: string;
  ariaLabel: string;
  clipName: string;
  backgroundColor: string;
  aspectRatio: string;
  enableOrbitControls: boolean;
  screenText: string;
}

export interface ModelViewerPanelProps {
  attributes: ModelViewerAttributes;
  setAttributes: (attrs: Partial<ModelViewerAttributes>) => void;
}
