import { delay, http, HttpResponse } from "msw";

import movies_ from "./movies.json";
import shows_ from "./shows.json";

const movies: MediaDetail[] = movies_;
const shows: MediaDetail[] = shows_;

const combined_detail: MediaDetail[] = movies
  .concat(shows)
  .sort(() => Math.random() - 0.5);

const combined: Media[] = combined_detail.map(
  ({ id, media_type, genre_ids, original_language, poster_path, title }) => {
    return { id, media_type, genre_ids, original_language, poster_path, title };
  }
);

const maxPageSize = 25;

export const handlers = [
  http.get("/api/items", async ({ request }) => {
    await delay(500);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);

    if (page < 1) {
      return HttpResponse.json(
        { error: "Invalid page number" },
        { status: 400 }
      );
    }

    const startIndex = (page - 1) * maxPageSize;
    let endIndex = startIndex + maxPageSize;
    if (endIndex > combined.length) {
      endIndex = combined.length;
    }
    const slicedData = combined.slice(startIndex, endIndex);

    if (slicedData.length === 0) {
      return HttpResponse.json(
        { error: "No data found for this page" },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      page: page,
      results: slicedData,
      total_pages: Math.ceil(combined.length / maxPageSize),
    });
  }),
  http.get("/api/items/:id", async ({ params }) => {
    await delay(500);

    const id = parseInt(params.id as string, 10);
    if (isNaN(id) || id < 0) {
      return HttpResponse.json({ error: "Invaild id" }, { status: 400 });
    }

    const item: MediaDetail | undefined = combined_detail.find(
      (item) => item.id === id
    );

    if (!item) {
      return HttpResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return HttpResponse.json({ result: item });
  }),
];
