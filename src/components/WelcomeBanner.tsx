import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const BANNER_STORAGE_KEY = 'bagre_bet_welcome_banner_last_seen';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const lastSeen = localStorage.getItem(BANNER_STORAGE_KEY);
    const now = Date.now();

    if (!lastSeen || now - parseInt(lastSeen, 10) > TWENTY_FOUR_HOURS) {
      // Break synchronous cycle
      setTimeout(() => setIsVisible(true), 0);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(BANNER_STORAGE_KEY, Date.now().toString());
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

            <img
              src="/src/assets/bannerEntrada.jpeg"
              alt="Bem-vindo ao Bagre.bet"
              className="w-full h-auto object-cover"
            />

            <div className="p-6 text-center">
              <h2 className="text-2xl font-black text-text-light mb-2">Bem-vindo ao Torneio!</h2>
              <p className="text-text-muted text-sm mb-6">
                Prepare seus palpites e mostre que você não é só mais um bagre no aquário.
              </p>

              <button
                onClick={handleClose}
                className="w-full py-4 bg-primary-green text-dark-bg font-bold rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] transition-all"
              >
                Bora Apostar!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
