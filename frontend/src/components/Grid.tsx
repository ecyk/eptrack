import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { PropsWithChildren, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import InfiniteScroll from "react-infinite-scroll-component";

import { fetchDetail, fetchItems } from "../api";
import { useModal } from "../contexts/ModalContext";
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
  onClick?: (event: React.MouseEvent, media: Media) => void;
}

function Item({ media, onClick }: ItemProps) {
  return (
    <article
      className={styles.item}
      onClick={(event) => media?.id && onClick && onClick(event, media)}
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
            {media?.name ?? <Skeleton className={styles["skeleton-line"]} />}
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
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  const details = useQuery<MovieResponse | ShowResponse, Error>({
    queryKey: ["itemDetail", selectedMedia],
    queryFn: () =>
      toast.promise(fetchDetail(selectedMedia), {
        loading: "Loading details...",
        success: <b>Details loaded!</b>,
        error: <b>Could not load details.</b>,
      }),
    enabled: selectedMedia !== null,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!modalIsOpen && selectedMedia !== null && details.isSuccess) {
      handleOpen();
    }
  }, [modalIsOpen, handleOpen, selectedMedia, details.isSuccess]);

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
                onClick={() => setSelectedMedia(item)}
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
            { text: "Watched", name: "tag-1", checked: false },
            { text: "Watching", name: "tag-2", checked: false },
          ]}
          media={details.data!}
          onSave={(dropdowns) => console.log(dropdowns)}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </>
  );
}

export default Grid;
