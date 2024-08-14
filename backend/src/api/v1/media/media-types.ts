/* eslint-disable @typescript-eslint/consistent-type-definitions */
export interface TMDBMedia {
  id: number;
  title?: string | null;
  name?: string | null;
  media_type: string;
  poster_path: string | null;
}

export interface TMDBTrending {
  results: TMDBMedia[];
  page: number;
  total_pages: number;
}

export interface TMDBSearch {
  results: TMDBMedia[];
  page: number;
  total_pages: number;
}

interface TMDBMediaDetail extends TMDBMedia {
  genres: Array<{ id: number; name: string }>;
  origin_country: string[];
  original_language: string | null;
  overview: string | null;
  popularity: number | null;
  status: string | null;
  vote_average: number | null;
}

export interface TMDBMovie extends Omit<TMDBMediaDetail, "name"> {
  release_date: string | null;
  budget: number | null;
  revenue: number | null;
  runtime: number | null;
}

export interface TMDBEpisode {
  id: number;
  name: string | null;
}

export interface TMDBSeason {
  id: number;
  name: string | null;
  overview: string | null;
  air_date: string | null;
  episodes?: TMDBEpisode[];
}

export interface TMDBShow extends Omit<TMDBMediaDetail, "title"> {
  first_air_date: string | null;
  in_production: boolean | null;
  number_of_seasons: number | null;
  seasons: TMDBSeason[];
  [key: `season/${number}`]: TMDBSeason;
}

export type Media = {
  id: number;
  name: string | null;
  type: string;
  poster_path: string | null;
};

export type TrendingResponse = {
  results: Media[];
  page: number;
  total_pages: number;
}

export type SearchResponse = {
  results: Media[];
  page: number;
  total_pages: number;
};

type MediaDetail = Media & {
  genres: Array<{ id: number; name: string }>;
  origin_country: string[];
  original_language: string | null;
  overview: string | null;
  popularity: number | null;
  status: string | null;
  vote_average: number | null;
  release_date: string | null;
};

export type Movie = MediaDetail & {
  budget: number | null;
  revenue: number | null;
  runtime: number | null;
};

export type Episode = {
  id: number;
  name: string | null;
};

export type Season = {
  id: number;
  name: string | null;
  overview: string | null;
  air_date: string | null;
  episodes: Episode[];
};

export type Show = MediaDetail & {
  in_production: boolean | null;
  seasons: Season[];
};
