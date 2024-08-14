import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

import { createTag, deleteTag } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";
import styles from "./Modal.module.css";

interface TagModalProps {
  hasCancel: boolean;
  onClose: (positive?: boolean) => void;
}

function TagModal({ hasCancel, onClose }: TagModalProps) {
  const { modalIsOpen, handleClose } = useModal();

  const handleClickOverlay = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleClose(event);
    }
  };

  const { isAuthenticated } = useAuth();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tagName, setTagName] = useState("");

  const create = useMutation({
    mutationFn: (request: tagRequest) =>
      toast.promise(createTag(request), {
        loading: "Creating tag...",
        success: <b>Tag created!</b>,
        error: <b>Could not create tag.</b>,
      }),
    onSuccess: () => handleClose(undefined, onClose, true),
    onError: () => setCreating(false),
  });

  const remove = useMutation({
    mutationFn: (request: tagRequest) =>
      toast.promise(deleteTag(request), {
        loading: "Deleting tag...",
        success: <b>Tag deleted!</b>,
        error: <b>Could not delete tag.</b>,
      }),
    onSuccess: () => handleClose(undefined, onClose, true),
    onError: () => setDeleting(false),
  });

  const handleCreate = () => {
    setCreating(true);
    create.mutate({ name: tagName });
  };

  const handleDelete = () => {
    setDeleting(true);
    remove.mutate({ name: tagName });
  };

  return (
    <dialog onClick={handleClickOverlay} open={modalIsOpen}>
      <article className={styles.modal}>
        <header>
          <button
            aria-label="Close"
            rel="prev"
            onClick={(event) => handleClose(event)}
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
          aria-busy={creating}
          disabled={creating || deleting || !isAuthenticated}
          onClick={handleCreate}
        >
          {!creating && "Create Tag"}
        </button>
        <button
          type="button"
          className="secondary"
          style={{ marginLeft: "0.25em" }}
          aria-busy={deleting}
          disabled={creating || deleting || !isAuthenticated}
          onClick={handleDelete}
        >
          {!deleting && "Delete Tag"}
        </button>
        <footer>
          {hasCancel && (
            <button
              disabled={creating || deleting}
              className="secondary"
              onClick={(event) => handleClose(event)}
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
