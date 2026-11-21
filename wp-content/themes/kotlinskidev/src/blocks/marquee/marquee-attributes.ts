export interface MarqueeAttributes {
  speed: number;
  direction: "normal" | "reverse";
  gap: number;
}

export interface MarqueeEditProps {
  attributes: MarqueeAttributes;
  setAttributes: (attrs: Partial<MarqueeAttributes>) => void;
  clientId: string;
}
