import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Browse from './pages/Browse'
import Library from './pages/Library'
import MangaDetail from './pages/MangaDetail'
import Reader from './pages/Reader'
import Downloads from './pages/Downloads'
import Extensions from './pages/Extensions'

const App: React.FC = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/reader/:mangaId/:chapterId" element={<Reader />} />
        <Route
          path="*"
          element={
            <div className="app-layout">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Library />} />
                  <Route path="/browse" element={<Browse />} />
                  <Route path="/manga/:id" element={<MangaDetail />} />
                  <Route path="/downloads" element={<Downloads />} />
                  <Route path="/extensions" element={<Extensions />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </div>
  )
}

export default App
