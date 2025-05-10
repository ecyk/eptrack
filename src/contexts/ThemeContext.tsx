import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import useLocalStorageState from "use-local-storage-state";
import usePrefersColorScheme from "use-prefers-color-scheme";

export interface ThemeContextProps {
  theme: string;
  switchTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(
  undefined
);

export function useTheme(): ThemeContextProps {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const isSSR = typeof window === "undefined";
  const htmlTag = !isSSR && document.querySelector("html");
  const systemPrefersColorScheme = usePrefersColorScheme();
  const defaultTheme = systemPrefersColorScheme || "dark";
  const [selectedTheme, setSelectedTheme] = useLocalStorageState(
    "picoColorScheme",
    undefined
  );
  const [theme, setTheme] = useState("dark");

  const switchTheme = () => {
    setSelectedTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    if (htmlTag) {
      const setDataThemeAttribute = (theme: string) => {
        if (htmlTag) {
          htmlTag.setAttribute("data-theme", theme);
        }
      };

      if (selectedTheme) {
        setDataThemeAttribute(selectedTheme as string);
        setTheme(selectedTheme as string);
      } else {
        setDataThemeAttribute(defaultTheme);
        setTheme(defaultTheme);
      }
    }
  }, [htmlTag, defaultTheme, selectedTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        switchTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
