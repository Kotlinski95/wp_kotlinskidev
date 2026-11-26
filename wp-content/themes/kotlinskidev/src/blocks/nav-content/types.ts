export interface MediaObject {
  id: number;
  url: string;
  alt: string;
}

export interface NavParagraphAttributes {
  content: string;
  textColor: string;
  textGradient: string;
}

export interface NavImageAttributes {
  mediaId: number;
  mediaUrl: string;
  altText: string;
  linkUrl: string;
}

export interface NavLinkAttributes {
  label: string;
  url: string;
  opensInNewTab: boolean;
  description: string;
  rel: string;
  textColor: string;
  textGradient: string;
}

export interface NavBannerAttributes {
  mediaId: number;
  mediaUrl: string;
  altText: string;
  heading: string;
  description: string;
  linkUrl: string;
  linkLabel: string;
  hoverPadding: string;
  followLinkedCover: boolean;
}
