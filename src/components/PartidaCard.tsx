import { useDynamicOdds } from '../hooks/useDynamicOdds';
import { getTeamLogoUrl } from '../utils/teamLogos';
import { motion } from 'framer-motion';
import type { Database } from '../types/supabase';

type PartidaRow = Database['public']['Tables']['partidas']['Row'];

interface PartidaCardProps {
  partida: PartidaRow;
  onBetClick: (partida: PartidaRow, time: string, odd: number) => void;
}

import { useEffect, useState } from 'react';

export function PartidaCard({ partida, onBetClick }: PartidaCardProps) {
  const { oddA, oddB, loading, trendA, trendB } = useDynamicOdds(
    partida.id,
    partida.odd_a,
    partida.odd_b,
    partida.time_a,
    partida.time_b
  );

  // Use local state to handle the flash timeout
  const [flashA, setFlashA] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [flashB, setFlashB] = useState<'up' | 'down' | 'neutral'>('neutral');

  useEffect(() => {
    if (trendA !== 'neutral') {
      setFlashA(trendA);
      const t = setTimeout(() => setFlashA('neutral'), 1000);
      return () => clearTimeout(t);
    }
  }, [trendA, oddA]);

  useEffect(() => {
    if (trendB !== 'neutral') {
      setFlashB(trendB);
      const t = setTimeout(() => setFlashB('neutral'), 1000);
      return () => clearTimeout(t);
    }
  }, [trendB, oddB]);

  const getFlashClass = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return 'bg-green-500/20 text-green-400';
    if (trend === 'down') return 'bg-red-500/20 text-red-400';
    return 'text-text-light';
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-4 shadow-lg flex flex-col gap-4">
      <div className="flex justify-between items-center px-4">
        {/* Time A */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <img
            src={getTeamLogoUrl(partida.time_a)}
            alt={partida.time_a}
            className="w-12 h-12 rounded-full object-cover border-2 border-dark-bg"
          />
          <span className="text-sm font-bold text-center text-text-light">{partida.time_a}</span>
        </div>

        {/* VS */}
        <div className="px-4 py-1 bg-dark-bg rounded-full text-xs font-bold text-text-muted">
          VS
        </div>

        {/* Time B */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <img
            src={getTeamLogoUrl(partida.time_b)}
            alt={partida.time_b}
            className="w-12 h-12 rounded-full object-cover border-2 border-dark-bg"
          />
          <span className="text-sm font-bold text-center text-text-light">{partida.time_b}</span>
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        <button
          onClick={() => onBetClick(partida, partida.time_a, oddA)}
          disabled={partida.finalizada}
          className="flex-1 flex justify-between items-center px-4 py-3 bg-dark-bg border border-dark-border rounded-xl hover:border-primary-green hover:bg-primary-green/10 transition-colors disabled:opacity-50"
        >
          <span className="text-xs font-bold text-text-muted text-left">Vitória<br/>{partida.time_a}</span>
          <motion.span
            key={`oddA-${oddA}`}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`text-lg font-black px-2 py-0.5 rounded transition-colors duration-300 ${getFlashClass(flashA)}`}
          >
            {loading ? '...' : oddA.toFixed(2)}
          </motion.span>
        </button>

        <button
          onClick={() => onBetClick(partida, partida.time_b, oddB)}
          disabled={partida.finalizada}
          className="flex-1 flex justify-between items-center px-4 py-3 bg-dark-bg border border-dark-border rounded-xl hover:border-primary-green hover:bg-primary-green/10 transition-colors disabled:opacity-50"
        >
          <motion.span
            key={`oddB-${oddB}`}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`text-lg font-black px-2 py-0.5 rounded transition-colors duration-300 ${getFlashClass(flashB)}`}
          >
            {loading ? '...' : oddB.toFixed(2)}
          </motion.span>
          <span className="text-xs font-bold text-text-muted text-right">Vitória<br/>{partida.time_b}</span>
        </button>
      </div>
    </div>
  );
}
