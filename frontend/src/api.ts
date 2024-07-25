export const fetchItems = async (pageParam: number) => {
  const response = await fetch(`/api/items?page=${pageParam}`);
  const items = (await response.json()) as ItemsResponse;
  if (items.error) {
    throw new Error(items.error);
  }
  if (items.results.length && pageParam < items.total_pages) {
    items.nextCursor = pageParam + 1;
  }
  return items;
};

export const fetchDetail = async (selectedItemId: number | null) => {
  if (selectedItemId === null) {
    throw new Error("No item selected");
  }
  const response = await fetch(`/api/items/${selectedItemId}`);
  const detail = (await response.json()) as DetailResponse;
  if (detail.error) {
    throw new Error(detail.error);
  }
  return detail.result;
};
