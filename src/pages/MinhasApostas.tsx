import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ListOrdered, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

interface ApostaComPartida {
  id: string;
  time_escolhido: string;
  valor_apostado: number;
  status: 'pendente' | 'ganhou' | 'perdeu';
  partidas: {
    time_a: string;
    time_b: string;
  };
}

export default function MinhasApostas() {
  const [apostas, setApostas] = useState<ApostaComPartida[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchApostas = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('apostas')
        .select(`
          id,
          time_escolhido,
          valor_apostado,
          status,
          partidas (
            time_a,
            time_b
          )
        `)
        .eq('user_id', user.id)
        .order('id', { ascending: false });

      if (!error && data) {
        // Supondo que a junção retorne um objeto para `partidas`
        setApostas(data as unknown as ApostaComPartida[]);
      }
      setLoading(false);
    };

    fetchApostas();
  }, [user]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ganhou':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
          style: 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] bg-dark-card',
          label: 'Ganhou',
          textClass: 'text-green-400'
        };
      case 'perdeu':
        return {
          icon: <XCircle className="w-5 h-5 text-red-500/50" />,
          style: 'border-red-900/50 bg-dark-bg/50 opacity-75',
          label: 'Perdeu',
          textClass: 'text-red-500/80'
        };
      default:
        return {
          icon: <Clock className="w-5 h-5 text-yellow-500" />,
          style: 'border-yellow-500/50 bg-dark-card',
          label: 'Pendente',
          textClass: 'text-yellow-500'
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="p-4 pt-8 min-h-screen"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-dark-card rounded-xl border border-dark-border shadow-[0_0_15px_rgba(34,197,94,0.2)]">
          <ListOrdered className="w-6 h-6 text-primary-green" />
        </div>
        <h1 className="text-2xl font-black text-text-light uppercase tracking-wide">
          Minhas Apostas
        </h1>
      </div>

      <div className="flex flex-col gap-4 pb-24">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-dark-card border border-dark-border rounded-xl animate-pulse"></div>
          ))
        ) : apostas.length === 0 ? (
          <div className="text-center py-10 text-text-muted">
            Você ainda não fez nenhuma aposta.
          </div>
        ) : (
          apostas.map((aposta, index) => {
            const config = getStatusConfig(aposta.status);
            return (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={aposta.id}
                className={`p-4 rounded-2xl border ${config.style} transition-all`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="text-sm font-bold text-text-muted">
                    {aposta.partidas.time_a} <span className="text-xs font-normal px-1">vs</span> {aposta.partidas.time_b}
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${config.textClass}`}>
                    {config.icon}
                    {config.label}
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs text-text-muted mb-1">Seu Palpite</div>
                    <div className="font-bold text-text-light text-lg">
                      {aposta.time_escolhido}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-text-muted mb-1">Apostado</div>
                    <div className="font-black text-primary-green text-xl">
                      {aposta.valor_apostado} 🪙
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
