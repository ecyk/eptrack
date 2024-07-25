import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { PropsWithChildren, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import InfiniteScroll from "react-infinite-scroll-component";

import { fetchDetail, fetchItems } from "../api";
import useModal from "../contexts/useModal";
import DetailModal from "./DetailModal";
import styles from "./Grid.module.css";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className, children }: PropsWithChildren<SkeletonProps>) {
  return (
    <div className={classNames(styles.skeleton, className)}>{children}</div>
  );
}

interface ItemProps {
  media?: Media;
  onClick?: (event: React.MouseEvent, id: number) => void;
}

function Item({ media, onClick }: ItemProps) {
  return (
    <article
      className={styles.item}
      onClick={(event) => media?.id && onClick && onClick(event, media.id)}
    >
      <button className={classNames("outline", "contrast", styles.btn)}>
        <Skeleton className={styles["skeleton-image"]}>
          {media?.poster_path && (
            <img
              className={styles.image}
              src={`https://www.themoviedb.org/t/p/w500${media.poster_path}`}
            />
          )}
        </Skeleton>
        {
          <figcaption>
            {media?.title ?? <Skeleton className={styles["skeleton-line"]} />}
          </figcaption>
        }
      </button>
    </article>
  );
}

function Grid() {
  const items = useInfiniteQuery({
    queryKey: ["items"],
    queryFn: ({ pageParam }) =>
      toast.promise(fetchItems(pageParam), {
        loading: "Loading items...",
        success: <b>Items loaded!</b>,
        error: <b>Could not load items.</b>,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: Infinity,
  });

  const loadingSkeletonCount = 25;
  const totalItemCount =
    items.data?.pages.reduce((total, page) => total + page.results.length, 0) ??
    loadingSkeletonCount;

  const { modalIsOpen, handleOpen } = useModal();
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const details = useQuery<MediaDetail, Error>({
    queryKey: ["itemDetail", selectedItemId],
    queryFn: () =>
      toast.promise(fetchDetail(selectedItemId), {
        loading: "Loading details...",
        success: <b>Details loaded!</b>,
        error: <b>Could not load details.</b>,
      }),
    enabled: selectedItemId !== null,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!modalIsOpen && selectedItemId !== null && details.isSuccess) {
      handleOpen();
    }
  }, [modalIsOpen, handleOpen, selectedItemId, details.isSuccess]);

  return (
    <>
      <Toaster position="top-right" />
      <InfiniteScroll
        dataLength={totalItemCount}
        next={items.fetchNextPage}
        style={{ overflowY: "hidden" }}
        hasMore={items.hasNextPage}
        loader={null}
        endMessage={
          <p className={styles["end-message"]}>
            <b>That&apos;s all!</b>
          </p>
        }
      >
        <div className={styles.grid}>
          {items.data?.pages.flatMap((page, index) =>
            page.results.map((item, innerIndex) => (
              <Item
                key={`media-${index}-${innerIndex}`}
                media={item}
                onClick={(_, id) => setSelectedItemId(id)}
              />
            ))
          )}
          {(items.isLoading || items.isLoadingError) &&
            Array.from({ length: loadingSkeletonCount }, (_, index) => (
              <Item key={`skeleton-${index}`} />
            ))}
        </div>
      </InfiniteScroll>
      {modalIsOpen && (
        <DetailModal
          tags={[
            { text: "Watched", checked: false },
            { text: "Watching", checked: false },
          ]}
          media={details.data!}
          onSave={(dropdowns) => console.log(dropdowns)}
          onClose={() => setSelectedItemId(null)}
        />
      )}
    </>
  );
}

export default Grid;
