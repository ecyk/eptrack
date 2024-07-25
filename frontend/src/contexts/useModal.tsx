import { useContext } from "react";

import ModalContext, { ModalContextProps } from "./ModalContext";

function useModal(): ModalContextProps {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

export default useModal;
