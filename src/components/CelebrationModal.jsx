export default function CelebrationModal({ onReset, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
         onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="bg-rage-card border-2 border-rage-accent rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-fadeIn"
           style={{ boxShadow: '0 0 40px rgba(255,51,51,0.4)' }}>
        <div className="text-7xl mb-4 animate-celebrate">🔥</div>
        <h2 className="text-2xl font-black text-rage-accent mb-2">集滿了！</h2>
        <p className="text-gray-400 text-sm mb-2">
          你已經忍了很久了，每一點都是真實的憤怒
        </p>
        <p className="text-rage-accent font-black mb-6 text-lg">是時候提離職了！ 💀</p>

        <div className="space-y-3">
          <a
            href="https://www.google.com/search?q=職缺"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 rounded-2xl font-black text-white hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #8B0000, #CC0000)', boxShadow: '0 4px 15px rgba(139,0,0,0.5)' }}
          >
            去找下一份工作 →
          </a>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl border-2 border-rage-filled text-gray-500 font-medium hover:border-rage-border transition-colors"
          >
            先關掉思考一下
          </button>
        </div>
      </div>
    </div>
  )
}
