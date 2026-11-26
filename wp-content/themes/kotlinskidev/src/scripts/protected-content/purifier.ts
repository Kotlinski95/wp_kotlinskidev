export interface Purifier {
  sanitize: (dirty: string) => string;
}

export const loadPurifier = async (): Promise<Purifier> => {
  const { default: DOMPurify } = await import("dompurify");
  return { sanitize: (dirty) => DOMPurify.sanitize(dirty) };
};

export const createTagStrippingPurifier = (): Purifier => ({
  sanitize: (dirty) => dirty.replace(/[&<>"']/g, ""),
});
