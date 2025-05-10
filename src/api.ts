import {
  TmdbMovie,
  TmdbSearch,
  TmdbSeason,
  TmdbShow,
  TmdbTrending,
} from "./types";
import { userDataSchema, type UserData } from "./validates";

export const fetchUserStorage = async (
  accessToken: string,
  url: string,
  method?: string,
  body?: BodyInit | null,
): Promise<unknown> => {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error("Faild to fech user data");
  }
  return data;
};

export const fetchOrCreateUserData = async (
  accessToken: string,
): Promise<{ data: UserData; fileId?: string }> => {
  const fileList = (await fetchUserStorage(
    accessToken,
    `https://www.googleapis.com/drive/v3/files?q=name='${
      import.meta.env.VITE_DATA_FILE_NAME
    }'&fields=files(id,name,size)`,
  )) as {
    files: {
      id: string;
      name: string;
      size: string;
    }[];
  };
  if (!fileList.files.length) {
    return await saveUserData(accessToken, {
      tags: {
        Favorites: [],
        Watching: [],
        Completed: [],
      },
      movies: {},
      shows: {},
    });
  }
  if (parseInt(fileList.files[0].size) > 5 * 1024 * 1024) {
    throw new Error("Failed to fetch, user data is too big");
  }
  const data = await fetchUserStorage(
    accessToken,
    `https://www.googleapis.com/drive/v3/files/${fileList.files[0].id}?alt=media`,
  );
  const res = userDataSchema.safeParse(data);
  if (!res.success) {
    throw new Error("Could not load, data is corrupted");
  }
  return {
    data: res.data,
    fileId: fileList.files[0].id,
  };
};

export const saveUserData = async (
  accessToken: string,
  data: UserData,
  fileId?: string,
): Promise<{ data: UserData; fileId: string }> => {
  const formData = new FormData();
  formData.append(
    "metadata",
    new Blob(
      [
        JSON.stringify({
          name: import.meta.env.VITE_DATA_FILE_NAME,
          mimeType: "application/json",
        }),
      ],
      { type: "application/json" },
    ),
  );
  formData.append(
    "file",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );
  const res = (await fetchUserStorage(
    accessToken,
    fileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
      : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`,
    fileId ? "PATCH" : "POST",
    formData,
  )) as {
    id: string;
  };
  return { data, fileId: res.id };
};

async function fetchTmdb(path: string): Promise<unknown> {
  const response = await fetch("https://api.themoviedb.org/3" + path, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
    },
  });
  if (!response.ok) {
    throw new Error("Faild to fech tmdb");
  }
  return await response.json();
}

export const fetchItems = async (page: number, searchQuery: string) => {
  if (searchQuery !== "") {
    const search = (await fetchTmdb(
      `/search/multi?query=${searchQuery}&page=${page}`,
    )) as TmdbSearch;
    if (search.results.length && page < search.total_pages) {
      page = page + 1;
    }
    return { ...search, nextCursor: page };
  }

  const trending = (await fetchTmdb(
    `/trending/all/week?page=${page}`,
  )) as TmdbTrending;
  if (trending.results.length && page < trending.total_pages) {
    page = page + 1;
  }
  return { ...trending, nextCursor: page };
};

function transformSeasons(show: TmdbShow): TmdbSeason[] {
  const getSeasonId = (key: string): number => {
    const seasonNumber = parseInt(key.replace("season/", ""), 10);
    const hasSpecials =
      show.seasons.length > 0 && show.seasons[0]?.name === "Specials";
    const index = seasonNumber - 1 + (hasSpecials ? 1 : 0);
    return show.seasons[index]?.id ?? 0;
  };
  const seasons = Object.keys(show)
    .filter((key) => key.startsWith("season/"))
    .map((key) => {
      const season = show[key as keyof typeof show] as TmdbSeason;
      season.id = getSeasonId(key);
      return season;
    });
  return seasons;
}

export async function fetchMedia(
  id: number,
  type: "movie" | "tv" | "person",
): Promise<TmdbMovie | TmdbShow> {
  const path = `/${type}/${id}`;
  switch (type) {
    case "movie": {
      return (await fetchTmdb(path)) as TmdbMovie;
    }
    case "tv": {
      const fetchShow = async (seasonStart: number): Promise<TmdbShow> => {
        const seasonRange = Array.from(
          { length: 20 },
          (_, i) => `season/${seasonStart + i}`,
        ).join(",");
        return (await fetchTmdb(
          `${path}?append_to_response=${seasonRange}`,
        )) as TmdbShow;
      };
      const show = await fetchShow(1);
      const seasonCount = show.number_of_seasons;
      if (seasonCount == null) {
        throw new Error("Unknown number of seasons");
      }
      show.seasons = transformSeasons(show);
      if (seasonCount > 20) {
        const fetchRemainingSeasons = async (
          seasonStart: number,
        ): Promise<void> => {
          const seasons = await fetchShow(seasonStart);
          show.seasons.push(...transformSeasons(seasons));
          if (seasonStart + 20 < seasonCount) {
            await fetchRemainingSeasons(seasonStart + 20);
          }
        };
        await fetchRemainingSeasons(21);
      }
      return show;
    }
    default:
      throw new Error("Unkown media type");
  }
}
