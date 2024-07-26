interface Media {
  id: number;
  name: string;
  type: string;
  poster_path: string;
}

interface MediaDetail extends Media {
  genres: { id: number; name: string }[];
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  release_date: string;
  status: string;
  vote_average: number;
}

interface MovieDetail extends MediaDetail {
  budget: number;
  imdb_id: string;
  revenue: number;
  runtime: number;
  watched: boolean;
}

interface Episode {
  id: number;
  name: string;
  overview: string;
  runtime: number | null;
  air_date: string;
  vote_average: number;
  watched: boolean;
}

interface Season {
  id: number;
  name: string;
  overview: string;
  air_date: string | null;
  vote_average: number;
  episodes: Episode[];
}

interface ShowDetail extends MediaDetail {
  in_production: boolean;
  last_air_date: string;
  seasons: Season[];
}

interface ItemsResponse {
  results: Media[];
  total_pages: number;
  error?: string;
  nextCursor?: number;
}

interface DetailResponse {
  result: MediaDetail;
  error?: string;
}
