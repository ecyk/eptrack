import { createContext } from "react";

export interface ThemeContextProps {
  theme: string;
  switchTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export default ThemeContext;
