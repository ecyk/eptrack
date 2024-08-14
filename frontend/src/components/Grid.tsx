import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import classNames from "classnames";
import { PropsWithChildren, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDebounce } from "use-debounce";

import { fetchAllTags, fetchDetail, fetchItems } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";
import DetailModal from "./DetailModal";
import styles from "./Grid.module.css";
import Search from "./Search";
import TagModal from "./TagModal";

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
  const { isAuthenticated } = useAuth();

  const tags = useQuery<Tag[], Error>({
    queryKey: ["tags"],
    queryFn: () => fetchAllTags(),
    enabled: isAuthenticated,
    staleTime: Infinity,
  });

  const [searchTags, setSearchTags] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryDebounce] = useDebounce(searchQuery, 300);

  const items = useInfiniteQuery({
    queryKey: ["items", searchQueryDebounce, searchTags],
    queryFn: ({ pageParam }) =>
      fetchItems(pageParam, searchQueryDebounce, searchTags),
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

  return (
    <>
      <Toaster position="bottom-right" />
      <Search
        tags={tags?.data ?? []}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearchTagChange={setSearchTags}
      />
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
                onClick={() => {
                  setSelectedMedia(item);
                  handleOpen();
                }}
              />
            ))
          )}
          {(items.isLoading || items.isLoadingError) &&
            Array.from({ length: loadingSkeletonCount }, (_, index) => (
              <Item key={index} />
            ))}
        </div>
      </InfiniteScroll>
      {modalIsOpen && selectedMedia == null && (
        <TagModal
          hasCancel={true}
          onClose={(positive?: boolean) => {
            if (positive) {
              void client.refetchQueries({
                queryKey: ["tags"],
              });
            }
          }}
        />
      )}
      {modalIsOpen && selectedMedia != null && details.isSuccess && (
        <DetailModal
          media={details.data}
          tags={tags?.data ?? []}
          hasCancel={true}
          onClose={(positive?: boolean) => {
            if (positive) {
              void client.refetchQueries({
                queryKey: ["items", searchQueryDebounce, searchTags],
              });

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
