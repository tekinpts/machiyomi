import { Manga } from '../types/manga'

const ipcRenderer = typeof window !== 'undefined' && (window as any).require
  ? (window as any).require('electron').ipcRenderer
  : null

export interface ReadProgress {
  readChapters: string[]
  lastReadChapter: string
  lastReadPage: number
  lastReadAt: string
}

export interface LibraryManga {
  id: string
  title: string
  coverUrl: string
  author: string
  status: string
  addedAt: string
}

export interface LibraryData {
  mangas: LibraryManga[]
  readProgress: Record<string, ReadProgress>
}

let libraryCache: LibraryData | null = null

async function loadLibrary(): Promise<LibraryData> {
  if (libraryCache) return libraryCache
  if (ipcRenderer) {
    libraryCache = await ipcRenderer.invoke('load-library')
  }
  if (!libraryCache) {
    // Fallback to localStorage for dev
    const stored = localStorage.getItem('machiyomi-library')
    libraryCache = stored ? JSON.parse(stored) : { mangas: [], readProgress: {} }
  }
  return libraryCache!
}

async function saveLibrary(data: LibraryData): Promise<void> {
  libraryCache = data
  if (ipcRenderer) {
    await ipcRenderer.invoke('save-library', data)
  } else {
    localStorage.setItem('machiyomi-library', JSON.stringify(data))
  }
}

export async function getLibrary(): Promise<LibraryData> {
  return loadLibrary()
}

export async function addToLibrary(manga: Manga): Promise<void> {
  const lib = await loadLibrary()
  if (lib.mangas.find(m => m.id === manga.id)) return
  lib.mangas.push({
    id: manga.id,
    title: manga.title,
    coverUrl: manga.coverUrl,
    author: manga.author,
    status: manga.status,
    addedAt: new Date().toISOString(),
  })
  await saveLibrary(lib)
}

export async function removeFromLibrary(mangaId: string): Promise<void> {
  const lib = await loadLibrary()
  lib.mangas = lib.mangas.filter(m => m.id !== mangaId)
  await saveLibrary(lib)
}

export async function isInLibrary(mangaId: string): Promise<boolean> {
  const lib = await loadLibrary()
  return lib.mangas.some(m => m.id === mangaId)
}

export async function markChapterRead(mangaId: string, chapterId: string): Promise<void> {
  const lib = await loadLibrary()
  if (!lib.readProgress[mangaId]) {
    lib.readProgress[mangaId] = {
      readChapters: [],
      lastReadChapter: '',
      lastReadPage: 0,
      lastReadAt: '',
    }
  }
  const progress = lib.readProgress[mangaId]
  if (!progress.readChapters.includes(chapterId)) {
    progress.readChapters.push(chapterId)
  }
  progress.lastReadChapter = chapterId
  progress.lastReadAt = new Date().toISOString()
  await saveLibrary(lib)
}

export async function getReadProgress(mangaId: string): Promise<ReadProgress | null> {
  const lib = await loadLibrary()
  return lib.readProgress[mangaId] || null
}

export function clearCache(): void {
  libraryCache = null
}
