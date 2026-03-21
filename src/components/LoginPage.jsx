import { useState } from 'react'
import { signInWithPopup, signInAnonymously } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

function isInAppBrowser() {
  const ua = navigator.userAgent || ''
  return /Line\/|LineBrowser|FBAN|FBAV|FB_IAB|FB4A|FBIOS|Instagram|MicroMessenger|LinkedInApp|Twitter/i.test(ua)
}

function getAppName() {
  const ua = navigator.userAgent || ''
  if (/Line\/|LineBrowser/i.test(ua)) return 'LINE'
  if (/FBAN|FBAV|FB_IAB|FB4A|FBIOS/i.test(ua)) return 'Facebook / Messenger'
  if (/Instagram/i.test(ua)) return 'Instagram'
  if (/MicroMessenger/i.test(ua)) return 'WeChat'
  if (/LinkedInApp/i.test(ua)) return 'LinkedIn'
  if (/Twitter/i.test(ua)) return 'Twitter / X'
  return 'App'
}

function InAppWarning() {
  const url = window.location.href
  const appName = getAppName()
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    // 先嘗試 clipboard API
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => setCopied(true))
        .catch(() => fallbackCopy())
    } else {
      fallbackCopy()
    }
  }

  const fallbackCopy = () => {
    // 用隱藏 textarea + execCommand 作為備用
    try {
      const el = document.createElement('textarea')
      el.value = url
      el.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
      document.body.appendChild(el)
      el.focus()
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
    } catch {
      // 最後備援：用 prompt 讓使用者手動複製
      window.prompt('請長按並複製以下連結，貼到 Safari 或 Chrome 開啟：', url)
    }
  }

  return (
    <div className="min-h-screen bg-rage-bg flex items-center justify-center p-4">
      <div className="bg-rage-card border-2 rounded-3xl p-8 w-full max-w-sm text-center animate-fadeIn"
           style={{ borderColor: '#CC2222', boxShadow: '0 0 60px rgba(255,51,51,0.35)' }}>
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-xl font-black text-rage-accent mb-2">無法在此登入</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          偵測到你正在使用 <span className="text-rage-accent font-bold">{appName}</span> 的內建瀏覽器。<br />
          Google 登入需要在 <span className="text-white font-bold">Safari 或 Chrome</span> 中開啟。
        </p>
        <p className="text-gray-500 text-xs mb-5 leading-relaxed">
          點下方按鈕複製連結，再到 <span className="text-white">Safari 或 Chrome</span> 貼上網址即可登入 🙏
        </p>
        <button
          onClick={copyLink}
          className="w-full py-3 rounded-2xl font-black text-white transition-all"
          style={{ background: copied ? 'linear-gradient(135deg, #1a5c1a, #2d8a2d)' : 'linear-gradient(135deg, #8B0000, #CC0000)', boxShadow: '0 4px 15px rgba(139,0,0,0.5)' }}
        >
          {copied ? '已複製！去瀏覽器貼上吧 ✅' : '複製連結 🔗'}
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  if (isInAppBrowser()) return <InAppWarning />

  const [showAnonWarning, setShowAnonWarning] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('登入失敗', err)
      alert('登入失敗，請再試一次 😢')
    }
  }

  const handleAnonymousLogin = async () => {
    try {
      await signInAnonymously(auth)
    } catch (err) {
      console.error('訪客登入失敗', err)
      alert('訪客登入失敗，請再試一次 😢')
    }
  }

  return (
    <div className="min-h-screen bg-rage-bg flex items-center justify-center p-4">
      <div className="bg-rage-card border-2 rounded-3xl p-8 w-full max-w-sm text-center animate-fadeIn"
           style={{ borderColor: '#CC2222', boxShadow: '0 0 60px rgba(255,51,51,0.35), 0 0 20px rgba(180,0,0,0.5)' }}>

        {/* Logo */}
        <div className="text-7xl mb-4">💢</div>

        {/* 標題 */}
        <h1 className="text-2xl font-black text-rage-accent mb-1 tracking-wide">離職集點卡</h1>
        <p className="text-gray-400 text-sm mb-8">
          蒐集每一個忍無可忍的瞬間<br />
          集滿就提離職！ 🔥
        </p>

        {/* 示範集點格 */}
        <div className="flex justify-center gap-2 mb-8">
          {['😤','😩','🌙','🤡','🥧'].map((emoji, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full bg-rage-filled border-2 border-rage-border flex items-center justify-center text-lg"
            >
              {emoji}
            </div>
          ))}
        </div>

        {/* Google 登入按鈕 */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-rage-card border-2 border-rage-border rounded-2xl py-3 px-4 text-gray-200 font-medium hover:border-rage-accent hover:bg-rage-filled transition-all duration-200 shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          使用 Google 帳號登入
        </button>

        {/* 分隔線 */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-rage-filled" />
          <span className="text-xs text-gray-600">或</span>
          <div className="flex-1 h-px bg-rage-filled" />
        </div>

        {/* 訪客試用 */}
        {!showAnonWarning ? (
          <button
            onClick={() => setShowAnonWarning(true)}
            className="w-full py-3 rounded-2xl text-gray-500 text-sm border-2 border-rage-filled hover:border-rage-border hover:text-gray-400 transition-all duration-200"
          >
            先試用看看 👀
          </button>
        ) : (
          <div className="border-2 border-yellow-800 rounded-2xl p-4 text-left animate-fadeIn"
               style={{ background: 'rgba(120,80,0,0.15)' }}>
            <p className="text-yellow-500 text-xs font-bold mb-1">⚠️ 訪客模式注意事項</p>
            <p className="text-gray-400 text-xs leading-relaxed mb-3">
              資料存在這台裝置上。清除瀏覽器資料、換裝置或換瀏覽器後，<span className="text-yellow-400 font-bold">集點記錄將永久消失</span>，無法恢復。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAnonWarning(false)}
                className="flex-1 py-2 rounded-xl text-xs text-gray-500 border border-rage-filled hover:border-rage-border transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAnonymousLogin}
                className="flex-1 py-2 rounded-xl text-xs text-yellow-400 border border-yellow-800 hover:bg-yellow-900/20 transition-colors font-bold"
              >
                我了解，繼續試用
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-600 mt-4">登入即表示你同意用這個 app 發洩上班怒火 😤</p>
      </div>
    </div>
  )
}
