export const THEMES = [
  {
    id: 'rage',
    name: '憤怒風',
    emoji: '🔥',
    desc: '你的預設模式就是憤怒',
    preview: ['#0d0000', '#8B0000', '#FF3333'],
    light: false,
    vars: {
      '--t-bg':     '#0d0000',
      '--t-card':   '#1a0000',
      '--t-slot':   '#110000',
      '--t-filled': '#2a0000',
      '--t-border': '#8B0000',
      '--t-accent': '#FF3333',
      '--t-muted':  '#CC4444',
    },
  },
  {
    id: 'warm',
    name: '溫馨風',
    emoji: '🌸',
    desc: '雖然想離職，但今天心情還好',
    preview: ['#fff8f4', '#f4a261', '#e76f51'],
    light: true,
    vars: {
      '--t-bg':     '#fff8f4',
      '--t-card':   '#ffffff',
      '--t-slot':   '#fef0e6',
      '--t-filled': '#fde8d8',
      '--t-border': '#f4a261',
      '--t-accent': '#e76f51',
      '--t-muted':  '#f4a261',
    },
  },
  {
    id: 'minimal',
    name: '簡約風',
    emoji: '🤍',
    desc: '用極簡掩蓋內心的暴風雪',
    preview: ['#f5f5f5', '#bdbdbd', '#424242'],
    light: true,
    vars: {
      '--t-bg':     '#f5f5f5',
      '--t-card':   '#ffffff',
      '--t-slot':   '#eeeeee',
      '--t-filled': '#e0e0e0',
      '--t-border': '#bdbdbd',
      '--t-accent': '#424242',
      '--t-muted':  '#757575',
    },
  },
  {
    id: 'night',
    name: '深夜風',
    emoji: '🌙',
    desc: '加班到凌晨的那種藍調',
    preview: ['#0a0e1a', '#1e2d4a', '#60a5fa'],
    light: false,
    vars: {
      '--t-bg':     '#0a0e1a',
      '--t-card':   '#111827',
      '--t-slot':   '#0d1424',
      '--t-filled': '#1e2d4a',
      '--t-border': '#2563eb',
      '--t-accent': '#60a5fa',
      '--t-muted':  '#93c5fd',
    },
  },
]

export const DEFAULT_THEME_ID = 'rage'
export const getTheme = (id) => THEMES.find((t) => t.id === id) ?? THEMES[0]

export function applyTheme(id) {
  const theme = getTheme(id)
  const root = document.documentElement
  Object.entries(theme.vars).forEach(([key, value]) => root.style.setProperty(key, value))
  root.setAttribute('data-theme', id)
}
