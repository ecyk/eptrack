import classNames from "classnames";

import { useStorageService } from "../contexts/StorageServiceContext";
import ColorSchemeSwitcher from "./ColorSchemeSwitcher";
import styles from "./NavBar.module.css";

function NavBar() {
  const { userData, signIn, signOut } = useStorageService();

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
              if (userData) {
                signOut();
              } else {
                signIn();
              }
            }}
          >
            {(userData && "Sign out") || "Sign in with Google"}
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
