import { produce } from "immer";
import { useState } from "react";

import Dropdown from "./Dropdown";
import { DropdownItem, DropdownProps } from "./Dropdown";
import Modal from "./Modal";

const genres: Record<string, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

interface MediaModalProps {
  tags: DropdownItem[];
  media: MediaDetail;
  onSave?: (dropdowns: DropdownProps[]) => void;
  onClose?: () => void;
}

function MediaModal({ tags, media, onSave, onClose }: MediaModalProps) {
  const [dropdowns, setDropdowns] = useState<DropdownProps[]>([
    {
      text: "Tags",
      items: [...tags],
      initialOpen: true,
    },
  ]);

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
      title={media.title}
      onSave={() => onSave && onSave(dropdowns)}
      onClose={onClose}
    >
      <div>
        <p>{media.overview}</p>
        <p>
          <b>Type: </b>
          {media.media_type}
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
          {media.genre_ids
            .map((id) => {
              return genres[id] ?? "Unknown";
            })
            .join(", ")}
        </p>
        {dropdowns.map(({ text, items, initialOpen }, index) => (
          <Dropdown
            key={index}
            text={text}
            items={items}
            initialOpen={initialOpen ?? false}
            inline={text === "Tags"}
            onChange={(itemIndex) => handleDropdownChange(index, itemIndex)}
          />
        ))}
      </div>
    </Modal>
  );
}

export default MediaModal;
