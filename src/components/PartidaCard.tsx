import { useDynamicOdds } from '../hooks/useDynamicOdds';
import { getTeamLogoUrl } from '../utils/teamLogos';
import { motion } from 'framer-motion';
import type { Database } from '../types/supabase';

type PartidaRow = Database['public']['Tables']['partidas']['Row'];

interface PartidaCardProps {
  partida: PartidaRow;
  onBetClick: (partida: PartidaRow, time: string, odd: number) => void;
}

export function PartidaCard({ partida, onBetClick }: PartidaCardProps) {
  const { oddA, oddB, loading } = useDynamicOdds(
    partida.id,
    partida.odd_a,
    partida.odd_b,
    partida.time_a,
    partida.time_b
  );

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
            initial={{ scale: 1.2, color: '#22c55e' }}
            animate={{ scale: 1, color: '#e5e7eb' }}
            className="text-lg font-black text-text-light"
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
            initial={{ scale: 1.2, color: '#22c55e' }}
            animate={{ scale: 1, color: '#e5e7eb' }}
            className="text-lg font-black text-text-light"
          >
            {loading ? '...' : oddB.toFixed(2)}
          </motion.span>
          <span className="text-xs font-bold text-text-muted text-right">Vitória<br/>{partida.time_b}</span>
        </button>
      </div>
    </div>
  );
}
