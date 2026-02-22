type WithDocId = { docId?: string };

export const upsertByDocId = <TItem extends WithDocId>(
  items: TItem[],
  item: TItem
): TItem[] => {
  if (!item.docId) {
    return items;
  }

  const index = items.findIndex((entry) => entry.docId === item.docId);
  if (index === -1) {
    return [...items, item];
  }

  const nextItems = [...items];
  nextItems[index] = item;
  return nextItems;
};

export const removeByDocId = <TItem extends WithDocId>(
  items: TItem[],
  docId: string
): TItem[] => {
  return items.filter((item) => item.docId !== docId);
};
