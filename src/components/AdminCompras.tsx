import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/format';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Compra {
  id: string;
  user_id: string;
  username: string;
  pacote_nome: string;
  valor_real: number;
  moedas_recebidas: number;
  status: string;
  created_at: string;
}

export function AdminCompras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompras = async () => {
    const { data, error } = await (supabase as any).from('compras').select('*').order('created_at', { ascending: false });

    if (!error && data) {
      setCompras(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    const isMounted = true;

    const loadCompras = async () => {
      const { data, error } = await (supabase as any).from('compras').select('*').order('created_at', { ascending: false });

      if (!error && data && isMounted) {
        setCompras(data);
      }
      if (isMounted) setLoading(false);
    };

    loadCompras();

    const channel = (supabase as any)
      .channel('admin_compras')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'compras' }, () => {
        fetchCompras();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (compra: Compra) => {
    try {
      // 1. Update compra status
      const { error: compraError } = await (supabase as any)
        .from('compras')
        .update({ status: 'aprovado' } as never)
        .eq('id', compra.id);

      if (compraError) throw compraError;

      // 2. Fetch current balance
      const { data: profile, error: profileFetchError } = await (supabase as any)
        .from('profiles')
        .select('saldo_bagrecoins')
        .eq('id', compra.user_id)
        .single();

      if (profileFetchError) throw profileFetchError;

      // 3. Add coins
      const newBalance = Number((profile as any).saldo_bagrecoins || 0) + compra.moedas_recebidas;

      const { error: profileUpdateError } = await (supabase as any)
        .from('profiles')
        .update({ saldo_bagrecoins: newBalance } as never)
        .eq('id', compra.user_id);

      if (profileUpdateError) throw profileUpdateError;

      toast.success(`Compra de ${compra.username} aprovada e moedas creditadas!`);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao aprovar compra');
    }
  };

  const handleReject = async (compra: Compra) => {
    try {
      const { error } = await (supabase as any)
        .from('compras')
        .update({ status: 'recusado' } as never)
        .eq('id', compra.id);

      if (error) throw error;
      toast.success('Compra recusada com sucesso.');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao recusar compra');
    }
  };

  if (loading) return <div className="text-center py-10">Carregando compras...</div>;

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
      <h2 className="text-xl font-bold text-text-light mb-6">Aprovações de Loja (PIX)</h2>

      {compras.length === 0 ? (
        <p className="text-text-muted text-center">Nenhuma compra registrada.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {compras.map(compra => (
            <div key={compra.id} className="bg-dark-bg border border-dark-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-text-light">{compra.username}</span>
                <span className="text-sm text-text-muted">{compra.pacote_nome} ({compra.moedas_recebidas} 🪙)</span>
                <span className="text-xs text-text-muted/60">{new Date(compra.created_at).toLocaleString('pt-BR')}</span>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6">
                <span className="font-black text-primary-green">{formatCurrency(compra.valor_real)}</span>

                {compra.status === 'pendente' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(compra)}
                      className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                      title="Recusar"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleApprove(compra)}
                      className="p-2 bg-primary-green/10 text-primary-green rounded-lg hover:bg-primary-green hover:text-dark-bg transition-colors"
                      title="Aprovar e Creditar"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                    compra.status === 'aprovado' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {compra.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
