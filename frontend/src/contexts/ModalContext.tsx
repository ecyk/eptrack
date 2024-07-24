import React, { createContext } from "react";

export interface ModalContextProps {
  modalIsOpen: boolean;
  handleOpen: (event?: React.MouseEvent) => void;
  handleClose: (event?: React.MouseEvent) => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export default ModalContext;
