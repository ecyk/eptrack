import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";

import ModalContext from "./ModalContext";
import getScrollBarWidth from "./utils/getScrollBarWidth";

function ModalProvider({ children }: PropsWithChildren) {
  const isSSR = typeof window === "undefined";
  const htmlTag = !isSSR && document.querySelector("html");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const modalAnimationDuration = 400;

  const handleOpen = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (htmlTag instanceof HTMLElement) {
      setModalIsOpen(true);
      htmlTag.classList.add("modal-is-open", "modal-is-opening");
      setTimeout(() => {
        htmlTag.classList.remove("modal-is-opening");
      }, modalAnimationDuration);
    }
  };

  const handleClose = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      if (htmlTag instanceof HTMLElement) {
        htmlTag.classList.add("modal-is-closing");
        setTimeout(() => {
          setModalIsOpen(false);
          htmlTag.classList.remove("modal-is-open", "modal-is-closing");
        }, modalAnimationDuration);
      }
    },
    [htmlTag, setModalIsOpen, modalAnimationDuration]
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (!modalIsOpen) return;
      if (e.key === "Escape") {
        handleClose(e as unknown as React.MouseEvent);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [handleClose, modalIsOpen]);

  useEffect(() => {
    if (htmlTag instanceof HTMLElement) {
      const scrollBarWidth = getScrollBarWidth();
      htmlTag.style.setProperty(
        "--pico-scrollbar-width",
        `${scrollBarWidth}px`
      );
      return () => {
        htmlTag.style.removeProperty("--pico-scrollbar-width");
      };
    }
  }, [htmlTag]);

  return (
    <ModalContext.Provider
      value={{
        modalIsOpen,
        handleOpen,
        handleClose,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export default ModalProvider;
