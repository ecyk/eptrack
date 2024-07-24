import { PropsWithChildren } from "react";

import useModal from "../contexts/useModal";
import styles from "./Modal.module.css";

interface ModalProps {
  title: string;
  hasCancel?: boolean;
  onOK?: () => void;
}

function Modal({
  title,
  hasCancel,
  onOK,
  children,
}: PropsWithChildren<ModalProps>) {
  const { modalIsOpen, handleClose } = useModal();

  const handleClickOverlay = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleClose(event);
    }
  };

  return (
    <dialog onClick={handleClickOverlay} open={modalIsOpen}>
      <article className={styles.modal}>
        <header>
          <button aria-label="Close" rel="prev" onClick={handleClose}></button>
          <h1>{title}</h1>
        </header>
        {children}
        <footer>
          {hasCancel && (
            <button className="secondary" onClick={handleClose}>
              Cancel
            </button>
          )}
          <button
            onClick={(e) => {
              onOK && onOK();
              handleClose(e);
            }}
          >
            OK
          </button>
        </footer>
      </article>
    </dialog>
  );
}

export default Modal;
