import useTheme from "../contexts/useTheme";
import IconMoon from "../icons/IconMoon";
import IconSun from "../icons/IconSun";

function ColorSchemeSwitcher(
  props: React.AnchorHTMLAttributes<HTMLAnchorElement>
) {
  const { theme, switchTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";
  const nextThemeLabel =
    theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";

  const handleSwitchTheme = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    switchTheme();
  };

  return (
    <a
      href={`#${nextTheme}`}
      aria-label={nextThemeLabel}
      onClick={handleSwitchTheme}
      {...props}
    >
      {theme === "dark" ? <IconSun /> : <IconMoon />}
    </a>
  );
}

export default ColorSchemeSwitcher;
