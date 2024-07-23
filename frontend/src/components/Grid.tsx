import { useInfiniteQuery } from "@tanstack/react-query";
import classNames from "classnames";
import InfiniteScroll from "react-infinite-scroll-component";

import styles from "./Grid.module.css";

interface ItemProps {
  shimmer: boolean;
  title?: string;
  url?: string;
}

function Item({ shimmer, title, url }: ItemProps) {
  return (
    <article className={styles.item}>
      <button className={`outline contrast ${styles.btn}`}>
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
      </button>
    </article>
  );
}

interface Page {
  data: Media[];
  total_pages: number;
  nextCursor?: number;
}

function Grid() {
  const fetchItems = async ({ pageParam = 1 }) => {
    const response = await fetch(`/media?page=${pageParam}`);
    const page = (await response.json()) as Page;
    if (page.data.length && pageParam < page.total_pages) {
      page.nextCursor = pageParam + 1;
    }
    return page;
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
    initialPageParam: 1,
    getNextPageParam: (lastPage: Page) => lastPage.nextCursor,
  });

  const loadingSkeletonCount = 25;
  const totalItemCount =
    data?.pages.reduce((total, page) => total + page.data.length, 0) ??
    loadingSkeletonCount;

  return (
    <>
      {error && <div>Error: {error.message}</div>}

      <InfiniteScroll
        dataLength={totalItemCount}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={null}
        endMessage={
          <p className={styles["end-message"]}>
            <b>That&apos;s all!</b>
          </p>
        }
      >
        <div className={styles.grid}>
          {data?.pages.flatMap((page, index) =>
            page.data.map((item, innerIndex) => (
              <Item
                key={`media-${index}-${innerIndex}`}
                shimmer={false}
                title={item.title}
                url={`https://www.themoviedb.org/t/p/w600_and_h900_bestv2${item.poster_path}`}
              />
            ))
          )}
          {(isFetchingNextPage || isPending) &&
            Array.from({ length: loadingSkeletonCount }, (_, index) => (
              <Item key={`skeleton-${index}`} shimmer={true} />
            ))}
        </div>
      </InfiniteScroll>
    </>
  );
}

export default Grid;
