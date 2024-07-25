interface Episode {
  name: string;
  watched: boolean;
}

interface Season {
  name: string;
  episodes: Episode[];
}

interface Media {
  id: number;
  media_type: string;
  genre_ids: number[];
  original_language: string;
  poster_path: string;
  title: string;
  tag_ids?: number[];
}

interface MediaDetail extends Media {
  overview: string;
  popularity: number;
  release_date: string;
  vote_average: number;
  vote_count: number;
  seasons?: Season[];
}

interface ItemsResponse {
  results: Media[];
  total_pages: number;
  error?: string;
  nextCursor?: number;
}

interface DetailResponse {
  result: MediaDetail;
  error?: string;
}
