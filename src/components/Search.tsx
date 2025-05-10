// import { produce } from "immer";
// import { useCallback, useEffect, useState } from "react";

import { useStorageService } from "../contexts/StorageServiceContext";
import { useModal } from "../contexts/ModalContext";
// import Dropdown, { DropdownItem } from "./Dropdown";
import styles from "./Search.module.css";
import { produce } from "immer";
import { useCallback, useState, useEffect } from "react";
import Dropdown, { DropdownItem } from "./Dropdown";

interface SearchProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearchTagChange: (tags: string[]) => void;
}

function Search({
  searchQuery,
  onSearchQueryChange,
  onSearchTagChange,
}: SearchProps) {
  const { handleOpen } = useModal();
  const { userData } = useStorageService();

  const initItems = useCallback(() => {
    return Object.keys(userData?.tags || {}).map((tag) => ({
      text: tag,
      checked: false,
      active: true,
      updated: false,
    }));
  }, [userData?.tags]);

  const [tagDropdownItems, setTagDropdownItems] =
    useState<DropdownItem[]>(initItems());

  useEffect(() => {
    const newItems = initItems();

    setTagDropdownItems((prevItems) => {
      const checkedTags = new Set(
        prevItems.filter((item) => item.checked).map((item) => item.text),
      );

      return newItems.map((item) => ({
        ...item,
        checked: checkedTags.has(item.text),
      }));
    });
  }, [initItems]);

  useEffect(() => {
    const checkedTags = tagDropdownItems
      .filter((item) => item.checked)
      .map((item) => item.text);
    onSearchTagChange(checkedTags);
  }, [onSearchTagChange, tagDropdownItems]);

  const handleDropdownChange = (itemIndex: number) => {
    setTagDropdownItems((prev) =>
      produce(prev, (draft) => {
        const item = draft[itemIndex];
        item.checked = !item.checked;
        item.updated = !item.updated;
      }),
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

      {userData && tagDropdownItems.length !== 0 && (
        <Dropdown
          text="Tag"
          items={tagDropdownItems}
          onChange={(itemIndex) => handleDropdownChange(itemIndex)}
        />
      )}

      {!!userData && (
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
