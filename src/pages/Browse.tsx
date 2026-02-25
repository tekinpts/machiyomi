import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchManga, getPopularManga, getLatestUpdates } from '../services/mangadex'
import { Manga } from '../types/manga'
import MangaCard from '../components/MangaCard'
import { useI18n } from '../i18n'
import {
  fetchExtensions,
  getInstalledExtensions,
  Extension,
  ExtensionSource,
  getLangDisplay,
} from '../services/extensions'
import '../styles/browse.css'

type Tab = 'popular' | 'latest' | 'search'

interface InstalledSource {
  extensionName: string
  source: ExtensionSource
  isBuiltIn: boolean
}

// MangaDex is always available as a built-in source
const MANGADEX_SOURCE: InstalledSource = {
  extensionName: 'MangaDex',
  source: {
    name: 'MangaDex',
    lang: 'all',
    id: 'mangadex-builtin',
    baseUrl: 'https://mangadex.org',
  },
  isBuiltIn: true,
}

const Browse: React.FC = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [mangas, setMangas] = useState<Manga[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('popular')
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [installedSources, setInstalledSources] = useState<InstalledSource[]>([MANGADEX_SOURCE])
  const [selectedSource, setSelectedSource] = useState<string>(MANGADEX_SOURCE.source.id)
  const [sourcesLoading, setSourcesLoading] = useState(true)
  const LIMIT = 20

  // Load installed extensions and their sources
  useEffect(() => {
    loadSources()
  }, [])

  // Auto-fetch on mount since MangaDex is always selected
  useEffect(() => {
    fetchMangasForSource('popular', '', 0, MANGADEX_SOURCE.source.lang)
  }, [])

  const loadSources = async () => {
    setSourcesLoading(true)
    try {
      const allExts = await fetchExtensions()
      const installedPkgs = getInstalledExtensions()
      const installed = allExts.filter(ext => installedPkgs.includes(ext.pkg))

      const sources: InstalledSource[] = [MANGADEX_SOURCE]
      for (const ext of installed) {
        for (const src of ext.sources) {
          // Skip MangaDex from extensions since we have it built-in
          if (src.baseUrl.includes('mangadex.org')) continue
          sources.push({
            extensionName: ext.name.replace('Tachiyomi: ', ''),
            source: src,
            isBuiltIn: false,
          })
        }
      }

      setInstalledSources(sources)
    } catch (err) {
      console.error('Failed to load sources:', err)
    } finally {
      setSourcesLoading(false)
    }
  }

  const currentSource = installedSources.find(s => s.source.id === selectedSource)
  // Get the language to filter by from the selected source
  const sourceLang = currentSource?.source.lang

  const fetchMangasForSource = useCallback(async (tab: Tab, query: string, newOffset: number, lang?: string, append = false) => {
    setLoading(true)
    try {
      let result: { mangas: Manga[]; total: number }
      // Pass lang filter — 'all' means no filter, specific lang filters MangaDex results
      const filterLang = lang && lang !== 'all' ? lang : undefined
      switch (tab) {
        case 'popular':
          result = await getPopularManga(newOffset, LIMIT, filterLang)
          break
        case 'latest':
          result = await getLatestUpdates(newOffset, LIMIT, filterLang)
          break
        case 'search':
          result = await searchManga(query, newOffset, LIMIT, filterLang)
          break
      }
      setMangas(prev => append ? [...prev, ...result.mangas] : result.mangas)
      setTotal(result.total)
    } catch (err) {
      console.error('Manga fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch when source or tab changes
  useEffect(() => {
    if (currentSource) {
      setMangas([])
      setOffset(0)
      fetchMangasForSource(activeTab, searchQuery, 0, currentSource.source.lang)
    }
  }, [selectedSource, activeTab])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setActiveTab('search')
      setOffset(0)
      fetchMangasForSource('search', searchQuery, 0, sourceLang)
    }
  }

  const loadMore = () => {
    const newOffset = offset + LIMIT
    setOffset(newOffset)
    fetchMangasForSource(activeTab, searchQuery, newOffset, sourceLang, true)
  }

  return (
    <div className="browse-page">
      <div className="browse-header">
        <h2>{t.discover}</h2>
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-search">{t.search}</button>
        </form>
      </div>

      {/* Source selector */}
      <div className="source-selector">
        <label className="source-selector-label">🧩 {t.selectSource}:</label>
        <div className="source-chips">
          {installedSources.map((s) => (
            <button
              key={s.source.id}
              className={`source-chip ${selectedSource === s.source.id ? 'active' : ''} ${s.isBuiltIn ? 'built-in' : ''}`}
              onClick={() => {
                setSelectedSource(s.source.id)
                setOffset(0)
                setActiveTab('popular')
              }}
            >
              <span className="source-chip-name">{s.source.name}</span>
              <span className="source-chip-lang">{s.source.lang}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="browse-tabs">
        <button
          className={`tab ${activeTab === 'popular' ? 'active' : ''}`}
          onClick={() => setActiveTab('popular')}
        >
          🔥 {t.popular}
        </button>
        <button
          className={`tab ${activeTab === 'latest' ? 'active' : ''}`}
          onClick={() => setActiveTab('latest')}
        >
          🕐 {t.latestUpdates}
        </button>
        {activeTab === 'search' && (
          <button className="tab active">
            🔍 "{searchQuery}"
          </button>
        )}
      </div>

      <div className="manga-grid">
        {mangas.map((manga) => (
          <MangaCard key={manga.id} manga={manga} />
        ))}
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner" />
          <span>{t.loading}</span>
        </div>
      )}

      {!loading && mangas.length > 0 && mangas.length < total && (
        <div className="load-more">
          <button onClick={loadMore} className="btn-load-more">
            {t.loadMore} ({mangas.length}/{total})
          </button>
        </div>
      )}

      {!loading && mangas.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <p>{t.noMangaFound}</p>
        </div>
      )}
    </div>
  )
}

export default Browse
