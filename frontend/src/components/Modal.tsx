import { PropsWithChildren, ReactNode } from "react";

import useModal from "../contexts/useModal";
import styles from "./Modal.module.css";

interface ModalProps {
  title: string | ReactNode;
  hasCancel?: boolean;
  onSave?: () => void;
  onClose?: () => void;
}

function Modal({
  title,
  hasCancel,
  onSave,
  onClose,
  children,
}: PropsWithChildren<ModalProps>) {
  const { modalIsOpen, handleClose } = useModal();

  const handleClickOverlay = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleClose(event, onClose);
    }
  };

  return (
    <dialog onClick={handleClickOverlay} open={modalIsOpen}>
      <article className={styles.modal}>
        <header>
          <button
            aria-label="Close"
            rel="prev"
            onClick={(event) => {
              handleClose(event, onClose);
            }}
          ></button>
          <h1>{title}</h1>
        </header>
        {children}
        <footer>
          {hasCancel && (
            <button
              className="secondary"
              onClick={(event) => {
                handleClose(event, onClose);
              }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={(event) => {
              onSave && onSave();
              handleClose(event, onClose);
            }}
          >
            Save
          </button>
        </footer>
      </article>
    </dialog>
  );
}

export default Modal;
