import React, { useState, useEffect } from 'react'
import { useI18n } from '../i18n'
import {
  Extension,
  fetchExtensions,
  filterExtensions,
  getUniqueLanguages,
  getLangDisplay,
  installExtension,
  uninstallExtension,
  isExtensionInstalled,
} from '../services/extensions'
import '../styles/extensions.css'

export default function Extensions() {
  const { t } = useI18n()
  const [extensions, setExtensions] = useState<Extension[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [langFilter, setLangFilter] = useState('all')
  const [tab, setTab] = useState<'available' | 'installed'>('available')
  const [hideNsfw, setHideNsfw] = useState(true)
  const [installedPkgs, setInstalledPkgs] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])

  useEffect(() => {
    loadExtensions()
  }, [])

  async function loadExtensions() {
    setLoading(true)
    const exts = await fetchExtensions()
    setExtensions(exts)
    setLanguages(getUniqueLanguages(exts))
    setInstalledPkgs(
      exts.filter(e => isExtensionInstalled(e.pkg)).map(e => e.pkg)
    )
    setLoading(false)
  }

  const filtered = filterExtensions(extensions, {
    search,
    lang: langFilter,
    installedOnly: tab === 'installed',
    hideNsfw,
  })

  function handleInstall(pkg: string) {
    installExtension(pkg)
    setInstalledPkgs(prev => [...prev, pkg])
  }

  function handleUninstall(pkg: string) {
    uninstallExtension(pkg)
    setInstalledPkgs(prev => prev.filter(p => p !== pkg))
  }

  return (
    <div className="extensions-page">
      <h1>{t.extensionsTitle}</h1>
      <p className="extensions-info">{t.extensionInfo}</p>

      <div className="extensions-toolbar">
        <div className="extensions-tabs">
          <button
            className={tab === 'available' ? 'active' : ''}
            onClick={() => setTab('available')}
          >
            {t.availableExtensions}
          </button>
          <button
            className={tab === 'installed' ? 'active' : ''}
            onClick={() => setTab('installed')}
          >
            {t.installedExtensions} ({installedPkgs.length})
          </button>
        </div>

        <div className="extensions-filters">
          <input
            type="text"
            placeholder={t.searchExtensions}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="extensions-search"
          />
          <select
            value={langFilter}
            onChange={e => setLangFilter(e.target.value)}
            className="extensions-lang-select"
          >
            <option value="all">{t.allLanguages}</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {getLangDisplay(lang)}
              </option>
            ))}
          </select>
          <label className="extensions-nsfw-toggle">
            <input
              type="checkbox"
              checked={hideNsfw}
              onChange={e => setHideNsfw(e.target.checked)}
            />
            {t.nsfwHidden}
          </label>
        </div>
      </div>

      {loading ? (
        <div className="extensions-loading">{t.loading}</div>
      ) : filtered.length === 0 ? (
        <div className="extensions-empty">{t.noExtensionsFound}</div>
      ) : (
        <div className="extensions-list">
          {filtered.map(ext => {
            const isInstalled = installedPkgs.includes(ext.pkg)
            return (
              <div key={ext.pkg} className="extension-card">
                <div className="extension-icon">
                  {ext.lang === 'all' ? '🌐' : getLangDisplay(ext.lang).split(' ')[0] || '📦'}
                </div>
                <div className="extension-info">
                  <div className="extension-header">
                    <span className="extension-name">{ext.name.replace('Tachiyomi: ', '')}</span>
                    <span className="extension-version">v{ext.version}</span>
                    <span className="extension-lang-badge">{ext.lang}</span>
                    {ext.nsfw === 1 && <span className="extension-nsfw">18+</span>}
                  </div>
                  <div className="extension-sources">
                    {ext.sources.slice(0, 3).map(s => (
                      <span key={s.id} className="extension-source-tag">
                        {s.name}
                      </span>
                    ))}
                    {ext.sources.length > 3 && (
                      <span className="extension-source-more">
                        +{ext.sources.length - 3} {t.sources}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className={`extension-action ${isInstalled ? 'installed' : ''}`}
                  onClick={() => isInstalled ? handleUninstall(ext.pkg) : handleInstall(ext.pkg)}
                >
                  {isInstalled ? t.uninstall : t.install}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
