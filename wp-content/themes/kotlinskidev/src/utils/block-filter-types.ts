export interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  supports?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface BlockEditProps<Attributes> {
  name: string;
  clientId?: string;
  attributes: Attributes;
  setAttributes: (attributes: Partial<Attributes>) => void;
}

export interface ExtraProps {
  className?: string;
  style?: Record<string, unknown>;
  [key: string]: unknown;
}

export const appendClassName = (extraProps: ExtraProps, classNames: string): void => {
  extraProps.className = extraProps.className
    ? `${extraProps.className} ${classNames}`
    : classNames;
};
