interface Media {
  id: number;
  poster_path: string;
  title: string;
}

interface MediaDetail extends Media {
  media_type: string;
  genre_ids: number[];
  original_language: string;
  overview: string;
  popularity: number;
  release_date: string;
  vote_average: number;
  vote_count: number;
}
