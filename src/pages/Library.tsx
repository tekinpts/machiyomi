import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLibrary, LibraryManga, LibraryData } from '../services/library'
import MangaCard from '../components/MangaCard'
import { useI18n } from '../i18n'
import '../styles/library.css'

const ipcRenderer = typeof window !== 'undefined' && (window as any).require
  ? (window as any).require('electron').ipcRenderer
  : null

interface DownloadedManga {
  id: string
  title: string
  coverUrl: string
  chapterCount: number
}

type LibraryTab = 'all' | 'downloaded'

const Library: React.FC = () => {
  const { t } = useI18n()
  const [library, setLibrary] = useState<LibraryManga[]>([])
  const [downloadedMangas, setDownloadedMangas] = useState<DownloadedManga[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<LibraryTab>('all')
  const navigate = useNavigate()

  useEffect(() => {
    loadLibrary()
    loadDownloaded()
  }, [])

  const loadLibrary = async () => {
    setLoading(true)
    try {
      const lib = await getLibrary()
      setLibrary(lib.mangas)
    } catch (err) {
      console.error('Library load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadDownloaded = async () => {
    if (!ipcRenderer) return
    try {
      const downloaded: DownloadedManga[] = await ipcRenderer.invoke('get-downloaded-mangas')
      setDownloadedMangas(downloaded || [])
    } catch (err) {
      console.error('Downloaded manga load error:', err)
    }
  }

  // Merge library + downloaded (don't duplicate)
  const allMangas = React.useMemo(() => {
    const libraryIds = new Set(library.map(m => m.id))
    const merged = [...library]
    for (const dl of downloadedMangas) {
      if (!libraryIds.has(dl.id)) {
        merged.push({
          id: dl.id,
          title: dl.title,
          coverUrl: dl.coverUrl,
          author: '',
          status: '',
          addedAt: new Date().toISOString(),
        })
      }
    }
    return merged
  }, [library, downloadedMangas])

  const displayMangas = tab === 'downloaded'
    ? downloadedMangas.map(dl => ({
        id: dl.id,
        title: dl.title,
        coverUrl: dl.coverUrl,
        author: '',
        status: '',
        addedAt: new Date().toISOString(),
      }))
    : allMangas

  if (loading) {
    return (
      <div className="library-page">
        <div className="loading-container">
          <div className="spinner" />
          <span>{t.loading}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="library-page">
      <div className="library-header">
        <h2>{t.library}</h2>
        {allMangas.length > 0 && (
          <span className="library-count">{allMangas.length} {t.manga}</span>
        )}
      </div>

      {(downloadedMangas.length > 0 || library.length > 0) && (
        <div className="library-tabs">
          <button
            className={`library-tab ${tab === 'all' ? 'active' : ''}`}
            onClick={() => setTab('all')}
          >
            {t.all} ({allMangas.length})
          </button>
          <button
            className={`library-tab ${tab === 'downloaded' ? 'active' : ''}`}
            onClick={() => setTab('downloaded')}
          >
            {t.downloaded} ({downloadedMangas.length})
          </button>
        </div>
      )}

      {displayMangas.length === 0 ? (
        <div className="empty-library">
          <div className="empty-icon">📚</div>
          <h3>{t.libraryEmpty}</h3>
          <p>{t.libraryEmptyDesc}</p>
          <button className="btn-browse" onClick={() => navigate('/browse')}>
            {t.goToBrowse}
          </button>
        </div>
      ) : (
        <div className="manga-grid">
          {displayMangas.map((manga) => (
            <MangaCard
              key={manga.id}
              manga={{
                id: manga.id,
                title: manga.title,
                coverUrl: manga.coverUrl,
                author: manga.author,
                altTitles: [],
                description: '',
                status: manga.status,
                year: null,
                tags: [],
                artist: '',
                contentRating: '',
                lastChapter: '',
                demographic: '',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Library
