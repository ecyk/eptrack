import { useMutation, useQuery } from "@tanstack/react-query";
import { produce } from "immer";
import ISO6391 from "iso-639-1";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  EpisodeUpdate,
  MediaUpdate,
  TagUpdate,
  useStorageService,
} from "../contexts/StorageServiceContext";
import { useModal } from "../contexts/ModalContext";
import Dropdown, { DropdownItem } from "./Dropdown";
import { DropdownProps } from "./Dropdown";
import styles from "./Modal.module.css";
import { TmdbMedia, TmdbMovie, TmdbShow } from "../types";
import { genres } from "../genres";
import { fetchMedia } from "../api";

interface MediaModalProps {
  media: TmdbMedia;
  hasCancel: boolean;
  onClose: (positive?: boolean) => void;
}

function MediaModal({ media, hasCancel, onClose }: MediaModalProps) {
  const { modalIsOpen, handleClose } = useModal();

  const handleClickOverlay = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose(e, onClose);
    }
  };

  const { userData, updateMedia } = useStorageService();

  const data = useMutation({
    mutationFn: (update: MediaUpdate) =>
      toast.promise(updateMedia(update), {
        loading: "Saving details",
        error: <b>Could not save details</b>,
      }),
    onSuccess: () => handleClose(undefined, onClose, true),
    onError: () => setSaving(false),
  });

  const showDetails = useQuery<TmdbShow, Error>({
    queryKey: ["showDetails", media],
    queryFn: () => fetchMedia(media.id, "tv") as Promise<TmdbShow>,
    enabled: media.media_type == "tv",
    staleTime: Infinity,
  });

  const [dropdowns, setDropdowns] = useState<DropdownProps[]>([]);

  useEffect(() => {
    const dropdowns: DropdownProps[] = [];
    if (userData) {
      const isChecked = (tag: string) => {
        if (media.media_type == "movie" && userData.movies[media.id]) {
          return !!userData.movies[media.id].tags?.includes(tag);
        }
        return !!(
          userData.shows[media.id] &&
          userData.shows[media.id].tags?.includes(tag)
        );
      };
      dropdowns.push({
        text: "Tags",
        items: Object.keys(userData.tags).map((tag) => ({
          text: tag,
          checked: isChecked(tag),
          active: true,
          updated: false,
        })),
        inline: true,
      });
    }
    if (showDetails.data && media.media_type === "tv") {
      (showDetails.data as TmdbShow).seasons.forEach((season) => {
        dropdowns.push({
          text: season.name ?? "",
          items:
            season.episodes?.map((episode, episodeIndex) => ({
              text: `${episodeIndex + 1}. ${episode.name}`,
              checked:
                !!userData?.shows?.[media.id.toString()]?.seasons?.[
                  season.id
                ]?.[episode.id],
              active: !!userData,
              updated: false,
              seasonId: season.id,
              episodeId: episode.id,
            })) || [],
          inline: true,
        });
      });
    }
    setDropdowns(dropdowns);
  }, [userData, showDetails.data, media.media_type, media.id]);

  const handleDropdownChange = (dropdownIndex: number, itemIndex: number) => {
    setDropdowns((prev) =>
      produce(prev, (draft) => {
        const item = draft[dropdownIndex].items[itemIndex];
        item.checked = !item.checked;
        item.updated = !item.updated;
      }),
    );
  };

  interface SeasonDropdownItem extends DropdownItem {
    episodeId: string;
    seasonId: string;
  }

  const [saving, setSaving] = useState(false);

  const onSave = () => {
    const getUpdatedItems = (
      dropdowns: DropdownProps[],
      tags: boolean,
    ): DropdownItem[] => {
      return dropdowns
        .filter((dropdown) =>
          tags ? dropdown.text === "Tags" : dropdown.text !== "Tags",
        )
        .flatMap((dropdown) => dropdown.items.filter((item) => item.updated));
    };
    const updatedTags: TagUpdate[] = getUpdatedItems(dropdowns, true).map(
      (item) => {
        return { id: item.text, op: item.checked ? "add" : "remove" };
      },
    );
    const updatedWatchedEpisodes: EpisodeUpdate[] = getUpdatedItems(
      dropdowns,
      false,
    ).map((item) => {
      return {
        id: (item as SeasonDropdownItem).episodeId,
        seasonId: (item as SeasonDropdownItem).seasonId,
        op: item.checked ? "add" : "remove",
      };
    });
    if (!updatedTags.length && !updatedWatchedEpisodes.length) {
      toast.error("Nothing has changed");
      return;
    }
    setSaving(true);
    data.mutate({
      id: media.id.toString(),
      type: media.media_type,
      tags: updatedTags,
      episodes: updatedWatchedEpisodes,
    });
  };

  return (
    <dialog onClick={handleClickOverlay} open={modalIsOpen}>
      <article className={styles.modal}>
        <header>
          <button
            aria-label="Close"
            rel="prev"
            onClick={(e) => handleClose(e, onClose)}
          ></button>
          <h1>{media.title ?? media.name}</h1>
        </header>
        <div>
          <p>{media.overview}</p>
          <p>
            <b>Type: </b>
            {media.media_type === "movie" ? "Movie" : "TV Show"}
          </p>
          <p>
            <b>Original Language: </b>
            {media.original_language &&
              ISO6391.getName(media.original_language)}
          </p>
          <p>
            <b>Release Date: </b>
            {media.media_type === "movie"
              ? (media as TmdbMovie).release_date
              : (media as TmdbShow).first_air_date}
          </p>
          <p>
            <b>Genre: </b>
            {media.genres && media.genres.length > 0
              ? media.genres.map((genre) => genre.name).join(", ")
              : media.genre_ids && media.genre_ids.length > 0
                ? media.genre_ids
                    .map((id) => genres[id.toString()] ?? "Unknown")
                    .join(", ")
                : "Unknown"}
          </p>
          {dropdowns.map(({ text, items, initialOpen, inline }, index) => (
            <Dropdown
              key={index}
              text={text}
              items={items}
              initialOpen={initialOpen}
              inline={inline}
              onChange={(itemIndex) => handleDropdownChange(index, itemIndex)}
            />
          ))}
        </div>
        <footer>
          {hasCancel && (
            <button
              disabled={saving}
              className="secondary"
              onClick={handleClickOverlay}
            >
              Cancel
            </button>
          )}
          <button
            aria-busy={saving}
            disabled={saving || !userData}
            onClick={onSave}
          >
            {!saving && "Save"}
          </button>
        </footer>
      </article>
    </dialog>
  );
}

export default MediaModal;
