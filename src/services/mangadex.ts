import axios from 'axios';
import { Manga, Chapter, PageData } from '../types/manga';

const API_BASE = 'https://api.mangadex.org';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

function extractTitle(attributes: any): string {
  const titleObj = attributes.title;
  return titleObj?.en || titleObj?.ja || titleObj?.['ja-ro'] || titleObj?.ko || Object.values(titleObj || {})[0] as string || 'Unknown';
}

function extractDescription(attributes: any): string {
  const descObj = attributes.description;
  if (!descObj) return '';
  return descObj?.en || descObj?.tr || descObj?.ja || Object.values(descObj)[0] as string || '';
}

function extractRelationship(relationships: any[], type: string): any {
  return relationships?.find((r: any) => r.type === type);
}

function getCoverUrl(mangaId: string, relationships: any[]): string {
  const cover = extractRelationship(relationships, 'cover_art');
  if (cover?.attributes?.fileName) {
    return `https://uploads.mangadex.org/covers/${mangaId}/${cover.attributes.fileName}.256.jpg`;
  }
  return '';
}

function getCoverUrlFull(mangaId: string, relationships: any[]): string {
  const cover = extractRelationship(relationships, 'cover_art');
  if (cover?.attributes?.fileName) {
    return `https://uploads.mangadex.org/covers/${mangaId}/${cover.attributes.fileName}`;
  }
  return '';
}

function parseManga(data: any): Manga {
  const { id, attributes, relationships } = data;
  const author = extractRelationship(relationships, 'author');
  const artist = extractRelationship(relationships, 'artist');

  return {
    id,
    title: extractTitle(attributes),
    altTitles: (attributes.altTitles || []).map((t: any) => Object.values(t)[0] as string),
    description: extractDescription(attributes),
    status: attributes.status || '',
    year: attributes.year,
    tags: (attributes.tags || []).map((t: any) => t.attributes?.name?.en || '').filter(Boolean),
    coverUrl: getCoverUrl(id, relationships),
    author: author?.attributes?.name || '',
    artist: artist?.attributes?.name || '',
    contentRating: attributes.contentRating || '',
    lastChapter: attributes.lastChapter || '',
    demographic: attributes.publicationDemographic || '',
  };
}

export async function searchManga(query: string, offset = 0, limit = 20, lang?: string): Promise<{ mangas: Manga[]; total: number }> {
  const params: any = {
    limit,
    offset,
    includes: ['cover_art', 'author', 'artist'],
    order: { relevance: 'desc' },
    contentRating: ['safe', 'suggestive'],
  };

  if (query.trim()) {
    params.title = query;
  }

  if (lang && lang !== 'all') {
    params.availableTranslatedLanguage = [lang];
  }

  const res = await api.get('/manga', { params });
  return {
    mangas: res.data.data.map(parseManga),
    total: res.data.total,
  };
}

export async function getPopularManga(offset = 0, limit = 20, lang?: string): Promise<{ mangas: Manga[]; total: number }> {
  const params: any = {
    limit,
    offset,
    includes: ['cover_art', 'author', 'artist'],
    order: { followedCount: 'desc' },
    contentRating: ['safe', 'suggestive'],
    hasAvailableChapters: true,
  };

  if (lang && lang !== 'all') {
    params.availableTranslatedLanguage = [lang];
  }

  const res = await api.get('/manga', { params });
  return {
    mangas: res.data.data.map(parseManga),
    total: res.data.total,
  };
}

export async function getLatestUpdates(offset = 0, limit = 20, lang?: string): Promise<{ mangas: Manga[]; total: number }> {
  const params: any = {
    limit,
    offset,
    includes: ['cover_art', 'author', 'artist'],
    order: { latestUploadedChapter: 'desc' },
    contentRating: ['safe', 'suggestive'],
    hasAvailableChapters: true,
  };

  if (lang && lang !== 'all') {
    params.availableTranslatedLanguage = [lang];
  }

  const res = await api.get('/manga', { params });
  return {
    mangas: res.data.data.map(parseManga),
    total: res.data.total,
  };
}

export async function getMangaDetail(mangaId: string): Promise<Manga> {
  const res = await api.get(`/manga/${mangaId}`, {
    params: {
      includes: ['cover_art', 'author', 'artist'],
    },
  });
  const manga = parseManga(res.data.data);
  manga.coverUrl = getCoverUrlFull(mangaId, res.data.data.relationships);
  return manga;
}

export async function getMangaChapters(
  mangaId: string,
  languages: string[] = ['en'],
  offset = 0,
  limit = 100
): Promise<{ chapters: Chapter[]; total: number }> {
  const res = await api.get(`/manga/${mangaId}/feed`, {
    params: {
      limit,
      offset,
      translatedLanguage: languages,
      order: { chapter: 'asc', volume: 'asc' },
      includes: ['scanlation_group'],
    },
  });

  const chapters: Chapter[] = res.data.data.map((ch: any) => {
    const group = extractRelationship(ch.relationships, 'scanlation_group');
    return {
      id: ch.id,
      title: ch.attributes.title || '',
      chapter: ch.attributes.chapter || '0',
      volume: ch.attributes.volume || '',
      pages: ch.attributes.pages || 0,
      language: ch.attributes.translatedLanguage || '',
      publishAt: ch.attributes.publishAt || '',
      scanlationGroup: group?.attributes?.name || 'Unknown',
    };
  });

  // Deduplicate chapters - keep the first one for each chapter number
  const seen = new Map<string, Chapter>();
  for (const ch of chapters) {
    const key = ch.chapter;
    if (!seen.has(key)) {
      seen.set(key, ch);
    }
  }

  return {
    chapters: Array.from(seen.values()),
    total: res.data.total,
  };
}

export async function getChapterPages(chapterId: string): Promise<PageData> {
  const res = await api.get(`/at-home/server/${chapterId}`);
  return {
    baseUrl: res.data.baseUrl,
    hash: res.data.chapter.hash,
    data: res.data.chapter.data,
    dataSaver: res.data.chapter.dataSaver,
  };
}

export function getPageUrl(pageData: PageData, pageIndex: number, dataSaver = false): string {
  const quality = dataSaver ? 'data-saver' : 'data';
  const files = dataSaver ? pageData.dataSaver : pageData.data;
  return `${pageData.baseUrl}/${quality}/${pageData.hash}/${files[pageIndex]}`;
}

export async function getMangaByTag(tagId: string, offset = 0, limit = 20): Promise<{ mangas: Manga[]; total: number }> {
  const res = await api.get('/manga', {
    params: {
      limit,
      offset,
      includes: ['cover_art', 'author', 'artist'],
      includedTags: [tagId],
      order: { followedCount: 'desc' },
      contentRating: ['safe', 'suggestive'],
    },
  });
  return {
    mangas: res.data.data.map(parseManga),
    total: res.data.total,
  };
}
