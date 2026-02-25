import axios from 'axios'

export interface ExtensionSource {
  name: string
  lang: string
  id: string
  baseUrl: string
}

export interface Extension {
  name: string
  pkg: string
  apk: string
  lang: string
  code: number
  version: string
  nsfw: number
  hasReadme: number
  hasChangelog: number
  sources: ExtensionSource[]
}

const EXTENSIONS_INDEX_URL = 'https://raw.githubusercontent.com/keiyoushi/extensions/repo/index.min.json'
const INSTALLED_KEY = 'machiyomi-installed-extensions'

let extensionsCache: Extension[] | null = null

export async function fetchExtensions(): Promise<Extension[]> {
  if (extensionsCache) return extensionsCache
  try {
    const res = await axios.get<Extension[]>(EXTENSIONS_INDEX_URL, { timeout: 15000 })
    extensionsCache = res.data
    return res.data
  } catch (err) {
    console.error('Failed to fetch extensions:', err)
    return []
  }
}

export function getInstalledExtensions(): string[] {
  const saved = localStorage.getItem(INSTALLED_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return []
    }
  }
  return []
}

export function installExtension(pkg: string): void {
  const installed = getInstalledExtensions()
  if (!installed.includes(pkg)) {
    installed.push(pkg)
    localStorage.setItem(INSTALLED_KEY, JSON.stringify(installed))
  }
}

export function uninstallExtension(pkg: string): void {
  const installed = getInstalledExtensions().filter(p => p !== pkg)
  localStorage.setItem(INSTALLED_KEY, JSON.stringify(installed))
}

export function isExtensionInstalled(pkg: string): boolean {
  return getInstalledExtensions().includes(pkg)
}

export function getUniqueLanguages(extensions: Extension[]): string[] {
  const langs = new Set<string>()
  extensions.forEach(ext => {
    if (ext.lang) langs.add(ext.lang)
  })
  return Array.from(langs).sort()
}

export function filterExtensions(
  extensions: Extension[],
  options: {
    search?: string
    lang?: string
    installedOnly?: boolean
    hideNsfw?: boolean
  }
): Extension[] {
  let filtered = [...extensions]
  
  if (options.hideNsfw) {
    filtered = filtered.filter(ext => ext.nsfw === 0)
  }
  
  if (options.lang && options.lang !== 'all') {
    filtered = filtered.filter(ext => ext.lang === options.lang)
  }
  
  if (options.installedOnly) {
    const installed = getInstalledExtensions()
    filtered = filtered.filter(ext => installed.includes(ext.pkg))
  }
  
  if (options.search) {
    const q = options.search.toLowerCase()
    filtered = filtered.filter(ext => 
      ext.name.toLowerCase().includes(q) ||
      ext.pkg.toLowerCase().includes(q) ||
      ext.sources.some(s => s.name.toLowerCase().includes(q) || s.baseUrl.toLowerCase().includes(q))
    )
  }
  
  return filtered
}

// Language display mapping
const LANG_DISPLAY: Record<string, string> = {
  all: '🌐 All',
  en: '🇬🇧 English',
  tr: '🇹🇷 Türkçe',
  ru: '🇷🇺 Русский',
  ja: '🇯🇵 日本語',
  ko: '🇰🇷 한국어',
  zh: '🇨🇳 中文',
  'zh-Hans': '🇨🇳 简体中文',
  'zh-Hant': '🇹🇼 繁體中文',
  fr: '🇫🇷 Français',
  de: '🇩🇪 Deutsch',
  es: '🇪🇸 Español',
  'es-419': '🌎 Español (LA)',
  pt: '🇵🇹 Português',
  'pt-BR': '🇧🇷 Português (BR)',
  it: '🇮🇹 Italiano',
  ar: '🇸🇦 العربية',
  hi: '🇮🇳 हिन्दी',
  id: '🇮🇩 Indonesia',
  th: '🇹🇭 ไทย',
  vi: '🇻🇳 Tiếng Việt',
  pl: '🇵🇱 Polski',
  uk: '🇺🇦 Українська',
  nl: '🇳🇱 Nederlands',
  fil: '🇵🇭 Filipino',
  ms: '🇲🇾 Melayu',
  my: '🇲🇲 မြန်မာ',
  bn: '🇧🇩 বাংলা',
}

export function getLangDisplay(code: string): string {
  return LANG_DISPLAY[code] || code
}

export function clearExtensionsCache(): void {
  extensionsCache = null
}
