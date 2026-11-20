const POST_ID_META_SELECTOR = 'meta[name="post-id"]';
const POST_ID_BODY_CLASS_PREFIX = /^(postid-|page-id-)/;
const EXCLUDED_BODY_CLASSES = ["search", "error404"];

const parseId = (raw: string): number | null => {
  const id = Number.parseInt(raw, 10);
  return Number.isNaN(id) ? null : id;
};

export const getPostId = (): number | null => {
  const metaTag = document.querySelector(POST_ID_META_SELECTOR) as HTMLMetaElement | null;
  if (metaTag?.content) {
    const id = parseId(metaTag.content);
    if (id !== null) {
      return id;
    }
  }

  const bodyClasses = document.body.className.split(" ");
  for (const className of bodyClasses) {
    if (POST_ID_BODY_CLASS_PREFIX.test(className)) {
      const id = parseId(className.replace(POST_ID_BODY_CLASS_PREFIX, ""));
      if (id !== null) {
        return id;
      }
    }
  }

  return null;
};

export const isExcludedPage = (): boolean => {
  const bodyClasses = document.body.className;
  return EXCLUDED_BODY_CLASSES.some((excluded) => bodyClasses.includes(excluded));
};

export const getMetaContent = (selector: string): string => {
  const tag = document.querySelector(selector) as HTMLMetaElement | null;
  return tag?.content ?? "";
};
