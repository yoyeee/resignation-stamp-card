import { THEMES } from '../themes'

export default function ThemeSwitcher({ themeId, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onChange(theme.id)}
          className={`
            flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border-2 transition-all duration-200
            ${themeId === theme.id
              ? 'border-rage-accent bg-rage-filled scale-105'
              : 'border-rage-filled hover:border-rage-border'
            }
          `}
        >
          <span className="text-2xl">{theme.emoji}</span>
          <div className="flex gap-0.5">
            {theme.preview.map((color, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color, border: '1px solid rgba(0,0,0,0.15)' }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 leading-tight text-center">{theme.name}</span>
        </button>
      ))}
    </div>
  )
}
