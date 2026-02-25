import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Manga } from '../types/manga'
import '../styles/mangacard.css'

interface Props {
  manga: Manga
}

const MangaCard: React.FC<Props> = ({ manga }) => {
  const navigate = useNavigate()

  return (
    <div className="manga-card" onClick={() => navigate(`/manga/${manga.id}`)}>
      <div className="manga-card-cover">
        {manga.coverUrl ? (
          <img
            src={manga.coverUrl}
            alt={manga.title}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><rect fill="%23333" width="200" height="300"/><text fill="%23666" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="40">📖</text></svg>'
            }}
          />
        ) : (
          <div className="manga-card-placeholder">📖</div>
        )}
        <div className="manga-card-gradient" />
      </div>
      <div className="manga-card-info">
        <h3 className="manga-card-title">{manga.title}</h3>
      </div>
    </div>
  )
}

export default MangaCard
