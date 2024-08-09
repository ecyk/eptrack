import { useMutation } from "@tanstack/react-query";
import { produce } from "immer";
import ISO6391 from "iso-639-1";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { updateDetail } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";
import Dropdown from "./Dropdown";
import { DropdownItem, DropdownProps } from "./Dropdown";
import styles from "./Modal.module.css";

interface MediaModalProps {
  tags: DropdownItem[];
  media: MovieResponse | ShowResponse;
  hasCancel: boolean;
  onClose: (positive?: boolean) => void;
}

function MediaModal({ tags, media, hasCancel, onClose }: MediaModalProps) {
  const { modalIsOpen, handleClose } = useModal();

  const handleClickOverlay = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleClose(event, onClose);
    }
  };

  const data = useMutation({
    mutationFn: (request: SaveShowRequest) =>
      toast.promise(updateDetail(request), {
        loading: "Saving details...",
        success: <b>Details saved!</b>,
        error: <b>Could not save details.</b>,
      }),
    onSuccess: () => handleClose(undefined, onClose, true),
    onError: () => setSaving(false),
  });

  const { isAuthenticated } = useAuth();

  const initializeDropdowns = useCallback((): DropdownProps[] => {
    const initialDropdowns: DropdownProps[] = [
      {
        text: "Tags",
        items: [...tags],
        initialOpen: true,
        inline: true,
      },
    ];

    if (media.type === "tv") {
      (media as ShowResponse).seasons.forEach((season) => {
        initialDropdowns.push({
          text: season.name ?? "",
          items: season.episodes.map((episode, episodeIndex) => ({
            id: episode.id,
            text: `${episodeIndex + 1}. ${episode.name}`,
            checked:
              (media as ShowResponse).watched?.includes(episode.id) ?? false,
            active: isAuthenticated,
            updated: false,
          })),
          inline: true,
        });
      });
    }

    return initialDropdowns;
  }, [isAuthenticated, media, tags]);

  const [dropdowns, setDropdowns] = useState<DropdownProps[]>(
    initializeDropdowns()
  );

  useEffect(() => {
    setDropdowns(initializeDropdowns());
  }, [media, initializeDropdowns]);

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
    const updated: SaveShowData = dropdowns
      .flatMap((dropdown) => dropdown.items.filter((item) => item.updated))
      .map((item) => {
        return [item.id, item.checked];
      });

    if (!updated.length) {
      toast.error("Nothing is changed");
      return;
    }

    setSaving(true);
    data.mutate({
      mediaId: media.id,
      data: updated,
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
