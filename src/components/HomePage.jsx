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

export default function HomePage({ user }) {
  const [stamps, setStamps] = useState([])
  const [goal, setGoal] = useState(DEFAULT_GOAL)
  const [showModal, setShowModal] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrated, setCelebrated] = useState(false)

  const stampsRef = collection(db, 'users', user.uid, 'stamps')
  const settingsRef = doc(db, 'users', user.uid, 'meta', 'settings')

  // 載入設定（目標格數）
  useEffect(() => {
    getDoc(settingsRef).then((snap) => {
      if (snap.exists() && snap.data().goal) {
        setGoal(snap.data().goal)
      }
    })
  }, [user.uid])

  // 即時同步 Firestore 資料
  useEffect(() => {
    const q = query(stampsRef, orderBy('createdAt', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      setStamps(data)
    })
    return unsubscribe
  }, [user.uid])

  // 達標時顯示慶祝
  useEffect(() => {
    if (stamps.length >= goal && stamps.length > 0 && !celebrated) {
      setShowCelebration(true)
      setCelebrated(true)
    }
  }, [stamps.length, goal, celebrated])

  const GOAL_OPTIONS = [5, 10, 20, 30, 50, 100]

  // 儲存目標格數到 Firestore
  const handleGoalChange = async (newGoal) => {
    setGoal(newGoal)
    setCelebrated(false)
    await setDoc(settingsRef, { goal: newGoal }, { merge: true })
  }

  const handleAddStamp = async (stampData) => {
    await addDoc(stampsRef, {
      type: stampData.id,
      emoji: stampData.emoji,
      label: stampData.label,
      description: stampData.description || '',
      createdAt: stampData.customDate
        ? Timestamp.fromDate(stampData.customDate)
        : serverTimestamp(),
    })
    setShowModal(false)
  }

  // 刪除單筆蓋章
  const handleDeleteStamp = async (stampId) => {
    await deleteDoc(doc(db, 'users', user.uid, 'stamps', stampId))
  }

  const handleReset = async () => {
    const snapshot = await getDocs(stampsRef)
    const deletes = snapshot.docs.map((d) => deleteDoc(doc(db, 'users', user.uid, 'stamps', d.id)))
    await Promise.all(deletes)
    setCelebrated(false)
    setShowCelebration(false)
  }

  return (
    <div className="min-h-screen bg-rage-bg">
      <Header user={user} />

      <main className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* 問候語 */}
        <div className="text-center py-2 animate-fadeIn">
          <p className="text-gray-500 text-sm">
            嗨，<span className="text-rage-accent font-bold">{user.displayName?.split(' ')[0]}</span>！今天又被虐了嗎？ 🩸
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
          又他媽的來了 🔥
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

          {/* 清除按鈕 */}
          {stamps.length > 0 && (
            <button
              onClick={handleReset}
              className="w-full text-xs text-gray-600 hover:text-rage-accent py-3 transition-colors"
            >
              🗑️ 清除所有集點，重新忍耐
            </button>
          )}
        </div>
      </main>

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
