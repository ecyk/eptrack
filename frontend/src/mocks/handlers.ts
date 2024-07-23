import { http, HttpResponse } from "msw";

import movies from "./movies.json";
import shows from "./shows.json";

const combined = {
  data: movies.data.concat(shows.data).sort(() => Math.random() - 0.5),
};
const maxPageSize = 25;

export const handlers = [
  http.get("/media", ({ request }) => {
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
    if (endIndex > combined.data.length) {
      endIndex = combined.data.length;
    }
    const slicedData = combined.data.slice(startIndex, endIndex);

    if (slicedData.length === 0) {
      return HttpResponse.json(
        { error: "No data found for this page" },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      data: slicedData,
      total_pages: combined.data.length / maxPageSize,
    });
  }),
];
