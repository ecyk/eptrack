interface Media {
  id: number;
  name: string | null;
  type: "movie" | "tv";
  poster_path: string | null;
}

interface TrendingResponse {
  results: Media[];
  page: number;
  total_pages: number;
}

interface MediaDetail extends Media {
  genres: { id: number; name: string }[];
  origin_country: string[];
  original_language: string | null;
  overview: string | null;
  popularity: number | null;
  release_date: string;
  status: string | null;
  vote_average: number | null;
}

interface MovieResponse extends MediaDetail {
  budget: number | null;
  revenue: number | null;
  runtime: number | null;
}

interface Episode {
  id: number;
  name: string | null;
}

interface Season {
  id: number;
  name: string | null;
  overview: string | null;
  episodes: Episode[];
}

interface ShowResponse extends MediaDetail {
  in_production: boolean | null;
  seasons: Season[];
  watched?: number[];
}

type SaveShowData = [number, boolean][];

interface SaveShowRequest {
  mediaId: number;
  data: SaveShowData;
}
