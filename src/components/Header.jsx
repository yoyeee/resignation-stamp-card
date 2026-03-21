import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

export default function Header({ user }) {
  const handleLogout = async () => {
    await signOut(auth)
  }

  return (
    <header className="bg-rage-card border-b-2 border-rage-border sticky top-0 z-10"
            style={{ boxShadow: '0 2px 12px rgba(139,0,0,0.3)' }}>
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💢</span>
          <span className="font-black text-rage-accent tracking-wide">離職集點卡</span>
        </div>
        <div className="flex items-center gap-3">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="avatar"
              className="w-8 h-8 rounded-full border-2 border-rage-border"
            />
          )}
          <span className="text-sm text-gray-300 hidden sm:block">
            {user.isAnonymous ? '訪客' : user.displayName?.split(' ')[0]}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-500 hover:text-rage-accent transition-colors"
          >
            登出
          </button>
        </div>
      </div>
    </header>
  )
}
