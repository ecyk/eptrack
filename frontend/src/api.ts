export const fetchItems = async (pageParam: number) => {
  const response = await fetch(`/api/v1/media/trending?page=${pageParam}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch trending page ${pageParam}`);
  }
  const trending = (await response.json()) as TrendingResponse;
  if (trending.results.length && pageParam < trending.total_pages) {
    pageParam = pageParam + 1;
  }
  return { ...trending, nextCursor: pageParam };
};

export const fetchDetail = async (selectedMedia: Media | null) => {
  if (selectedMedia === null) {
    throw new Error("No item selected");
  }
  const response = await fetch(
    `/api/v1/media/${selectedMedia.id}?type=${selectedMedia.type}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch ${selectedMedia.type ?? ""}`);
  }
  if (selectedMedia.type === "movie") {
    return (await response.json()) as MovieResponse;
  }
  return (await response.json()) as ShowResponse;
};

export const updateDetail = async (request: SaveShowRequest) => {
  const response = await fetch(`/api/v1/user/media`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(`Failed to save`);
  }
};
