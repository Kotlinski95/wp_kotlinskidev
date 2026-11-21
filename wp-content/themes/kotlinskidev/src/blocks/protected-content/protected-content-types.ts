export type ProtectionType = "email" | "phone" | "address" | "other" | "text";

export interface ProtectedContentAttributes {
  content: string;
  useProtection: boolean;
  protectionType: ProtectionType;
  tagName: string;
  isHtmlMode: boolean;
}

export const buildProtectedContentClassName = ({
  useProtection,
  protectionType,
}: Pick<ProtectedContentAttributes, "useProtection" | "protectionType">): string =>
  useProtection ? `protected-content protected-content--${protectionType}` : "protected-content";
