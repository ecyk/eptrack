import { produce } from "immer";
import { useState } from "react";

import Dropdown from "./Dropdown";
import { DropdownItem, DropdownProps } from "./Dropdown";
import Modal from "./Modal";

interface MediaModalProps {
  tags: DropdownItem[];
  media: MediaDetail;
  onSave?: (dropdowns: DropdownProps[]) => void;
  onClose?: () => void;
}

function MediaModal({ tags, media, onSave, onClose }: MediaModalProps) {
  const initializeDropdowns = (): DropdownProps[] => {
    const initialDropdowns: DropdownProps[] = [
      {
        text: "Tags",
        items: [...tags],
        initialOpen: true,
        inline: true,
      },
    ];

    if (media.type === "tv") {
      (media as ShowDetail).seasons.forEach((season, seasonIndex) => {
        initialDropdowns.push({
          text: season.name,
          items: season.episodes.map((episode, episodeIndex) => ({
            text: `${episodeIndex + 1}. ${episode.name}`,
            name: `s${seasonIndex + 1}e${episodeIndex + 1}`,
            checked: false,
          })),
          inline: true,
        });
      });
    }

    return initialDropdowns;
  };

  const [dropdowns, setDropdowns] = useState<DropdownProps[]>(
    initializeDropdowns()
  );

  const handleDropdownChange = (dropdownIndex: number, itemIndex: number) => {
    setDropdowns((prev) =>
      produce(prev, (draft) => {
        const item = draft[dropdownIndex].items[itemIndex];
        item.checked = !item.checked;
      })
    );
  };

  return (
    <Modal
      title={media.name}
      onSave={() => onSave && onSave(dropdowns)}
      onClose={onClose}
    >
      <div>
        <p>{media.overview}</p>
        <p>
          <b>Type: </b>
          {media.type}
        </p>
        <p>
          <b>Original Language: </b>
          {media.original_language}
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
    </Modal>
  );
}

export default MediaModal;
