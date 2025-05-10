export interface BasicTmdbMedia {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string | null;
  name?: string | null;
}

export interface TmdbMedia extends BasicTmdbMedia {
  poster_path: string | null;
  genre_ids?: number[];
  origin_country: string[];
  original_language: string | null;
  overview: string | null;
  popularity: number | null;
  status: string | null;
  vote_average: number | null;
  genres?: Array<{ id: number; name: string }>;
}

export interface TmdbTrending {
  results: TmdbMedia[];
  page: number;
  total_pages: number;
}

export interface TmdbSearch {
  results: TmdbMedia[];
  page: number;
  total_pages: number;
}

export interface TmdbMovie extends Omit<TmdbMedia, "name"> {
  release_date: string | null;
  budget: number | null;
  revenue: number | null;
  runtime: number | null;
}

export interface TmdbEpisode {
  id: number;
  name: string | null;
}

export interface TmdbSeason {
  id: number;
  name: string | null;
  overview: string | null;
  air_date: string | null;
  episodes?: TmdbEpisode[];
  season_number: number;
}

export interface TmdbShow extends Omit<TmdbMedia, "title"> {
  first_air_date: string | null;
  in_production: boolean | null;
  number_of_seasons: number | null;
  seasons: TmdbSeason[];
  [key: `season/${number}`]: TmdbSeason;
}
