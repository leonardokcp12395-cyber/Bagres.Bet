import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoIcon from '../assets/LogoIcon.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user has dismissed it before recently
      const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
      const now = Date.now();

      // If never dismissed, or dismissed more than 7 days ago
      if (!lastDismissed || now - parseInt(lastDismissed) > 7 * 24 * 60 * 60 * 1000) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-dark-card border border-dark-border p-4 rounded-2xl shadow-2xl z-[9999] flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <img src={logoIcon} alt="Bagre.bet" className="w-12 h-12 object-contain" />
            <div>
              <h3 className="font-bold text-text-light text-sm">Instalar Bagre.bet</h3>
              <p className="text-xs text-text-muted">Acesse mais rápido na tela inicial.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="bg-primary-green text-dark-bg px-3 py-2 rounded-xl text-xs font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]"
            >
              Instalar
            </button>
            <button onClick={handleDismiss} className="text-text-muted hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
