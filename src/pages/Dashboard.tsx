import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveFeed } from '../components/LiveFeed';
import { PartidaCard } from '../components/PartidaCard';
import { Skeleton } from '../components/Skeleton';
import { Footer } from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import type { Database } from '../types/supabase';
import { AlertOctagon } from 'lucide-react';

type PartidaRow = Database['public']['Tables']['partidas']['Row'];

export default function Dashboard() {
  const { profile } = useAuthStore();
  const [partidas, setPartidas] = useState<PartidaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const isBankrupt = profile?.saldo_bagrecoins === 0;

  useEffect(() => {
    const fetchPartidas = async () => {
      const { data, error } = await supabase
        .from('partidas')
        .select('*')
        .order('finalizada', { ascending: true }); // Active first

      if (!error && data) {
        setPartidas(data);
      }
      setLoading(false);
    };

    fetchPartidas();

    const channel = supabase
      .channel('partidas-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partidas' }, () => {
        fetchPartidas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleBetClick = (partida: PartidaRow, time: string, odd: number) => {
    if (isBankrupt) return;
    // Implementação do modal/BottomSheet de aposta virá depois
    console.log(`Bet on ${time} at ${odd} in match ${partida.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className={`p-4 pt-8 min-h-screen flex flex-col gap-6 transition-all duration-700 ${
        isBankrupt ? 'grayscale' : ''
      }`}
    >
      <AnimatePresence>
        {isBankrupt && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-red-600/90 backdrop-blur-md border-b-4 border-red-800 p-4 shadow-2xl flex items-center justify-center gap-3"
          >
            <AlertOctagon className="w-8 h-8 text-white animate-pulse" />
            <p className="text-white font-black text-sm text-center uppercase tracking-wider">
              🚨 VOCÊ FALIU! Procure o Admin para mendigar moedas ou vá lavar uma louça.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={isBankrupt ? 'mt-16' : ''}>
        <LiveFeed />
      </div>

      <div className="flex items-center justify-between mt-2">
        <h2 className="text-xl font-bold text-text-light">Partidas Abertas</h2>
        <div className="flex items-center gap-2 bg-dark-card px-3 py-1 rounded-full border border-dark-border">
          <span className="text-xs text-text-muted">Seu Saldo:</span>
          <span className={`font-bold ${isBankrupt ? 'text-red-500' : 'text-primary-green'}`}>
            {profile?.saldo_bagrecoins} 🪙
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 pb-12">
        {loading ? (
          <>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </>
        ) : partidas.length === 0 ? (
          <div className="text-center py-10 text-text-muted">
            Nenhuma partida encontrada.
          </div>
        ) : (
          partidas.map((partida) => (
            <PartidaCard
              key={partida.id}
              partida={partida}
              onBetClick={handleBetClick}
            />
          ))
        )}
      </div>

      <Footer />
    </motion.div>
  );
}
