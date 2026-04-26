import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon } from 'lucide-react';
import bannerImg from '../assets/bannerEntrada.jpeg';

const BANNER_STORAGE_KEY = 'bagre_bet_welcome_banner_session_seen';

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check sessionStorage instead of localStorage so it shows once per session/tab
    const hasSeenInSession = sessionStorage.getItem(BANNER_STORAGE_KEY);

    if (!hasSeenInSession) {
      // Break synchronous cycle to avoid react warnings
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem(BANNER_STORAGE_KEY, 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-dark-card rounded-2xl overflow-hidden shadow-2xl border border-dark-border"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>

            {bannerImg ? (
              <div className="relative w-full h-48 bg-dark-bg border-b border-dark-border">
                <img
                  src={bannerImg}
                  alt="Bem-vindo ao Bagre.bet"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    // Show a fallback icon gracefully inside the parent container when image crashes
                    e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                    e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<div class="text-primary-green opacity-50"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>');
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-48 bg-dark-bg flex items-center justify-center border-b border-dark-border">
                <ImageIcon className="w-12 h-12 text-primary-green opacity-50" />
              </div>
            )}

            <div className="p-6 text-center">
              <h2 className="text-2xl font-black text-text-light mb-2">Bem-vindo ao Torneio!</h2>
              <p className="text-text-muted text-sm mb-6">
                Prepare seus palpites e mostre que você não é só mais um bagre no aquário.
              </p>

              <button
                onClick={handleClose}
                className="w-full py-4 bg-primary-green text-dark-bg font-bold rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] transition-all"
              >
                Bora Palpitar!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
