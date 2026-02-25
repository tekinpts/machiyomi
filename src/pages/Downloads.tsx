import React, { useState, useEffect } from 'react'
import { useI18n } from '../i18n'
import '../styles/downloads.css'

const ipcRenderer = typeof window !== 'undefined' && (window as any).require
  ? (window as any).require('electron').ipcRenderer
  : null

const Downloads: React.FC = () => {
  const { t } = useI18n()
  const [downloadPath, setDownloadPath] = useState('')

  useEffect(() => {
    if (ipcRenderer) {
      ipcRenderer.invoke('get-download-path').then((p: string) => setDownloadPath(p))
    }
  }, [])

  return (
    <div className="downloads-page">
      <div className="downloads-header">
        <h2>{t.downloadsTitle}</h2>
      </div>

      <div className="downloads-info">
        <div className="download-path-card">
          <h3>📁 {t.downloadLocation}</h3>
          <p className="download-path">{downloadPath || t.loading}</p>
          <p className="download-hint">{t.downloadHint}</p>
        </div>

        <div className="download-tips">
          <h3>💡 {t.downloadTips}</h3>
          <ul>
            {t.downloadTipsList.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Downloads
