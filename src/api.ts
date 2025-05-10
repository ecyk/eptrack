export const fetchItems = async (
  pageParam: number,
  searchQuery: string,
  searchTags: number[]
) => {
  if (searchTags.length) {
    const res = await fetch(`/api/v1/media/search?tags=${searchTags.join(",")}`);
    const data: unknown = await res.json();
    if (!res.ok) {
      const err = data as ErrorResponse;
      throw new Error(err.message);
    }
    const result = data as SearchResponse;
    return { ...result, nextCursor: undefined };
  }

  if (searchQuery !== "") {
    const res = await fetch(`/api/v1/media/search?query=${searchQuery}&page=${pageParam}`);
    const data: unknown = await res.json();
    if (!res.ok) {
      const err = data as ErrorResponse;
      throw new Error(err.message);
    }
    const result = data as SearchResponse;
    if (result.results.length && pageParam < result.total_pages) {
      pageParam = pageParam + 1;
    }
    return { ...result, nextCursor: pageParam };
  }

  const res = await fetch(`/api/v1/media/trending?page=${pageParam}`);
  const data: unknown = await res.json();
  if (!res.ok) {
    const err = data as ErrorResponse;
    throw new Error(err.message);
  }
  const result = data as TrendingResponse;
  if (result.results.length && pageParam < result.total_pages) {
    pageParam = pageParam + 1;
  }
  return { ...result, nextCursor: pageParam };
};

export const fetchDetail = async (selectedMedia: Media | null) => {
  if (selectedMedia === null) {
    throw new Error("No item selected");
  }
  const res = await fetch(`/api/v1/media/${selectedMedia.id}?type=${selectedMedia.type}`);
  const data: unknown = await res.json();
  if (!res.ok) {
    const err = data as ErrorResponse;
    throw new Error(err.message);
  }
  if (selectedMedia.type === "movie") {
    return data as MovieResponse;
  }
  return data as ShowResponse;
};

export const updateDetail = async (request: SaveMediaRequest) => {
  const res = await fetch(`/api/v1/user/medias`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const data: unknown = await res.json();
    const err = data as ErrorResponse;
    throw new Error(err.message);
  }
};

export const fetchAllTags = async () => {
  const res = await fetch(`/api/v1/user/tags`);
  const data: unknown = await res.json();
  if (!res.ok) {
    const err = data as ErrorResponse;
    throw new Error(err.message);
  }
  return data as Tag[];
};

export const createTag = async (request: tagRequest) => {
  const res = await fetch(`/api/v1/user/tags`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const data: unknown = await res.json();
    const err = data as ErrorResponse;
    throw new Error(err.message);
  }
};

export const deleteTag = async (request: tagRequest) => {
  const res = await fetch(`/api/v1/user/tags`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const data: unknown = await res.json();
    const err = data as ErrorResponse;
    throw new Error(err.message);
  }
};
