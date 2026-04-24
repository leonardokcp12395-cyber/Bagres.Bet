import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Info } from 'lucide-react';
import type { Database } from '../types/supabase';

type ApostaRow = Database['public']['Tables']['apostas']['Row'];

export function LiveFeed() {
  const [recentBets, setRecentBets] = useState<ApostaRow[]>([]);
  const [lastActivity, setLastActivity] = useState<number>(0);

  useEffect(() => {
    // Initial fetch of the last 3 bets
    const fetchInitialBets = async () => {
      const { data, error } = await supabase
        .from('apostas')
        .select('*')
        .order('id', { ascending: false })
        .limit(3);

      if (data && !error) {
        setRecentBets(data);
      }
    };

    fetchInitialBets();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'apostas' },
        (payload) => {
          const newBet = payload.new as ApostaRow;
          setRecentBets((prev) => [newBet, ...prev].slice(0, 3));
          setLastActivity(Date.now());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Repeat last 3 if idle for 5 mins (300000 ms)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > 300000 && recentBets.length > 0) {
        // Just force a re-render to trigger animation, or simulate a new "arrival"
        // by rotating the array slightly to keep it fresh.
        setRecentBets((prev) => {
          const arr = [...prev];
          const last = arr.pop();
          if (last) arr.unshift(last);
          return arr;
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastActivity, recentBets]);

  if (recentBets.length === 0) {
    return (
      <div className="w-full bg-dark-card border border-dark-border rounded-xl p-4 flex items-center justify-center gap-3 shadow-lg">
        <Info className="text-text-muted w-5 h-5" />
        <p className="text-text-muted text-sm italic font-medium">
          👀 Aguardando o primeiro bagre abrir a carteira...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-lg">
      <div className="bg-dark-bg/50 px-4 py-2 border-b border-dark-border flex items-center gap-2">
        <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
        <h3 className="text-xs font-bold text-text-light uppercase tracking-wider">Radar de Apostas</h3>
      </div>
      <div className="relative h-14 overflow-hidden flex items-center px-4">
        <AnimatePresence mode="popLayout">
          {recentBets.map((bet, index) => (
            <motion.div
              key={`${bet.id}-${index}-${lastActivity}`} // Force remount for animation on rotation
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute left-4 right-4 flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary-green">{bet.username_apostador}</span>
                <span className="text-text-muted">apostou</span>
                <span className="font-bold text-text-light">{bet.valor_apostado} 🪙</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-text-muted">no</span>
                <span className="font-bold text-orange-400">{bet.time_escolhido}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
