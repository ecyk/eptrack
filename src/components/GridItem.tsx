import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { PropsWithChildren, useEffect, useState } from "react";
import styles from "./Grid.module.css";
import { BasicTmdbMedia, TmdbMedia } from "../types";
import { fetchMedia } from "../api";

export function isTmdbMedia(item: unknown): item is TmdbMedia {
  if (typeof item !== "object" || item === null) return false;
  const media = item as Partial<TmdbMedia>;
  return typeof media.title === "string" || typeof media.name === "string";
}

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className, children }: PropsWithChildren<SkeletonProps>) {
  return (
    <div className={classNames(styles.skeleton, className)}>{children}</div>
  );
}

interface ItemProps {
  media?: BasicTmdbMedia | TmdbMedia;
  onClick?: (media: BasicTmdbMedia | TmdbMedia) => void;
}

function GridItem({ media, onClick }: ItemProps) {
  const [loadedMedia, setLoadedMedia] = useState(media);

  const itemDetails = useQuery<TmdbMedia, Error>({
    queryKey: ["itemDetails", loadedMedia],
    queryFn: () =>
      fetchMedia(
        loadedMedia!.id,
        loadedMedia!.media_type,
      ) as Promise<TmdbMedia>,
    enabled: loadedMedia != null && !isTmdbMedia(loadedMedia),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (itemDetails.data && loadedMedia?.media_type) {
      setLoadedMedia({
        ...itemDetails.data,
        media_type: loadedMedia?.media_type,
      });
    }
  }, [itemDetails.data, loadedMedia?.media_type]);

  return (
    <article
      className={styles.item}
      onClick={() => loadedMedia?.id && onClick && onClick(loadedMedia)}
    >
      <button className={classNames("outline", "contrast", styles.btn)}>
        <Skeleton className={styles["skeleton-image"]}>
          {isTmdbMedia(loadedMedia) && loadedMedia?.poster_path && (
            <img
              className={styles.image}
              src={`https://www.themoviedb.org/t/p/w500${loadedMedia.poster_path}`}
            />
          )}
        </Skeleton>
        {
          <figcaption>
            {isTmdbMedia(loadedMedia) ? (
              <>{loadedMedia.title ?? loadedMedia.name}</>
            ) : (
              <Skeleton className={styles["skeleton-line"]} />
            )}
          </figcaption>
        }
      </button>
    </article>
  );
}

export default GridItem;
