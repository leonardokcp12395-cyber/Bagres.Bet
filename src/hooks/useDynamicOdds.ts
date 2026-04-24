import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface OddsResult {
  oddA: number;
  oddB: number;
  loading: boolean;
  trendA: 'up' | 'down' | 'neutral';
  trendB: 'up' | 'down' | 'neutral';
}

export function useDynamicOdds(partidaId: string, initialOddA: number, initialOddB: number, timeA: string, timeB: string): OddsResult {
  const [odds, setOdds] = useState<OddsResult>({
    oddA: initialOddA,
    oddB: initialOddB,
    loading: true,
    trendA: 'neutral',
    trendB: 'neutral',
  });

  useEffect(() => {
    let isMounted = true;

    const calculateOdds = async () => {
      try {
        const { data, error } = await supabase
          .from('apostas')
          .select('time_escolhido, valor_apostado')
          .eq('partida_id', partidaId);

        if (error) throw error;

        if (!isMounted) return;

        if (!data || data.length === 0) {
          setOdds({ oddA: initialOddA, oddB: initialOddB, loading: false, trendA: 'neutral', trendB: 'neutral' });
          return;
        }

        let totalA = 0;
        let totalB = 0;
        let totalPartida = 0;

        data.forEach((aposta: any) => {
          totalPartida += aposta.valor_apostado;
          if (aposta.time_escolhido === timeA) {
            totalA += aposta.valor_apostado;
          } else if (aposta.time_escolhido === timeB) {
            totalB += aposta.valor_apostado;
          }
        });

        // Calculate dynamic odds: Total_Apostado_na_Partida / Total_Apostado_no_Time
        // Minimum margin: 1.1
        let calcOddA = totalA > 0 ? totalPartida / totalA : initialOddA;
        let calcOddB = totalB > 0 ? totalPartida / totalB : initialOddB;

        calcOddA = Math.max(1.1, Number(calcOddA.toFixed(2)));
        calcOddB = Math.max(1.1, Number(calcOddB.toFixed(2)));

        setOdds((prev) => {
          let trendA: 'up' | 'down' | 'neutral' = 'neutral';
          let trendB: 'up' | 'down' | 'neutral' = 'neutral';

          if (!prev.loading) {
            if (calcOddA > prev.oddA) trendA = 'up';
            if (calcOddA < prev.oddA) trendA = 'down';
            if (calcOddB > prev.oddB) trendB = 'up';
            if (calcOddB < prev.oddB) trendB = 'down';
          }

          return { oddA: calcOddA, oddB: calcOddB, loading: false, trendA, trendB };
        });

      } catch (err) {
        console.error('Failed to calculate dynamic odds:', err);
        if (isMounted) {
            setOdds({ oddA: initialOddA, oddB: initialOddB, loading: false, trendA: 'neutral', trendB: 'neutral' });
        }
      }
    };

    calculateOdds();

    // Listen for new bets on this specific match
    const channel = supabase
      .channel(`odds-partida-${partidaId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'apostas', filter: `partida_id=eq.${partidaId}` },
        () => {
          // Recalculate odds when a new bet arrives
          calculateOdds();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [partidaId, initialOddA, initialOddB, timeA, timeB]);

  return odds;
}
