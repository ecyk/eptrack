import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import { fetchOrCreateUserData, saveUserData } from "../api";
import { type UserData } from "../validates";

export interface TagUpdate {
  id: string;
  op: "add" | "remove";
}

export interface EpisodeUpdate {
  id: string;
  seasonId: string;
  op: "add" | "remove";
}

export interface MediaUpdate {
  id: string;
  type: "movie" | "tv" | "person";
  tags: TagUpdate[];
  episodes: EpisodeUpdate[];
}

export interface StorageServiceContextProps {
  userData: UserData | null;
  signIn: () => void;
  signOut: () => void;
  updateMedia: (update: MediaUpdate) => Promise<void>;
  updateTags: (update: TagUpdate) => Promise<void>;
}

export const StorageServiceContext = createContext<
  StorageServiceContextProps | undefined
>(undefined);

export function useStorageService(): StorageServiceContextProps {
  const context = useContext(StorageServiceContext);
  if (!context) {
    throw new Error("useService must be used within a ServiceProvider");
  }
  return context;
}

export function StorageServiceProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [tokenTimeout, setTokenTimeout] = useState<number | null>(null);

  const signOut = useCallback(() => {
    googleLogout();
    if (tokenTimeout) clearTimeout(tokenTimeout);
    setTokenTimeout(null);
    setAccessToken(null);
    setUserData(null);
    setFileId(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("accessTokenExpiration");
  }, [tokenTimeout]);

  const restoreSession = useCallback(
    async (token: string, expiration: number) => {
      if (!token || expiration <= Date.now()) {
        signOut();
        return;
      }
      setAccessToken(token);
      const timeout = expiration - Date.now();
      const timeoutId = window.setTimeout(() => {
        signOut();
        toast("Session expired");
      }, timeout);
      setTokenTimeout(timeoutId);
      try {
        const { data, fileId } = await fetchOrCreateUserData(token);
        setUserData(data);
        setFileId(fileId || null);
      } catch (err: unknown) {
        toast.error((err as Error).message);
        signOut();
      }
    },
    [signOut],
  );

  const signIn = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/drive.file",
    onSuccess: async (tokenResponse) => {
      if (
        !tokenResponse.scope
          .split(" ")
          .includes("https://www.googleapis.com/auth/drive.file")
      ) {
        toast.success("Missing required permissions");
        return;
      }
      const expiration = Date.now() + tokenResponse.expires_in * 1000;
      localStorage.setItem("accessToken", tokenResponse.access_token);
      localStorage.setItem("accessTokenExpiration", expiration.toString());
      await restoreSession(tokenResponse.access_token, expiration);
    },
    onError: () => toast.error("Failed to sign in"),
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const expiration = Number(localStorage.getItem("accessTokenExpiration"));
    if (token && expiration > Date.now()) {
      if (token !== accessToken) {
        restoreSession(token, expiration);
      }
    } else {
      signOut();
    }
  }, [accessToken, restoreSession, signOut]);

  const updateTags = async (update: TagUpdate) => {
    if (!userData || !accessToken) return;
    const updatedUserData = structuredClone(userData);
    if (update.op === "add") {
      if (updatedUserData.tags[update.id]) {
        throw new Error("Tag already exists");
      }
      updatedUserData.tags[update.id] = [];
    } else if (update.op === "remove") {
      if (!updatedUserData.tags[update.id]) {
        throw new Error("Tag does not exist");
      }
      delete updatedUserData.tags[update.id];
      for (const movie of Object.values(updatedUserData.movies)) {
        if (movie.tags) {
          movie.tags = movie.tags.filter((tag) => tag !== update.id);
          if (movie.tags.length === 0) delete movie.tags;
        }
      }
      for (const show of Object.values(updatedUserData.shows)) {
        if (show.tags) {
          show.tags = show.tags.filter((tag) => tag !== update.id);
          if (show.tags.length === 0) delete show.tags;
        }
      }
    }
    await saveUserData(accessToken, updatedUserData, fileId || undefined);
    setUserData(updatedUserData);
  };

  const updateMedia = async (update: MediaUpdate) => {
    if (!userData || !accessToken) return;
    const updatedUserData = structuredClone(userData);
    if (update.type === "movie") {
      if (!updatedUserData.movies[update.id]) {
        updatedUserData.movies[update.id] = {};
      }
      const movie = updatedUserData.movies[update.id];
      if (!movie.tags) {
        movie.tags = [];
      }
      update.tags.forEach(({ id, op }) => {
        if (op === "add" && !movie.tags!.includes(id)) {
          movie.tags!.push(id);
          updatedUserData.tags[id] = [
            ...new Set([...(updatedUserData.tags[id] || []), update.id]),
          ];
        } else if (op === "remove") {
          movie.tags = movie.tags!.filter((tag) => tag !== id);
          updatedUserData.tags[id] = (updatedUserData.tags[id] || []).filter(
            (mediaId) => mediaId !== update.id,
          );
        }
      });
      if (movie.tags.length === 0) {
        delete updatedUserData.movies[update.id];
      }
    } else if (update.type === "tv") {
      if (!updatedUserData.shows[update.id]) {
        updatedUserData.shows[update.id] = { seasons: {} };
      }
      const show = updatedUserData.shows[update.id];
      if (!show.tags) {
        show.tags = [];
      }
      update.tags.forEach(({ id, op }) => {
        if (op === "add" && !show.tags!.includes(id)) {
          show.tags!.push(id);
          updatedUserData.tags[id] = [
            ...new Set([...(updatedUserData.tags[id] || []), update.id]),
          ];
        } else if (op === "remove") {
          show.tags = show.tags!.filter((tag) => tag !== id);
          updatedUserData.tags[id] = (updatedUserData.tags[id] || []).filter(
            (mediaId) => mediaId !== update.id,
          );
        }
      });
      update.episodes.forEach(({ id, seasonId, op }) => {
        if (!show.seasons) {
          show.seasons = {};
        }
        if (!show.seasons[seasonId]) {
          show.seasons[seasonId] = [];
        }
        const episodeList = show.seasons[seasonId]!;
        if (op === "add" && !episodeList.includes(id)) {
          episodeList.push(id);
        } else if (op === "remove") {
          const index = episodeList.indexOf(id);
          if (index !== -1) {
            episodeList.splice(index, 1);
          }
          if (episodeList.length === 0) {
            delete show.seasons[seasonId];
          }
        }
      });
      const hasTags = show.tags.length > 0;
      const hasEpisodes = show.seasons && Object.keys(show.seasons).length > 0;
      if (!hasTags && !hasEpisodes) {
        delete updatedUserData.shows[update.id];
      }
    }
    await saveUserData(accessToken, updatedUserData, fileId || undefined);
    setUserData(updatedUserData);
  };

  return (
    <StorageServiceContext.Provider
      value={{
        userData,
        signIn,
        signOut,
        updateMedia,
        updateTags,
      }}
    >
      {children}
    </StorageServiceContext.Provider>
  );
}
