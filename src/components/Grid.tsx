import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDebounce } from "use-debounce";
import { useModal } from "../contexts/ModalContext";
import DetailModal from "./DetailModal";
import styles from "./Grid.module.css";
import Search from "./Search";
import { BasicTmdbMedia, TmdbMedia } from "../types";
import { fetchItems } from "../api";
import { Toaster } from "react-hot-toast";
import { useStorageService } from "../contexts/StorageServiceContext";
import TagModal from "./TagModal";
import GridItem, { isTmdbMedia } from "./GridItem";

function Grid() {
  const client = useQueryClient();
  const { userData } = useStorageService();

  const searchItems = async (
    page: number,
    searchQuery: string,
    searchTags: string[],
  ) => {
    if (searchTags.length && userData?.tags) {
      const tagSets = searchTags
        .map((tag) => new Set(userData.tags[tag] || []))
        .filter((set) => set.size > 0);
      if (tagSets.length !== searchTags.length) {
        return {
          nextCursor: null,
          results: [],
          page,
          total_pages: 0,
        };
      }
      const [firstSet, ...restSets] = tagSets;
      const intersection = Array.from(firstSet).filter((id) =>
        restSets.every((set) => set.has(id)),
      );
      const filteredIds = new Set(intersection);
      const allResults: BasicTmdbMedia[] = Array.from(filteredIds)
        .map((id) => {
          if (userData.movies?.[id]) {
            return { id: parseInt(id), media_type: "movie" } as BasicTmdbMedia;
          }
          if (userData.shows?.[id]) {
            return { id: parseInt(id), media_type: "tv" } as BasicTmdbMedia;
          }
          return null;
        })
        .filter((media) => media !== null);
      const total_pages = Math.ceil(allResults.length / 20);
      const start = (page - 1) * 20;
      const end = start + 20;
      const results = allResults.slice(start, end);
      return {
        nextCursor: page < total_pages ? page + 1 : null,
        results,
        page,
        total_pages,
      };
    }
    return await fetchItems(page, searchQuery);
  };

  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryDebounce] = useDebounce(searchQuery, 300);

  const { data, hasNextPage, fetchNextPage, isLoading, isLoadingError } =
    useInfiniteQuery({
      queryKey: ["items", searchQueryDebounce, searchTags],
      queryFn: ({ pageParam }) =>
        searchItems(pageParam, searchQueryDebounce, searchTags),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: Infinity,
    });

  const { modalIsOpen, handleOpen } = useModal();
  const [selectedMedia, setSelectedMedia] = useState<TmdbMedia | null>(null);

  useEffect(() => {
    if (selectedMedia && !modalIsOpen) {
      handleOpen();
    }
  }, [selectedMedia, modalIsOpen, handleOpen]);

  return (
    <>
      <Toaster position="bottom-right" />
      <Search
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearchTagChange={setSearchTags}
      />
      <InfiniteScroll
        dataLength={
          data?.pages.reduce((total, page) => total + page.results.length, 0) ??
          20
        }
        next={fetchNextPage}
        style={{ overflowY: "hidden" }}
        hasMore={hasNextPage}
        loader={null}
      >
        <div className={styles.grid}>
          {Array.from(
            new Map(
              data?.pages
                .flatMap((page) => page.results)
                .filter((item) => (item.media_type as unknown) !== "person")
                .map((item) => [`${item.id}-${item.media_type}`, item]),
            ).values(),
          ).map((item) => (
            <GridItem
              key={`media-${item.id}-${item.media_type}`}
              media={item}
              onClick={(media) => {
                if (isTmdbMedia(media)) {
                  setSelectedMedia(media);
                }
              }}
            />
          ))}
          {(isLoading || isLoadingError) &&
            Array.from({ length: 20 }, (_, index) => <GridItem key={index} />)}
        </div>
      </InfiniteScroll>
      {modalIsOpen && selectedMedia == null && <TagModal hasCancel={true} />}
      {modalIsOpen && selectedMedia != null && (
        <DetailModal
          media={selectedMedia}
          hasCancel={true}
          onClose={(positive?: boolean) => {
            if (positive) {
              void client.invalidateQueries({
                queryKey: ["items"],
              });
            }
            setSelectedMedia(null);
          }}
        />
      )}
    </>
  );
}

export default Grid;
