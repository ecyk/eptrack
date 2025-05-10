import { produce } from "immer";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";
import Dropdown, { DropdownItem } from "./Dropdown";
import styles from "./Search.module.css";

interface SearchProps {
  tags: Tag[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearchTagChange: (tags: number[]) => void;
}

function Search({
  tags,
  searchQuery,
  onSearchQueryChange,
  onSearchTagChange,
}: SearchProps) {
  const { isAuthenticated } = useAuth();
  const { handleOpen } = useModal();

  const initItems = useCallback(() => {
    return tags.map((tag) => ({
      id: tag.tagId,
      text: tag.name,
      checked: false,
      active: true,
      updated: false,
    }));
  }, [tags]);

  const [tagDropdownItems, setTagDropdownItems] = useState<DropdownItem[]>(
    initItems()
  );

  useEffect(() => {
    setTagDropdownItems(initItems());
  }, [initItems, tags]);

  const handleDropdownChange = (itemIndex: number) => {
    setTagDropdownItems((prev) =>
      produce(prev, (draft) => {
        const item = draft[itemIndex];
        item.checked = !item.checked;
        item.updated = !item.updated;

        const checkedTagIds = draft
          .filter((item) => item.checked)
          .map((item) => item.id);

        onSearchTagChange(checkedTagIds);
      })
    );
  };

  return (
    <div className={styles.box}>
      <input
        className={styles["search-bar"]}
        type="search"
        name="search"
        placeholder="Search"
        aria-label="Search"
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
      />

      {isAuthenticated && tagDropdownItems.length !== 0 && (
        <Dropdown
          text="Tag"
          items={tagDropdownItems}
          onChange={(itemIndex) => handleDropdownChange(itemIndex)}
        />
      )}

      {isAuthenticated && (
        <button
          type="button"
          className={styles["manage-tags-btn"]}
          onClick={() => handleOpen()}
        >
          Manage Tags
        </button>
      )}
    </div>
  );
}

export default Search;
