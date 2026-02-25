import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getChapterPages, getPageUrl, getMangaChapters } from '../services/mangadex'
import { markChapterRead } from '../services/library'
import { PageData, Chapter } from '../types/manga'
import { useI18n } from '../i18n'
import '../styles/reader.css'

const ipcRenderer = typeof window !== 'undefined' && (window as any).require
  ? (window as any).require('electron').ipcRenderer
  : null

type ReadingMode = 'vertical' | 'paged' | 'webtoon'

const Reader: React.FC = () => {
  const { mangaId, chapterId } = useParams<{ mangaId: string; chapterId: string }>()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [readingMode, setReadingMode] = useState<ReadingMode>('vertical')
  const [showControls, setShowControls] = useState(true)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(-1)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadChapter()
    loadChapterList()
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current)
    }
  }, [chapterId])

  const loadChapter = async () => {
    if (!chapterId) return
    setLoading(true)
    try {
      // Check if downloaded locally first
      if (ipcRenderer) {
        const localPages = await ipcRenderer.invoke('get-downloaded-pages', { mangaId, chapterId })
        if (localPages.length > 0) {
          setImageUrls(localPages)
          setPageData(null)
          setCurrentPage(0)
          setLoading(false)
          return
        }
      }

      const data = await getChapterPages(chapterId)
      setPageData(data)
      const urls = data.data.map((_: string, i: number) => getPageUrl(data, i, false))
      setImageUrls(urls)
      setCurrentPage(0)

      // Mark as read
      if (mangaId) {
        markChapterRead(mangaId, chapterId)
      }
    } catch (err) {
      console.error('Bölüm yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadChapterList = async () => {
    if (!mangaId) return
    try {
      const result = await getMangaChapters(mangaId, ['en', 'tr'], 0, 500)
      setChapters(result.chapters)
      const idx = result.chapters.findIndex(ch => ch.id === chapterId)
      setCurrentChapterIndex(idx)
    } catch (err) {
      console.error(err)
    }
  }

  const goToNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      const nextChapter = chapters[currentChapterIndex + 1]
      navigate(`/reader/${mangaId}/${nextChapter.id}`, { replace: true })
    }
  }

  const goPrevChapter = () => {
    if (currentChapterIndex > 0) {
      const prevChapter = chapters[currentChapterIndex - 1]
      navigate(`/reader/${mangaId}/${prevChapter.id}`, { replace: true })
    }
  }

  const nextPage = useCallback(() => {
    if (currentPage < imageUrls.length - 1) {
      setCurrentPage(p => p + 1)
    } else {
      goToNextChapter()
    }
  }, [currentPage, imageUrls.length, currentChapterIndex, chapters])

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(p => p - 1)
    } else {
      goPrevChapter()
    }
  }, [currentPage, currentChapterIndex, chapters])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
        e.preventDefault()
        if (readingMode === 'paged') nextPage()
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        if (readingMode === 'paged') prevPage()
        break
      case 'Escape':
        navigate(`/manga/${mangaId}`)
        break
      case 'f':
        toggleControls()
        break
    }
  }, [readingMode, nextPage, prevPage, mangaId])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const toggleControls = () => {
    setShowControls(prev => !prev)
  }

  const handlePageClick = (e: React.MouseEvent) => {
    if (readingMode !== 'paged') return
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    if (x < rect.width / 3) {
      prevPage()
    } else if (x > (rect.width * 2) / 3) {
      nextPage()
    } else {
      toggleControls()
    }
  }

  const currentChapter = chapters[currentChapterIndex]

  if (loading) {
    return (
      <div className="reader-loading">
        <div className="spinner large" />
        <span>{t.loading}</span>
      </div>
    )
  }

  return (
    <div className="reader" ref={containerRef}>
      {/* Top controls */}
      <div className={`reader-controls top ${showControls ? 'visible' : ''}`}>
        <button className="btn-back" onClick={() => navigate(`/manga/${mangaId}`)}>
          {t.back}
        </button>
        <div className="reader-chapter-info">
          {currentChapter && (
            <span>{t.chapter} {currentChapter.chapter}{currentChapter.title ? `: ${currentChapter.title}` : ''}</span>
          )}
        </div>
        <div className="reader-mode-switch">
          <button
            className={readingMode === 'vertical' ? 'active' : ''}
            onClick={() => setReadingMode('vertical')}
            title={t.verticalScroll}
          >
            ↕️
          </button>
          <button
            className={readingMode === 'paged' ? 'active' : ''}
            onClick={() => setReadingMode('paged')}
            title={t.paged}
          >
            📄
          </button>
          <button
            className={readingMode === 'webtoon' ? 'active' : ''}
            onClick={() => setReadingMode('webtoon')}
            title={t.webtoon}
          >
            📜
          </button>
        </div>
      </div>

      {/* Reader content */}
      {readingMode === 'paged' ? (
        <div className="reader-paged" onClick={handlePageClick}>
          {imageUrls[currentPage] && (
            <img
              src={imageUrls[currentPage]}
              alt={`${t.page} ${currentPage + 1}`}
              className="reader-page-img"
            />
          )}
        </div>
      ) : (
        <div className={`reader-scroll ${readingMode === 'webtoon' ? 'webtoon-mode' : ''}`}>
          {imageUrls.map((url, i) => (
            <img
              key={`${chapterId}-${i}`}
              src={url}
              alt={`${t.page} ${i + 1}`}
              className="reader-scroll-img"
              loading="lazy"
            />
          ))}
          <div className="reader-chapter-end">
            <p>{t.chapterEnd}</p>
            {currentChapterIndex < chapters.length - 1 && (
              <button className="btn-next-chapter" onClick={goToNextChapter}>
                {t.nextChapter}
              </button>
            )}
            <button className="btn-back-detail" onClick={() => navigate(`/manga/${mangaId}`)}>
              {t.backToDetail}
            </button>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className={`reader-controls bottom ${showControls ? 'visible' : ''}`}>
        <button
          className="btn-prev-chapter"
          disabled={currentChapterIndex <= 0}
          onClick={goPrevChapter}
        >
          {t.prevChapter}
        </button>

        {readingMode === 'paged' && (
          <div className="page-slider">
            <span>{currentPage + 1}</span>
            <input
              type="range"
              min="0"
              max={imageUrls.length - 1}
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
            />
            <span>{imageUrls.length}</span>
          </div>
        )}

        <button
          className="btn-next-chapter"
          disabled={currentChapterIndex >= chapters.length - 1}
          onClick={goToNextChapter}
        >
          {t.nextChapter}
        </button>
      </div>
    </div>
  )
}

export default Reader
