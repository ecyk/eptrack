import { PropsWithChildren, useEffect, useState } from "react";
import useLocalStorageState from "use-local-storage-state";
import usePrefersColorScheme from "use-prefers-color-scheme";

import ThemeContext from "./ThemeContext";

function ThemeProvider({ children }: PropsWithChildren) {
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

export default ThemeProvider;
