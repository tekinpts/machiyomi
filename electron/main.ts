import { app, BrowserWindow, ipcMain, session } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Machiyomi',
    backgroundColor: '#1a1a2e',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
  });

  // CORS bypass for MangaDex API
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({ requestHeaders: { ...details.requestHeaders, Origin: 'https://mangadex.org' } });
  });
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'access-control-allow-origin': ['*'],
        'access-control-allow-headers': ['*'],
      },
    });
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Download manga page image
function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Machiyomi/1.0', Referer: 'https://mangadex.org' } }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          fs.unlinkSync(dest);
          downloadFile(redirectUrl, dest).then(resolve).catch(reject);
          return;
        }
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Get app data path for downloads
function getDownloadPath(): string {
  const downloadDir = path.join(app.getPath('userData'), 'downloads');
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }
  return downloadDir;
}

function getLibraryPath(): string {
  return path.join(app.getPath('userData'), 'library.json');
}

// IPC Handlers
ipcMain.handle('get-download-path', () => getDownloadPath());

ipcMain.handle('download-page', async (_event, { url, mangaId, chapterId, pageIndex }) => {
  const ext = url.includes('.png') ? '.png' : '.jpg';
  const dest = path.join(getDownloadPath(), mangaId, chapterId, `${String(pageIndex).padStart(3, '0')}${ext}`);
  if (fs.existsSync(dest)) return dest;
  await downloadFile(url, dest);
  return dest;
});

ipcMain.handle('check-chapter-downloaded', async (_event, { mangaId, chapterId }) => {
  const chapterDir = path.join(getDownloadPath(), mangaId, chapterId);
  return fs.existsSync(chapterDir) && fs.readdirSync(chapterDir).length > 0;
});

ipcMain.handle('get-downloaded-pages', async (_event, { mangaId, chapterId }) => {
  const chapterDir = path.join(getDownloadPath(), mangaId, chapterId);
  if (!fs.existsSync(chapterDir)) return [];
  return fs.readdirSync(chapterDir)
    .filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
    .sort()
    .map(f => `file://${path.join(chapterDir, f)}`);
});

ipcMain.handle('save-library', async (_event, data) => {
  fs.writeFileSync(getLibraryPath(), JSON.stringify(data, null, 2));
});

ipcMain.handle('load-library', async () => {
  const libPath = getLibraryPath();
  if (fs.existsSync(libPath)) {
    return JSON.parse(fs.readFileSync(libPath, 'utf-8'));
  }
  return { mangas: [], readProgress: {} };
});

ipcMain.handle('delete-downloaded-chapter', async (_event, { mangaId, chapterId }) => {
  const chapterDir = path.join(getDownloadPath(), mangaId, chapterId);
  if (fs.existsSync(chapterDir)) {
    fs.rmSync(chapterDir, { recursive: true });
  }
});

ipcMain.handle('get-downloaded-mangas', async () => {
  const downloadDir = getDownloadPath();
  if (!fs.existsSync(downloadDir)) return [];
  
  // Load library for title/cover info
  let libraryMangas: any[] = [];
  const libPath = getLibraryPath();
  if (fs.existsSync(libPath)) {
    try {
      const lib = JSON.parse(fs.readFileSync(libPath, 'utf-8'));
      libraryMangas = lib.mangas || [];
    } catch {}
  }
  const libraryMap = new Map(libraryMangas.map((m: any) => [m.id, m]));
  
  const mangaDirs = fs.readdirSync(downloadDir).filter(f => {
    const p = path.join(downloadDir, f);
    return fs.statSync(p).isDirectory();
  });
  
  return mangaDirs.map(mangaId => {
    const mangaDir = path.join(downloadDir, mangaId);
    const chapters = fs.readdirSync(mangaDir).filter(f => {
      return fs.statSync(path.join(mangaDir, f)).isDirectory() && 
             fs.readdirSync(path.join(mangaDir, f)).length > 0;
    });
    const libEntry = libraryMap.get(mangaId);
    return {
      id: mangaId,
      title: libEntry?.title || mangaId,
      coverUrl: libEntry?.coverUrl || '',
      chapterCount: chapters.length,
    };
  }).filter(m => m.chapterCount > 0);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
