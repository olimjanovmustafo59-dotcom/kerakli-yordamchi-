const RECENT_KEY = 'smarttools_recent_tools';
const FAVORITES_KEY = 'smarttools_favorite_tools';
const THEME_KEY = 'smarttools_theme';
const ADMIN_EMAIL = 'olimjanovmustafo59@gmail.com';

export function getRecentTools(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : ['qr_pro', 'pdf_tools', 'doc_ai', 'device_advisor'];
  } catch {
    return ['qr_pro', 'pdf_tools', 'doc_ai', 'device_advisor'];
  }
}

export function addRecentTool(toolId: string) {
  try {
    const recents = getRecentTools().filter((id) => id !== toolId);
    recents.unshift(toolId);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recents.slice(0, 8)));
  } catch (e) {
    console.error(e);
  }
}

export function getFavoriteTools(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : ['qr_pro', 'barcode', 'doc_ai', 'pdf_tools'];
  } catch {
    return ['qr_pro', 'barcode', 'doc_ai', 'pdf_tools'];
  }
}

export function toggleFavoriteTool(toolId: string): string[] {
  try {
    const favs = getFavoriteTools();
    const updated = favs.includes(toolId)
      ? favs.filter((id) => id !== toolId)
      : [...favs, toolId];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getStoredTheme(): 'dark' | 'light' {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'dark' || t === 'light') return t;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function setStoredTheme(theme: 'dark' | 'light') {
  try {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    console.error(e);
  }
}

export function getIsAdminUser(): boolean {
  try {
    const currentUser = localStorage.getItem('smarttools_current_user');
    return currentUser === ADMIN_EMAIL;
  } catch {
    return false;
  }
}

export function setAdminUser(email: string) {
  try {
    localStorage.setItem('smarttools_current_user', email);
  } catch (e) {
    console.error(e);
  }
}
