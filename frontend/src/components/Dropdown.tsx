import classNames from "classnames";

import styles from "./Dropdown.module.css";

export interface DropdownItem {
  id: number;
  text: string;
  checked: boolean;
  active: boolean;
  updated: boolean;
}

export interface DropdownProps {
  text: string;
  items: DropdownItem[];
  initialOpen?: boolean;
  inline?: boolean;
  onChange?: (index: number) => void;
}

function Dropdown({
  text,
  items,
  initialOpen,
  inline,
  onChange,
}: DropdownProps) {
  return (
    <details
      className={classNames("dropdown", {
        [styles.inline]: inline ?? false,
      })}
      open={initialOpen ?? false}
    >
      <summary>{text}</summary>
      {
        <ul>
          {items.map(({ id, text, checked, active }, index) => (
            <li key={index}>
              <label>
                <input
                  type="checkbox"
                  id={id.toString()}
                  checked={checked}
                  disabled={!active}
                  onChange={() => onChange && onChange(index)}
                />
                {text}
              </label>
            </li>
          ))}
        </ul>
      }
    </details>
  );
}

export default Dropdown;
