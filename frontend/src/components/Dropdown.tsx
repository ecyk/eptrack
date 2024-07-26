import classNames from "classnames";

import styles from "./Dropdown.module.css";

export interface DropdownItem {
  text: string;
  name: string;
  checked: boolean;
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
          {items.map(({ text, name, checked }, index) => (
            <li key={index}>
              <label>
                <input
                  type="checkbox"
                  name={name}
                  checked={checked}
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
