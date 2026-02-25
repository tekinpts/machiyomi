import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMangaDetail, getMangaChapters } from '../services/mangadex'
import { Manga, Chapter } from '../types/manga'
import { isInLibrary, addToLibrary, removeFromLibrary, getReadProgress, LibraryData } from '../services/library'
import { useI18n } from '../i18n'
import '../styles/detail.css'

const ipcRenderer = typeof window !== 'undefined' && (window as any).require
  ? (window as any).require('electron').ipcRenderer
  : null

const MangaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [manga, setManga] = useState<Manga | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [chaptersLoading, setChaptersLoading] = useState(true)
  const [inLibrary, setInLibrary] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [downloadingChapters, setDownloadingChapters] = useState<Set<string>>(new Set())
  const [downloadedChapters, setDownloadedChapters] = useState<Set<string>>(new Set())
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set())
  const [totalChapters, setTotalChapters] = useState(0)
  const [chapterOffset, setChapterOffset] = useState(0)
  const [selectedLang, setSelectedLang] = useState<string>('ru')

  useEffect(() => {
    if (!id) return
    loadManga()
    checkLibrary()
    loadReadProgress()
  }, [id])

  useEffect(() => {
    if (!id) return
    setChapters([])
    setChapterOffset(0)
    loadChapters(0)
  }, [id, selectedLang])

  const loadManga = async () => {
    setLoading(true)
    try {
      const data = await getMangaDetail(id!)
      setManga(data)
    } catch (err) {
      console.error('Manga detay yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadChapters = async (offset: number) => {
    setChaptersLoading(true)
    try {
      const data = await getMangaChapters(id!, [selectedLang], offset, 100)
      setChapters(prev => offset === 0 ? data.chapters : [...prev, ...data.chapters])
      setTotalChapters(data.total)
      checkDownloadedChapters(data.chapters)
    } catch (err) {
      console.error('Bölümler yüklenemedi:', err)
    } finally {
      setChaptersLoading(false)
    }
  }

  const loadMoreChapters = () => {
    const newOffset = chapterOffset + 100
    setChapterOffset(newOffset)
    loadChapters(newOffset)
  }

  const checkLibrary = async () => {
    const result = await isInLibrary(id!)
    setInLibrary(result)
  }

  const loadReadProgress = async () => {
    const progress = await getReadProgress(id!)
    if (progress) {
      setReadChapters(new Set(progress.readChapters))
    }
  }

  const checkDownloadedChapters = async (chs: Chapter[]) => {
    if (!ipcRenderer) return
    const downloaded = new Set<string>()
    for (const ch of chs) {
      const isDownloaded = await ipcRenderer.invoke('check-chapter-downloaded', { mangaId: id, chapterId: ch.id })
      if (isDownloaded) downloaded.add(ch.id)
    }
    setDownloadedChapters(prev => new Set([...prev, ...downloaded]))
  }

  const handleToggleLibrary = async () => {
    if (!manga) return
    if (inLibrary) {
      await removeFromLibrary(manga.id)
      setInLibrary(false)
    } else {
      await addToLibrary(manga)
      setInLibrary(true)
    }
  }

  const handleDownloadChapter = async (chapter: Chapter) => {
    if (!ipcRenderer || downloadingChapters.has(chapter.id)) return

    setDownloadingChapters(prev => new Set(prev).add(chapter.id))

    try {
      const { getChapterPages, getPageUrl } = await import('../services/mangadex')
      const pageData = await getChapterPages(chapter.id)

      for (let i = 0; i < pageData.data.length; i++) {
        const url = getPageUrl(pageData, i, false)
        await ipcRenderer.invoke('download-page', {
          url,
          mangaId: id,
          chapterId: chapter.id,
          pageIndex: i,
        })
      }

      setDownloadedChapters(prev => new Set(prev).add(chapter.id))
    } catch (err) {
      console.error('İndirme hatası:', err)
    } finally {
      setDownloadingChapters(prev => {
        const next = new Set(prev)
        next.delete(chapter.id)
        return next
      })
    }
  }

  const handleReadChapter = (chapter: Chapter) => {
    navigate(`/reader/${id}/${chapter.id}`)
  }

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="spinner" />
        <span>{t.loading}</span>
      </div>
    )
  }

  if (!manga) {
    return <div className="detail-error">{t.noMangaFound}</div>
  }

  return (
    <div className="manga-detail">
      <div className="detail-hero">
        <div className="detail-hero-bg" style={{ backgroundImage: `url(${manga.coverUrl})` }} />
        <div className="detail-hero-content">
          <div className="detail-cover">
            <img src={manga.coverUrl} alt={manga.title} />
          </div>
          <div className="detail-info">
            <h1>{manga.title}</h1>
            <div className="detail-meta">
              {manga.author && <span className="meta-item">✍️ {manga.author}</span>}
              {manga.artist && manga.artist !== manga.author && (
                <span className="meta-item">🎨 {manga.artist}</span>
              )}
              {manga.status && <span className="meta-item status-badge">{manga.status}</span>}
              {manga.year && <span className="meta-item">📅 {manga.year}</span>}
              {manga.demographic && <span className="meta-item">👤 {manga.demographic}</span>}
            </div>
            <div className="detail-tags">
              {manga.tags.slice(0, 10).map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
            <div className="detail-actions">
              <button
                className={`btn-library ${inLibrary ? 'in-library' : ''}`}
                onClick={handleToggleLibrary}
              >
                {inLibrary ? t.inLibrary : t.addToLibrary}
              </button>
            </div>
          </div>
        </div>
      </div>

      {manga.description && (
        <div className="detail-description">
          <h3>{t.synopsis}</h3>
          <p className={showFullDesc ? 'expanded' : 'collapsed'}>
            {manga.description}
          </p>
          {manga.description.length > 300 && (
            <button className="btn-toggle-desc" onClick={() => setShowFullDesc(!showFullDesc)}>
              {showFullDesc ? t.showLess : t.showMore}
            </button>
          )}
        </div>
      )}

      <div className="chapters-section">
        <div className="chapters-header">
          <h3>{t.chapters} ({chapters.length})</h3>
          <div className="lang-select">
            <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}>
              <option value="en">🇬🇧 English</option>
              <option value="tr">🇹🇷 Türkçe</option>
              <option value="ja">🇯🇵 日本語</option>
              <option value="ko">🇰🇷 한국어</option>
              <option value="zh">🇨🇳 中文</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="es">🇪🇸 Español</option>
              <option value="pt-br">🇧🇷 Português</option>
              <option value="it">🇮🇹 Italiano</option>
            </select>
          </div>
        </div>

        {chaptersLoading && chapters.length === 0 ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>{t.loading}</span>
          </div>
        ) : chapters.length === 0 ? (
          <div className="empty-chapters">
            <p>{t.noChaptersInLang}</p>
          </div>
        ) : (
          <>
            <div className="chapters-list">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className={`chapter-item ${readChapters.has(chapter.id) ? 'read' : ''}`}
                >
                  <div className="chapter-info" onClick={() => handleReadChapter(chapter)}>
                    <span className="chapter-number">
                      {chapter.volume ? `${t.volume} ${chapter.volume} ` : ''}
                      {t.chapter} {chapter.chapter}
                    </span>
                    {chapter.title && <span className="chapter-title">{chapter.title}</span>}
                    <span className="chapter-meta">
                      {chapter.scanlationGroup} · {chapter.pages} {t.pages} · {new Date(chapter.publishAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="chapter-actions">
                    {downloadedChapters.has(chapter.id) ? (
                      <span className="downloaded-badge" title="İndirildi">✅</span>
                    ) : downloadingChapters.has(chapter.id) ? (
                      <div className="mini-spinner" title="İndiriliyor..." />
                    ) : (
                      <button
                        className="btn-download-chapter"
                        onClick={() => handleDownloadChapter(chapter)}
                        title="İndir"
                      >
                        ⬇️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {chapters.length < totalChapters && (
              <div className="load-more">
                <button onClick={loadMoreChapters} className="btn-load-more" disabled={chaptersLoading}>
                    {chaptersLoading ? t.loading : t.loadMoreChapters}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MangaDetail
