import { useState } from "react";
import toast from "react-hot-toast";

import { useStorageService } from "../contexts/StorageServiceContext";
import { useModal } from "../contexts/ModalContext";
import styles from "./Modal.module.css";

interface TagModalProps {
  hasCancel: boolean;
}

function TagModal({ hasCancel }: TagModalProps) {
  const { modalIsOpen, handleClose } = useModal();

  const handleClickOverlay = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose(e);
    }
  };

  const { userData, updateTags } = useStorageService();
  const [tagName, setTagName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTagAction = (op: "add" | "remove", e: React.MouseEvent) => {
    setIsLoading(true);
    toast
      .promise(updateTags({ id: tagName, op }), {
        loading: op === "add" ? "Creating tag" : "Deleting tag",
        error: <b>Could not {op === "add" ? "create" : "delete"} tag</b>,
      })
      .then(() => handleClose(e))
      .finally(() => setIsLoading(false));
  };

  return (
    <dialog onClick={handleClickOverlay} open={modalIsOpen}>
      <article className={styles.modal}>
        <header>
          <button
            aria-label="Close"
            rel="prev"
            onClick={(e) => handleClose(e)}
          ></button>
          <h1>Manage Tags</h1>
        </header>
        <label htmlFor="tagName">Tag Name</label>
        <input
          id="tagName"
          type="text"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
          required
        />
        <button
          type="button"
          disabled={isLoading || !userData}
          onClick={(e) => handleTagAction("add", e)}
        >
          {"Create Tag"}
        </button>
        <button
          type="button"
          className="secondary"
          style={{ marginLeft: "0.25em" }}
          disabled={isLoading || !userData}
          onClick={(e) => handleTagAction("remove", e)}
        >
          {"Delete Tag"}
        </button>
        <footer>
          {hasCancel && (
            <button
              disabled={isLoading}
              className="secondary"
              onClick={(e) => handleClose(e)}
            >
              Cancel
            </button>
          )}
        </footer>
      </article>
    </dialog>
  );
}

export default TagModal;
