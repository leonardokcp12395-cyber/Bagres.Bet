import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import CountUp from 'react-countup';

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApostas: 0,
    volumeBloqueado: 0,
    potencialPerda: 0,
    ngr: 0
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      // In a real app, this should be done via a Postgres View or RPC function
      // for performance. For now, we aggregate on the client side.
      const { data: apostas, error } = await supabase
        .from('apostas')
        .select('valor_apostado, status, is_multipla, multipla_data');

      if (!error && apostas) {
        let volumeBloqueado = 0;
        let ngr = 0; // Net Gaming Revenue (Apostas perdidas - Apostas ganhas pagas)
        let potencialPerda = 0;

        apostas.forEach((aposta: any) => {
          if (aposta.status === 'pendente') {
            volumeBloqueado += aposta.valor_apostado;
            // Simple heuristic: assuming average odd of 2.0 for potential loss exposure
            potencialPerda += (aposta.valor_apostado * 2);
          } else if (aposta.status === 'perdeu') {
            ngr += aposta.valor_apostado; // Casa ganhou
          } else if (aposta.status === 'ganhou') {
            // Assume 2.0 odd average payout for demo purposes.
            // Ideally we'd store the actual odd in the `apostas` table.
            ngr -= (aposta.valor_apostado * 1); // Casa perdeu o lucro
          }
        });

        setStats({
          totalApostas: apostas.length,
          volumeBloqueado,
          potencialPerda,
          ngr
        });
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-green border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NGR Card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1 ${stats.ngr >= 0 ? 'bg-primary-green' : 'bg-red-500'}`}></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">NGR (Net Revenue)</h3>
              <p className="text-xs text-text-muted/60">Lucro real da Banca</p>
            </div>
            <TrendingUp className={`w-6 h-6 ${stats.ngr >= 0 ? 'text-primary-green' : 'text-red-500'}`} />
          </div>
          <div className={`text-3xl font-black tabular-nums ${stats.ngr >= 0 ? 'text-primary-green' : 'text-red-500'}`}>
            {stats.ngr >= 0 ? '+' : '-'}<CountUp end={Math.abs(stats.ngr)} duration={1.5} separator="." /> 🪙
          </div>
        </div>

        {/* Volume Bloqueado Card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">Volume Bloqueado</h3>
              <p className="text-xs text-text-muted/60">Moedas em apostas pendentes</p>
            </div>
            <BarChart3 className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-3xl font-black tabular-nums text-text-light">
            <CountUp end={stats.volumeBloqueado} duration={1.5} separator="." /> 🪙
          </div>
        </div>

        {/* Exposição/Risco Card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">Exposição Máxima (Estimativa)</h3>
              <p className="text-xs text-text-muted/60">Risco total se todos os usuários ganharem (Odd Média 2.0)</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="text-4xl font-black tabular-nums text-yellow-500">
            <CountUp end={stats.potencialPerda} duration={1.5} separator="." /> 🪙
          </div>

          <div className="mt-6 pt-6 border-t border-dark-border flex justify-between items-center text-sm">
            <span className="text-text-muted font-bold">Total de Tickets (Apostas)</span>
            <span className="text-text-light font-black">{stats.totalApostas}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
