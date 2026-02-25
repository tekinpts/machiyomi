export interface Manga {
  id: string;
  title: string;
  altTitles: string[];
  description: string;
  status: string;
  year: number | null;
  tags: string[];
  coverUrl: string;
  author: string;
  artist: string;
  contentRating: string;
  lastChapter: string;
  demographic: string;
}

export interface Chapter {
  id: string;
  title: string;
  chapter: string;
  volume: string;
  pages: number;
  language: string;
  publishAt: string;
  scanlationGroup: string;
}

export interface PageData {
  baseUrl: string;
  hash: string;
  data: string[];
  dataSaver: string[];
}
