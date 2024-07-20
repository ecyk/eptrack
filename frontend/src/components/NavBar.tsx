import classNames from "classnames";

import ColorSchemeSwitcher from "./ColorSchemeSwitcher";
import styles from "./NavBar.module.css";

function NavBar() {
  return (
    <nav>
      <ul>
        <li className={styles["navbar-list-item"]}>
          <h1 className={styles["navbar-title"]}>
            <strong>WatchList</strong>
          </h1>
        </li>
      </ul>
      <ul>
        <li className={styles["navbar-list-item"]}>
          <ColorSchemeSwitcher
            className={classNames("contrast", styles["theme-switcher"])}
          />
          <a href="#">Sign in</a>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
