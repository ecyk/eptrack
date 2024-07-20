import classNames from "classnames";

import styles from "./Grid.module.css";

interface ItemProps {
  shimmer: boolean;
  title?: string;
  url?: string;
}

function Item({ shimmer, title, url }: ItemProps) {
  return (
    <article className={styles.item}>
      <div className={classNames(styles.shimmer, styles["shimmer-image"])}>
        {!shimmer && url && <img className={styles.image} src={url} />}
      </div>
      <div
        className={classNames(styles["shimmer-line"], {
          [styles.shimmer]: shimmer,
        })}
      >
        {!shimmer && title && <figcaption>{title}</figcaption>}
      </div>
    </article>
  );
}

function Grid() {
  return (
    <div className={styles.grid}>
      {Array.from({ length: 25 }, (_: unknown, index: number) => (
        <Item key={index} shimmer={true} />
      ))}
    </div>
  );
}

export default Grid;
