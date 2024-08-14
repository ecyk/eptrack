import { useMutation } from "@tanstack/react-query";
import { produce } from "immer";
import ISO6391 from "iso-639-1";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { updateDetail } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";
import Dropdown from "./Dropdown";
import { DropdownProps } from "./Dropdown";
import styles from "./Modal.module.css";

interface MediaModalProps {
  media: MovieResponse | ShowResponse;
  tags: Tag[];
  hasCancel: boolean;
  onClose: (positive?: boolean) => void;
}

function MediaModal({ media, tags, hasCancel, onClose }: MediaModalProps) {
  const { modalIsOpen, handleClose } = useModal();

  const handleClickOverlay = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleClose(event, onClose);
    }
  };

  const data = useMutation({
    mutationFn: (request: SaveMediaRequest) =>
      toast.promise(updateDetail(request), {
        loading: "Saving details...",
        success: <b>Details saved!</b>,
        error: <b>Could not save details.</b>,
      }),
    onSuccess: () => handleClose(undefined, onClose, true),
    onError: () => setSaving(false),
  });

  const { isAuthenticated } = useAuth();

  const initDropdowns = useCallback((): DropdownProps[] => {
    const initialDropdowns: DropdownProps[] = [];

    if (isAuthenticated && tags.length !== 0) {
      initialDropdowns.push({
        text: "Tags",
        items: tags.map((tag) => ({
          id: tag.tagId,
          text: tag.name,
          checked: (media as MediaDetail).tags?.includes(tag.tagId) ?? false,
          active: true,
          updated: false,
        })),
        inline: true,
      });
    }

    if (media.type === "tv") {
      (media as ShowResponse).seasons.forEach((season) => {
        initialDropdowns.push({
          text: season.name ?? "",
          items: season.episodes.map((episode, episodeIndex) => ({
            id: episode.id,
            text: `${episodeIndex + 1}. ${episode.name}`,
            checked:
              (media as ShowResponse).watchedEpisodes?.includes(episode.id) ??
              false,
            active: isAuthenticated,
            updated: false,
          })),
          inline: true,
        });
      });
    }

    return initialDropdowns;
  }, [isAuthenticated, media, tags]);

  const [dropdowns, setDropdowns] = useState<DropdownProps[]>(initDropdowns());

  useEffect(() => {
    setDropdowns(initDropdowns());
  }, [media, initDropdowns]);

  const handleDropdownChange = (dropdownIndex: number, itemIndex: number) => {
    setDropdowns((prev) =>
      produce(prev, (draft) => {
        const item = draft[dropdownIndex].items[itemIndex];
        item.checked = !item.checked;
        item.updated = !item.updated;
      })
    );
  };

  const [saving, setSaving] = useState(false);

  const onSave = () => {
    const getUpdatedItems = (
      dropdowns: DropdownProps[],
      tags: boolean
    ): SaveData => {
      return dropdowns
        .filter((dropdown) =>
          tags ? dropdown.text === "Tags" : dropdown.text !== "Tags"
        )
        .flatMap((dropdown) => dropdown.items.filter((item) => item.updated))
        .map((item) => [item.id, item.checked]);
    };

    const updatedTags = getUpdatedItems(dropdowns, true);
    const updatedWatchedEpisodes = getUpdatedItems(dropdowns, false);

    if (!updatedTags.length && !updatedWatchedEpisodes.length) {
      toast.error("Nothing is changed");
      return;
    }

    setSaving(true);
    data.mutate({
      mediaId: media.id,
      type: media.type,
      tags: updatedTags,
      watchedEpisodes: updatedWatchedEpisodes,
    });
  };

  return (
    <dialog onClick={handleClickOverlay} open={modalIsOpen}>
      <article className={styles.modal}>
        <header>
          <button
            aria-label="Close"
            rel="prev"
            onClick={(event) => handleClose(event, onClose)}
          ></button>
          <h1>{media.name}</h1>
        </header>
        <div>
          <p>{media.overview}</p>
          <p>
            <b>Type: </b>
            {media.type === "movie" ? "Movie" : "TV Show"}
          </p>
          <p>
            <b>Original Language: </b>
            {media.original_language &&
              ISO6391.getName(media.original_language)}
          </p>
          <p>
            <b>Release Date: </b>
            {media.release_date}
          </p>
          <p>
            <b>Genre: </b>
            {media.genres.map(({ name }) => name).join(", ")}
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
              onClick={(event) => handleClose(event, onClose)}
            >
              Cancel
            </button>
          )}
          <button
            aria-busy={saving}
            disabled={saving || !isAuthenticated}
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
