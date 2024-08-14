import status from "http-status";

import {
  type TMDBSeason,
  type TMDBEpisode,
  type TMDBMovie,
  type TMDBShow,
  type TMDBTrending,
  type TMDBSearch,
  type Movie,
  type Show,
  type Season,
  type SearchResponse,
  type TrendingResponse,
} from "./media-types.js";
import { AppError } from "../../../app-error.js";
import config from "../../../config.js";
import { redisClient } from "../../../index.js";

async function tmdbFetch(path: string): Promise<unknown> {
  const response = await fetch(config.tmdb.base_url + path, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${config.tmdb.key}`,
    },
  });
  if (!response.ok) {
    throw new AppError(status.BAD_REQUEST, status[status.BAD_REQUEST]);
  }
  return await response.json();
}

export async function getTrending(page: number): Promise<unknown> {
  const path = `/trending/all/week?page=${page}`;

  const cachedTrending = await redisClient.json.get(path);
  if (cachedTrending != null) {
    return cachedTrending;
  }

  const trending = (await tmdbFetch(path)) as TMDBTrending;
  const filteredTrending: TrendingResponse = {
    results: trending.results.map((item) => ({
      id: item.id,
      name: item.title ?? item.name ?? null,
      type: item.media_type,
      poster_path: item.poster_path,
    })),
    page,
    total_pages: trending.total_pages,
  };

  await redisClient.json.set(path, "$", filteredTrending);
  await redisClient.expire(path, 7 * 24 * 60 * 60); // 7 days
  return filteredTrending;
}

export async function searchMedia(
  query: string,
  page: number
): Promise<unknown> {
  const path = `/search/multi?query=${query}&page=${page}`;

  const cachedSearch = await redisClient.json.get(path);
  if (cachedSearch != null) {
    return cachedSearch;
  }

  const searchResult = (await tmdbFetch(path)) as TMDBSearch;
  const filteredSearchResult: SearchResponse = {
    results: searchResult.results.map((item) => ({
      id: item.id,
      name: item.title ?? item.name ?? null,
      type: item.media_type,
      poster_path: item.poster_path,
    })),
    page,
    total_pages: searchResult.total_pages,
  };

  await redisClient.json.set(path, "$", filteredSearchResult);
  await redisClient.expire(path, 10 * 60); // 10 mins
  return filteredSearchResult;
}

function transformSeasons(show: TMDBShow): Season[] {
  const getSeasonId = (key: string): number => {
    const seasonNumber = parseInt(key.replace("season/", ""), 10);
    const hasSpecials =
      show.seasons.length > 0 && show.seasons[0]?.name === "Specials";
    const index = seasonNumber - 1 + (hasSpecials ? 1 : 0);
    if (show.seasons[index] == null) {
      throw new Error("Invalid season index");
    }
    return show.seasons[index].id;
  };

  const seasons = Object.keys(show)
    .filter((key) => key.startsWith("season/"))
    .map((key) => {
      const season = show[key as keyof typeof show] as TMDBSeason;
      return {
        id: getSeasonId(key),
        name: season.name,
        overview: season.overview,
        air_date: season.air_date,
        episodes: (season.episodes ?? []).map((episode: TMDBEpisode) => ({
          id: episode.id,
          name: episode.name,
        })),
      };
    });

  return seasons;
}

export async function getMedia(
  id: number,
  type: "movie" | "tv"
): Promise<Movie | Show> {
  const path = `/${type}/${id}`;

  const cachedMedia = await redisClient.json.get(path);
  if (cachedMedia != null) {
    return cachedMedia as Movie | Show;
  }

  switch (type) {
    case "movie": {
      const movie = (await tmdbFetch(path)) as TMDBMovie;
      const filteredMovie: Movie = {
        id: movie.id,
        name: movie.title ?? null,
        type,
        poster_path: movie.poster_path,
        genres: movie.genres,
        origin_country: movie.origin_country,
        original_language: movie.original_language,
        overview: movie.overview,
        popularity: movie.popularity,
        release_date: movie.release_date,
        status: movie.status,
        vote_average: movie.vote_average,
        budget: movie.budget,
        revenue: movie.revenue,
        runtime: movie.runtime,
      };

      await redisClient.json.set(path, "$", filteredMovie);
      return filteredMovie;
    }
    case "tv": {
      const fetchShow = async (seasonStart: number): Promise<TMDBShow> => {
        const seasonRange = Array.from(
          { length: 20 },
          (_, i) => `season/${seasonStart + i}`
        ).join(",");
        return (await tmdbFetch(
          `${path}?append_to_response=${seasonRange}`
        )) as TMDBShow;
      };

      const show = await fetchShow(1);
      const seasonCount = show.number_of_seasons;
      if (seasonCount == null || seasonCount > 100) {
        throw new AppError(
          status.INTERNAL_SERVER_ERROR,
          "Unknown number of seasons or too many seasons"
        );
      }

      const filteredShow: Show = {
        id: show.id,
        name: show.name ?? null,
        type,
        poster_path: show.poster_path,
        genres: show.genres,
        origin_country: show.origin_country,
        original_language: show.original_language,
        overview: show.overview,
        popularity: show.popularity,
        release_date: show.first_air_date,
        status: show.status,
        vote_average: show.vote_average,
        in_production: show.in_production,
        seasons: transformSeasons(show),
      };

      if (seasonCount > 20) {
        const fetchRemainingSeasons = async (
          seasonStart: number
        ): Promise<void> => {
          const seasons = await fetchShow(seasonStart);
          filteredShow.seasons.push(...transformSeasons(seasons));
          if (seasonStart + 20 < seasonCount) {
            await fetchRemainingSeasons(seasonStart + 20);
          }
        };
        await fetchRemainingSeasons(21);
      }

      await redisClient.json.set(path, "$", filteredShow);
      return filteredShow;
    }
  }
}
