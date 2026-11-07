export interface LocalFaqPair {
  question: string;
  answer: string;
}

export interface ServiceLocationMeta {
  city?: string;
  local_intro?: string;
  local_audience?: string;
  local_distance?: string;
  local_faq?: LocalFaqPair[];
  featured_projects?: number[];
}

export const LOCAL_FAQ_MAX = 2;
export const FEATURED_PROJECTS_MAX = 3;
export const MIN_SUPPORTING_FIELDS = 2;

export function isLocalContentReady(meta: ServiceLocationMeta | undefined): boolean {
  if (!meta || (meta.local_intro ?? "").trim() === "") {
    return false;
  }

  const hasFaq = (meta.local_faq ?? []).some(
    (pair) => pair.question.trim() !== "" && pair.answer.trim() !== ""
  );
  const supporting = [
    (meta.local_audience ?? "").trim() !== "",
    (meta.local_distance ?? "").trim() !== "",
    hasFaq,
    (meta.featured_projects ?? []).length > 0,
  ].filter(Boolean).length;

  return supporting >= MIN_SUPPORTING_FIELDS;
}

export function toggleFeaturedProject(current: number[], id: number, checked: boolean): number[] {
  if (!checked) {
    return current.filter((value) => value !== id);
  }

  if (current.includes(id) || current.length >= FEATURED_PROJECTS_MAX) {
    return current;
  }

  return [...current, id];
}

export function updateFaqPair(
  current: LocalFaqPair[],
  index: number,
  patch: Partial<LocalFaqPair>
): LocalFaqPair[] {
  const next = Array.from({ length: LOCAL_FAQ_MAX }, (_, i) => ({
    question: current[i]?.question ?? "",
    answer: current[i]?.answer ?? "",
  }));
  next[index] = { ...next[index], ...patch };

  return next;
}
