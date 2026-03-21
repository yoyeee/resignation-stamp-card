import { useState } from 'react'
import { STAMP_TYPES } from '../constants'

function getLocalDateValue(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export default function AddStampModal({ onAdd, onClose }) {
  const [selected, setSelected] = useState(null)
  const [description, setDescription] = useState('')
  const [isBackdate, setIsBackdate] = useState(false)
  const [backdateValue, setBackdateValue] = useState(getLocalDateValue())
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selected) return
    if (selected.id === 'custom' && !description.trim()) {
      alert('請填寫自定義事件內容！')
      return
    }
    setLoading(true)
    const customDate = isBackdate ? new Date(backdateValue + 'T12:00:00') : null
    await onAdd({ ...selected, description: description.trim(), customDate })
    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-rage-card border-2 border-rage-border rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
           style={{ boxShadow: '0 0 30px rgba(139,0,0,0.4)' }}>

        {/* 標題 */}
        <div className="p-5 text-center border-b-2 border-rage-border"
             style={{ background: 'linear-gradient(135deg, #1a0000, #2a0000)' }}>
          <p className="text-rage-accent font-black text-lg">又他媽的怎麼了？</p>
          <p className="text-gray-500 text-xs mt-1">選一個最貼切的心情</p>
        </div>

        {/* 選項格子 */}
        <div className="p-4 grid grid-cols-4 gap-2">
          {STAMP_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelected(type)}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition-all duration-150
                ${selected?.id === type.id
                  ? 'border-rage-accent bg-rage-filled scale-105'
                  : 'border-rage-filled bg-rage-slot hover:border-rage-border'
                }
              `}
            >
              <span className="text-2xl">{type.emoji}</span>
              <span className="text-xs text-gray-400 text-center leading-tight">{type.label}</span>
            </button>
          ))}
        </div>

        {/* 備註欄 */}
        <div className="px-4 pb-3">
          <textarea
            placeholder={selected?.id === 'custom' ? '說說發生什麼事...' : '補充說明（選填）'}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
            maxLength={1000}
            rows={2}
            className="w-full border-2 border-rage-filled rounded-2xl px-4 py-2 text-sm focus:outline-none focus:border-rage-border bg-rage-slot text-gray-200 placeholder-gray-600 resize-none overflow-hidden"
          />
        </div>

        {/* 補蓋日期 */}
        <div className="px-4 pb-3">
          <button
            onClick={() => setIsBackdate(!isBackdate)}
            className={`
              flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border-2 transition-all
              ${isBackdate
                ? 'border-rage-accent bg-rage-filled text-rage-accent'
                : 'border-rage-filled text-gray-500 hover:border-rage-border'
              }
            `}
          >
            <span>📅</span>
            <span>{isBackdate ? '補蓋其他日期' : '忘記蓋了？補蓋'}</span>
          </button>

          {isBackdate && (
            <div className="mt-2 animate-fadeIn overflow-hidden">
              <input
                type="date"
                value={backdateValue}
                max={getLocalDateValue()}
                onChange={(e) => setBackdateValue(e.target.value)}
                className="w-full max-w-full block border-2 border-rage-border rounded-2xl px-4 py-2 text-sm focus:outline-none bg-rage-filled text-gray-200 box-border"
              />
              <p className="text-xs text-gray-600 mt-1 ml-1">選擇當時發生的日期</p>
            </div>
          )}
        </div>

        {/* 按鈕 */}
        <div className="p-4 pt-1 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border-2 border-rage-filled text-gray-400 font-medium hover:border-rage-border transition-colors"
          >
            算了
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selected || loading}
            className={`
              flex-1 py-3 rounded-2xl font-black text-white transition-all duration-200
              ${selected
                ? 'hover:opacity-90 shadow-lg'
                : 'opacity-30 cursor-not-allowed bg-rage-filled'
              }
            `}
            style={selected ? {
              background: 'linear-gradient(135deg, #8B0000, #CC0000)',
              boxShadow: '0 4px 15px rgba(139,0,0,0.5)',
            } : {}}
          >
            {loading ? '蓋章中...' : (isBackdate ? '補蓋！ 📅' : '蓋章！ 🔥')}
          </button>
        </div>
      </div>
    </div>
  )
}
