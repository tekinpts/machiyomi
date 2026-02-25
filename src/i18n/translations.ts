export type Language = 'en' | 'tr' | 'ru'

export interface Translations {
  // App
  appName: string
  // Sidebar
  library: string
  browse: string
  extensions: string
  downloads: string
  settings: string
  // Browse
  discover: string
  searchPlaceholder: string
  search: string
  popular: string
  latestUpdates: string
  loadMore: string
  loading: string
  noMangaFound: string
  // Library
  libraryEmpty: string
  libraryEmptyDesc: string
  goToBrowse: string
  manga: string
  downloaded: string
  all: string
  // Manga Detail
  addToLibrary: string
  inLibrary: string
  synopsis: string
  showMore: string
  showLess: string
  chapters: string
  volume: string
  chapter: string
  pages: string
  noChaptersInLang: string
  loadMoreChapters: string
  download: string
  // Reader
  back: string
  chapterEnd: string
  nextChapter: string
  prevChapter: string
  backToDetail: string
  verticalScroll: string
  paged: string
  webtoon: string
  page: string
  // Extensions
  extensionsTitle: string
  availableExtensions: string
  installedExtensions: string
  install: string
  installed: string
  uninstall: string
  searchExtensions: string
  filterByLang: string
  allLanguages: string
  nsfwHidden: string
  source: string
  sources: string
  extensionInfo: string
  noExtensionsFound: string
  // Downloads
  downloadsTitle: string
  downloadLocation: string
  downloadTips: string
  downloadTipsList: string[]
  downloadHint: string
  // Settings
  language: string
  appLanguage: string
  // General
  version: string
  error: string
  retry: string
  cancel: string
  confirm: string
  of: string
  // Browse - extension based
  noExtensionsInstalled: string
  noExtensionsInstalledDesc: string
  goToExtensions: string
  selectSource: string
  allSources: string
}

const en: Translations = {
  appName: 'Machiyomi',
  library: 'Library',
  browse: 'Browse',
  extensions: 'Extensions',
  downloads: 'Downloads',
  settings: 'Settings',
  discover: 'Discover',
  searchPlaceholder: 'Search manga...',
  search: 'Search',
  popular: 'Popular',
  latestUpdates: 'Latest Updates',
  loadMore: 'Load More',
  loading: 'Loading...',
  noMangaFound: 'No manga found',
  libraryEmpty: 'Library is Empty',
  libraryEmptyDesc: 'Add manga from the Browse page',
  goToBrowse: 'Browse →',
  manga: 'manga',
  downloaded: 'Downloaded',
  all: 'All',
  addToLibrary: '🤍 Add to Library',
  inLibrary: '❤️ In Library',
  synopsis: 'Synopsis',
  showMore: 'Show more',
  showLess: 'Show less',
  chapters: 'Chapters',
  volume: 'Vol',
  chapter: 'Ch',
  pages: 'pages',
  noChaptersInLang: 'No chapters found in this language',
  loadMoreChapters: 'Load More Chapters',
  download: 'Download',
  back: '← Back',
  chapterEnd: 'End of Chapter',
  nextChapter: 'Next ⏭',
  prevChapter: '⏮ Prev',
  backToDetail: 'Back to Manga',
  verticalScroll: 'Vertical Scroll',
  paged: 'Paged',
  webtoon: 'Webtoon',
  page: 'Page',
  extensionsTitle: 'Extensions',
  availableExtensions: 'Available',
  installedExtensions: 'Installed',
  install: 'Install',
  installed: 'Installed',
  uninstall: 'Uninstall',
  searchExtensions: 'Search extensions...',
  filterByLang: 'Filter by language',
  allLanguages: 'All Languages',
  nsfwHidden: 'NSFW hidden',
  source: 'Source',
  sources: 'Sources',
  extensionInfo: 'Extensions add manga sources. Install an extension to browse manga from that source.',
  noExtensionsFound: 'No extensions found',
  downloadsTitle: 'Downloads',
  downloadLocation: 'Download Location',
  downloadTips: 'Tips',
  downloadTipsList: [
    'Click the ⬇️ button on manga detail page to download chapters',
    'Downloaded chapters can be read offline',
    'Downloaded files are stored locally on your device',
  ],
  downloadHint: 'Chapters can be downloaded from the manga detail page. Downloaded chapters can be read offline.',
  language: 'Language',
  appLanguage: 'App Language',
  version: 'v1.0.0',
  error: 'Error',
  retry: 'Retry',
  cancel: 'Cancel',
  confirm: 'Confirm',
  of: 'of',
  noExtensionsInstalled: 'No Extensions Installed',
  noExtensionsInstalledDesc: 'Install extensions to browse manga from different sources',
  goToExtensions: 'Go to Extensions',
  selectSource: 'Select Source',
  allSources: 'All Sources',
}

const tr: Translations = {
  appName: 'Machiyomi',
  library: 'Kütüphane',
  browse: 'Keşfet',
  extensions: 'Eklentiler',
  downloads: 'İndirilenler',
  settings: 'Ayarlar',
  discover: 'Keşfet',
  searchPlaceholder: 'Manga ara...',
  search: 'Ara',
  popular: 'Popüler',
  latestUpdates: 'Son Güncellenen',
  loadMore: 'Daha Fazla Yükle',
  loading: 'Yükleniyor...',
  noMangaFound: 'Manga bulunamadı',
  libraryEmpty: 'Kütüphane Boş',
  libraryEmptyDesc: 'Keşfet sayfasından manga ekleyin',
  goToBrowse: 'Keşfet →',
  manga: 'manga',
  downloaded: 'İndirilen',
  all: 'Tümü',
  addToLibrary: '🤍 Kütüphaneye Ekle',
  inLibrary: '❤️ Kütüphanede',
  synopsis: 'Özet',
  showMore: 'Devamını oku',
  showLess: 'Daha az göster',
  chapters: 'Bölümler',
  volume: 'Cilt',
  chapter: 'Bölüm',
  pages: 'sayfa',
  noChaptersInLang: 'Bu dilde bölüm bulunamadı',
  loadMoreChapters: 'Daha Fazla Bölüm Yükle',
  download: 'İndir',
  back: '← Geri',
  chapterEnd: 'Bölüm Sonu',
  nextChapter: 'Sonraki ⏭',
  prevChapter: '⏮ Önceki',
  backToDetail: 'Manga Detayına Dön',
  verticalScroll: 'Dikey Kaydırma',
  paged: 'Sayfa Sayfa',
  webtoon: 'Webtoon',
  page: 'Sayfa',
  extensionsTitle: 'Eklentiler',
  availableExtensions: 'Mevcut',
  installedExtensions: 'Yüklü',
  install: 'Yükle',
  installed: 'Yüklü',
  uninstall: 'Kaldır',
  searchExtensions: 'Eklenti ara...',
  filterByLang: 'Dile göre filtrele',
  allLanguages: 'Tüm Diller',
  nsfwHidden: 'NSFW gizli',
  source: 'Kaynak',
  sources: 'Kaynaklar',
  extensionInfo: 'Eklentiler manga kaynakları ekler. Kaynaktan manga görmek için eklenti yükleyin.',
  noExtensionsFound: 'Eklenti bulunamadı',
  downloadsTitle: 'İndirilenler',
  downloadLocation: 'İndirme Konumu',
  downloadTips: 'İpuçları',
  downloadTipsList: [
    'Manga detay sayfasında ⬇️ butonuna tıklayarak bölümleri indirebilirsiniz',
    'İndirilen bölümler internet bağlantısı olmadan okunabilir',
    'İndirilen dosyalar cihazınızda yerel olarak saklanır',
  ],
  downloadHint: 'Bölümler manga detay sayfasından indirilebilir. İndirilen bölümler çevrimdışı okunabilir.',
  language: 'Dil',
  appLanguage: 'Uygulama Dili',
  version: 'v1.0.0',
  error: 'Hata',
  retry: 'Tekrar Dene',
  cancel: 'İptal',
  confirm: 'Onayla',
  of: '/',
  noExtensionsInstalled: 'Eklenti Yüklenmemiş',
  noExtensionsInstalledDesc: 'Farklı kaynaklardan manga görmek için eklenti yükleyin',
  goToExtensions: 'Eklentilere Git',
  selectSource: 'Kaynak Seç',
  allSources: 'Tüm Kaynaklar',
}

const ru: Translations = {
  appName: 'Machiyomi',
  library: 'Библиотека',
  browse: 'Обзор',
  extensions: 'Расширения',
  downloads: 'Загрузки',
  settings: 'Настройки',
  discover: 'Обзор',
  searchPlaceholder: 'Поиск манги...',
  search: 'Поиск',
  popular: 'Популярное',
  latestUpdates: 'Последние обновления',
  loadMore: 'Загрузить ещё',
  loading: 'Загрузка...',
  noMangaFound: 'Манга не найдена',
  libraryEmpty: 'Библиотека пуста',
  libraryEmptyDesc: 'Добавьте мангу со страницы обзора',
  goToBrowse: 'Обзор →',
  manga: 'манга',
  downloaded: 'Загружено',
  all: 'Все',
  addToLibrary: '🤍 В Библиотеку',
  inLibrary: '❤️ В Библиотеке',
  synopsis: 'Описание',
  showMore: 'Показать больше',
  showLess: 'Показать меньше',
  chapters: 'Главы',
  volume: 'Том',
  chapter: 'Глава',
  pages: 'страниц',
  noChaptersInLang: 'Глав на этом языке не найдено',
  loadMoreChapters: 'Загрузить ещё главы',
  download: 'Скачать',
  back: '← Назад',
  chapterEnd: 'Конец главы',
  nextChapter: 'Далее ⏭',
  prevChapter: '⏮ Назад',
  backToDetail: 'Назад к манге',
  verticalScroll: 'Вертикальная прокрутка',
  paged: 'Постранично',
  webtoon: 'Вебтун',
  page: 'Страница',
  extensionsTitle: 'Расширения',
  availableExtensions: 'Доступные',
  installedExtensions: 'Установленные',
  install: 'Установить',
  installed: 'Установлено',
  uninstall: 'Удалить',
  searchExtensions: 'Поиск расширений...',
  filterByLang: 'Фильтр по языку',
  allLanguages: 'Все языки',
  nsfwHidden: 'NSFW скрыто',
  source: 'Источник',
  sources: 'Источники',
  extensionInfo: 'Расширения добавляют источники манги. Установите расширение для просмотра манги из этого источника.',
  noExtensionsFound: 'Расширения не найдены',
  downloadsTitle: 'Загрузки',
  downloadLocation: 'Папка загрузок',
  downloadTips: 'Советы',
  downloadTipsList: [
    'Нажмите ⬇️ на странице манги для загрузки глав',
    'Загруженные главы можно читать офлайн',
    'Загруженные файлы хранятся локально на вашем устройстве',
  ],
  downloadHint: 'Главы можно скачать со страницы манги. Загруженные главы доступны офлайн.',
  language: 'Язык',
  appLanguage: 'Язык приложения',
  version: 'v1.0.0',
  error: 'Ошибка',
  retry: 'Повторить',
  cancel: 'Отмена',
  confirm: 'Подтвердить',
  of: 'из',
  noExtensionsInstalled: 'Расширения не установлены',
  noExtensionsInstalledDesc: 'Установите расширения для просмотра манги из разных источников',
  goToExtensions: 'Перейти к расширениям',
  selectSource: 'Выбрать источник',
  allSources: 'Все источники',
}

const translations: Record<Language, Translations> = { en, tr, ru }

export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations.en
}

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  tr: 'Türkçe',
  ru: 'Русский',
}

export const LANGUAGE_FLAGS: Record<Language, string> = {
  en: '🇬🇧',
  tr: '🇹🇷',
  ru: '🇷🇺',
}
