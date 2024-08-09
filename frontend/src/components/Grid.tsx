import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
  const client = useQueryClient();

  const items = useInfiniteQuery({
    queryKey: ["items"],
    queryFn: ({ pageParam }) => fetchItems(pageParam),
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
    queryKey: ["details", selectedMedia],
    queryFn: () =>
      toast.promise(fetchDetail(selectedMedia), {
        loading: "Loading details...",
        success: <b>Details loaded!</b>,
        error: <b>Could not load details.</b>,
      }),
    enabled: selectedMedia != null,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (selectedMedia != null) {
      handleOpen();
    }
  }, [selectedMedia, handleOpen]);

  return (
    <>
      <Toaster position="bottom-right" />
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
      {modalIsOpen && details.isSuccess && (
        <DetailModal
          tags={[
            {
              text: "Watched",
              id: 12,
              checked: false,
              active: true,
              updated: false,
            },
            {
              text: "Watching",
              id: 13,
              checked: false,
              active: true,
              updated: false,
            },
          ]}
          media={details.data}
          hasCancel={true}
          onClose={(positive?: boolean) => {
            if (positive) {
              void client
                .invalidateQueries({
                  queryKey: ["details", selectedMedia],
                  refetchType: "none",
                })
                .then(() => setSelectedMedia(null));
            } else {
              setSelectedMedia(null);
            }
          }}
        />
      )}
    </>
  );
}

export default Grid;
