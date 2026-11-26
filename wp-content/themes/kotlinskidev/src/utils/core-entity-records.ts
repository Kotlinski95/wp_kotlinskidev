type StoreSelector = (storeName: string) => unknown;

interface EntityRecordsRequest {
  kind: string;
  name: string;
  query: Record<string, unknown>;
}

interface CoreEntityRecordsSelectors {
  getEntityRecords: <EntityRecord>(
    kind: string,
    name: string,
    query: Record<string, unknown>
  ) => EntityRecord[] | null;
}

export const selectCoreEntityRecords = <EntityRecord>(
  select: StoreSelector,
  { kind, name, query }: EntityRecordsRequest
): EntityRecord[] | null =>
  (select("core") as CoreEntityRecordsSelectors).getEntityRecords<EntityRecord>(kind, name, query);
