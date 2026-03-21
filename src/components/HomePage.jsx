import { useState, useEffect } from 'react'
import {
  collection, addDoc, onSnapshot,
  query, orderBy, serverTimestamp, Timestamp,
  doc, deleteDoc, getDocs, setDoc, getDoc
} from 'firebase/firestore'
import { db } from '../firebase'
import { DEFAULT_GOAL } from '../constants'
import Header from './Header'
import StampCard from './StampCard'
import AddStampModal from './AddStampModal'
import HistoryList from './HistoryList'
import CelebrationModal from './CelebrationModal'
import ThemeSwitcher from './ThemeSwitcher'

// ── localStorage helpers（訪客模式）──────────────────────
function lsKey(uid, key) { return `guest_${key}_${uid}` }

function lsGetStamps(uid) {
  try { return JSON.parse(localStorage.getItem(lsKey(uid, 'stamps'))) || [] } catch { return [] }
}
function lsSaveStamps(uid, stamps) {
  localStorage.setItem(lsKey(uid, 'stamps'), JSON.stringify(stamps))
}
function lsGetGoal(uid) {
  const v = localStorage.getItem(lsKey(uid, 'goal'))
  return v ? Number(v) : null
}
function lsSaveGoal(uid, goal) {
  localStorage.setItem(lsKey(uid, 'goal'), String(goal))
}
// ─────────────────────────────────────────────────────────

export default function HomePage({ user, themeId, onThemeChange }) {
  const isGuest = user.isAnonymous

  const [stamps, setStamps] = useState([])
  const [goal, setGoal] = useState(DEFAULT_GOAL)
  const [showModal, setShowModal] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrated, setCelebrated] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const stampsRef = !isGuest ? collection(db, 'users', user.uid, 'stamps') : null
  const settingsRef = !isGuest ? doc(db, 'users', user.uid, 'meta', 'settings') : null

  // ── 載入設定 ──
  useEffect(() => {
    if (isGuest) {
      const g = lsGetGoal(user.uid)
      if (g) setGoal(g)
    } else {
      getDoc(settingsRef).then((snap) => {
        if (snap.exists() && snap.data().goal) setGoal(snap.data().goal)
      })
    }
  }, [user.uid])

  // ── 載入 / 同步集點 ──
  useEffect(() => {
    if (isGuest) {
      setStamps(lsGetStamps(user.uid))
      return
    }
    const q = query(stampsRef, orderBy('createdAt', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      setStamps(data)
    })
    return unsubscribe
  }, [user.uid])

  // ── 達標時顯示慶祝 ──
  useEffect(() => {
    if (stamps.length >= goal && stamps.length > 0 && !celebrated) {
      setShowCelebration(true)
      setCelebrated(true)
    }
  }, [stamps.length, goal, celebrated])

  const GOAL_OPTIONS = [5, 10, 20, 30, 50, 100]

  // ── 儲存目標格數 ──
  const handleGoalChange = async (newGoal) => {
    setGoal(newGoal)
    setCelebrated(false)
    if (isGuest) {
      lsSaveGoal(user.uid, newGoal)
    } else {
      await setDoc(settingsRef, { goal: newGoal }, { merge: true })
    }
  }

  // ── 新增蓋章 ──
  const handleAddStamp = async (stampData) => {
    if (isGuest) {
      const newStamp = {
        id: crypto.randomUUID(),
        type: stampData.id,
        emoji: stampData.emoji,
        label: stampData.label,
        description: stampData.description || '',
        createdAt: stampData.customDate
          ? stampData.customDate.toISOString()
          : new Date().toISOString(),
      }
      const updated = [...stamps, newStamp]
      setStamps(updated)
      lsSaveStamps(user.uid, updated)
    } else {
      await addDoc(stampsRef, {
        type: stampData.id,
        emoji: stampData.emoji,
        label: stampData.label,
        description: stampData.description || '',
        createdAt: stampData.customDate
          ? Timestamp.fromDate(stampData.customDate)
          : serverTimestamp(),
      })
    }
    setShowModal(false)
  }

  // ── 刪除單筆 ──
  const handleDeleteStamp = async (stampId) => {
    if (isGuest) {
      const updated = stamps.filter((s) => s.id !== stampId)
      setStamps(updated)
      lsSaveStamps(user.uid, updated)
    } else {
      await deleteDoc(doc(db, 'users', user.uid, 'stamps', stampId))
    }
  }

  // ── 清除全部 ──
  const handleReset = async () => {
    if (isGuest) {
      setStamps([])
      lsSaveStamps(user.uid, [])
    } else {
      const snapshot = await getDocs(stampsRef)
      const deletes = snapshot.docs.map((d) => deleteDoc(doc(db, 'users', user.uid, 'stamps', d.id)))
      await Promise.all(deletes)
    }
    setCelebrated(false)
    setShowCelebration(false)
  }

  const displayName = isGuest ? '訪客' : user.displayName?.split(' ')[0]

  return (
    <div className="min-h-screen bg-rage-bg">
      <Header user={user} />

      <main className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* 訪客警語 */}
        {isGuest && (
          <div className="rounded-2xl px-4 py-3 text-xs leading-relaxed animate-fadeIn"
               style={{ background: 'rgba(120,80,0,0.2)', border: '1px solid rgba(180,120,0,0.4)' }}>
            <span className="text-yellow-400 font-bold">⚠️ 訪客模式：</span>
            <span className="text-gray-400">集點只存在這台裝置。清除瀏覽器資料或換裝置後資料將消失，建議改用 </span>
            <span className="text-yellow-300 font-bold">Google 帳號登入</span>
            <span className="text-gray-400"> 以永久保存。</span>
          </div>
        )}

        {/* 問候語 */}
        <div className="text-center py-2 animate-fadeIn">
          <p className="text-gray-500 text-sm">
            嗨，<span className="text-rage-accent font-bold">{displayName}</span>！今天又被虐了嗎？ 🩸
          </p>
        </div>

        {/* 集點卡 */}
        <StampCard stamps={stamps} goal={goal} onShowCelebration={() => setShowCelebration(true)} />

        {/* 蓋章按鈕 */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-4 rounded-3xl text-white font-black text-lg active:scale-95 transition-all duration-200"
          style={{ background: 'linear-gradient(135deg, #8B0000, #CC0000)', boxShadow: '0 4px 20px rgba(139,0,0,0.5)' }}
        >
          蓋章 🔥
        </button>

        {/* 統計小卡 */}
        {stamps.length > 0 && (
          <div className="grid grid-cols-3 gap-3 animate-fadeIn">
            {getTopTypes(stamps).map(({ emoji, label, count }) => (
              <div key={label} className="bg-rage-card rounded-2xl p-3 text-center border border-rage-filled">
                <p className="text-2xl">{emoji}</p>
                <p className="text-xs text-gray-500 mt-1 leading-tight">{label}</p>
                <p className="text-lg font-black text-rage-accent">{count}</p>
              </div>
            ))}
          </div>
        )}

        {/* 歷史紀錄 */}
        <HistoryList stamps={stamps} onDelete={handleDeleteStamp} />

        {/* 設定區 */}
        <div className="bg-rage-card rounded-2xl border border-rage-filled divide-y divide-rage-filled">

          {/* 標題（可收折） */}
          <button
            onClick={() => { setShowSettings(!showSettings); setShowResetConfirm(false) }}
            className="w-full px-5 py-3 flex items-center justify-between hover:bg-rage-filled transition-colors rounded-t-2xl"
          >
            <span className="text-sm font-bold text-gray-400">⚙️ 設定</span>
            <span className="text-gray-600 text-xs">{showSettings ? '▲' : '▼'}</span>
          </button>

          {showSettings && <>
          {/* 目標格數 */}
          <div className="px-5 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">💀 爆發點（目標格數）</span>
              <select
                value={goal}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  if (stamps.length > val) {
                    if (!window.confirm(`⚠️ 你已蓋了 ${stamps.length} 章，調低到 ${val} 格會超標喔，確定要改嗎？`)) return
                  }
                  handleGoalChange(val)
                }}
                className="bg-rage-filled border border-rage-border text-rage-accent font-black text-base rounded-xl px-3 py-1 focus:outline-none cursor-pointer"
              >
                {GOAL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt} 格</option>
                ))}
              </select>
            </div>
          </div>

          {/* 視覺風格 */}
          <div className="px-5 py-4">
            <p className="text-sm text-gray-400 mb-3">🎨 視覺風格</p>
            <ThemeSwitcher themeId={themeId} onChange={onThemeChange} />
          </div>

          {/* 清除按鈕 */}
          {stamps.length > 0 && (
            showResetConfirm ? (
              <div className="px-5 py-4 space-y-3 animate-fadeIn">
                <p className="text-sm text-center text-gray-400">
                  確定要清除全部 <span className="text-rage-accent font-black">{stamps.length}</span> 點嗎？<br />
                  <span className="text-xs text-gray-600">刪除後無法復原</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2 rounded-xl border-2 border-rage-filled text-gray-500 text-sm font-medium hover:border-rage-border transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => { handleReset(); setShowResetConfirm(false) }}
                    className="flex-1 py-2 rounded-xl text-white text-sm font-black transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #8B0000, #CC0000)' }}
                  >
                    確定清除
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full text-xs text-gray-600 hover:text-rage-accent py-3 transition-colors"
              >
                🗑️ 清除所有集點，重新忍耐
              </button>
            )
          )}
          </>}
        </div>

      </main>

      <footer className="text-center py-6 text-xs text-gray-600">
        v1.0.0
      </footer>

      {showModal && (
        <AddStampModal
          onAdd={handleAddStamp}
          onClose={() => setShowModal(false)}
        />
      )}

      {showCelebration && (
        <CelebrationModal onReset={handleReset} onClose={() => setShowCelebration(false)} />
      )}
    </div>
  )
}

function getTopTypes(stamps) {
  const counts = {}
  stamps.forEach((s) => {
    const key = s.type
    if (!counts[key]) counts[key] = { emoji: s.emoji, label: s.label, count: 0 }
    counts[key].count++
  })
  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
}
