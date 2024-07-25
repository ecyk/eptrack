import classNames from "classnames";

import styles from "./Dropdown.module.css";

export interface DropdownItem {
  text: string;
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
        [styles.inline]: inline,
      })}
      open={initialOpen}
    >
      <summary>{text}</summary>
      {
        <ul>
          {items.map(({ text, checked }, index) => (
            <li key={index}>
              <label>
                <input
                  type="checkbox"
                  id={`checkbox-${index}`}
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
