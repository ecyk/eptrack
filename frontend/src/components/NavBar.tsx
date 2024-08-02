import classNames from "classnames";

import { useAuth } from "../contexts/AuthContext";
import ColorSchemeSwitcher from "./ColorSchemeSwitcher";
import styles from "./NavBar.module.css";

function NavBar() {
  const { isAuthenticated, signIn, signOut } = useAuth();

  return (
    <nav>
      <ul>
        <li className={styles["navbar-list-item"]}>
          <h1 className={styles["navbar-title"]}>
            <strong>EpTrack</strong>
          </h1>
        </li>
      </ul>
      <ul>
        <li className={styles["navbar-list-item"]}>
          <ColorSchemeSwitcher
            className={classNames("contrast", styles["theme-switcher"])}
          />
          <button
            className={classNames("outline", "contrast")}
            onClick={() => {
              isAuthenticated ? signOut() : signIn();
            }}
          >
            {(isAuthenticated && "Sign out") || "Sign in with Google"}
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
