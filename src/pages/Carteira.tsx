import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import { motion } from 'framer-motion';
import { Wallet, ArrowDownToLine, ArrowUpFromLine, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function Carteira() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const isFetchingRef = useRef(false);

  // Deposito state
  const [activePixConfig, setActivePixConfig] = useState<{chave_pix_ativa: string, nome_titular: string} | null>(null);
  const [selectedPacote, setSelectedPacote] = useState<{nome: string, reais: number, moedas: number} | null>(null);
  const [isDepositing, setIsDepositing] = useState(false);

  // Saque Form
  const [saqueAmount, setSaqueAmount] = useState<string>('');
  const [pixKey, setPixKey] = useState<string>('');

  const REAIS_PER_BAGRECOIN = 0.2; // 5 BagreCoins = R$ 1.00

  const fetchBalance = useCallback(async () => {
    if (!user || isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('saldo_bagrecoins')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
          setBalance((data as any).saldo_bagrecoins);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Erro ao carregar saldo');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
        if (!user || isFetchingRef.current) return;
        try {
          isFetchingRef.current = true;
          if (isMounted) setIsLoading(true);

          const { data: configData } = await supabase
            .from('config_pagamento')
            .select('chave_pix_ativa, nome_titular')
            .eq('id', 1)
            .single();

          if (configData && isMounted) {
            setActivePixConfig(configData as any);
          }

          const { data, error } = await supabase
            .from('profiles')
            .select('saldo_bagrecoins')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          if (isMounted && data) setBalance((data as any).saldo_bagrecoins);
        } catch (error) {
          console.error('Error fetching data:', error);
          if (isMounted) toast.error('Erro ao carregar dados');
        } finally {
          if (isMounted) setIsLoading(false);
          isFetchingRef.current = false;
        }
    };

    loadData();

    // Subscribe to balance changes
    let subscription: ReturnType<typeof supabase.channel> | null = null;

    if (user) {
      subscription = supabase
        .channel('public:profiles')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, (payload: any) => {
          if (isMounted && payload.new) setBalance(payload.new.saldo_bagrecoins);
        })
        .subscribe();
    }

    return () => {
      isMounted = false;
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [user]);

  const handleDeposit = (pacoteNome: string, valorReais: number, moedas: number) => {
    setSelectedPacote({ nome: pacoteNome, reais: valorReais, moedas: moedas });
  };

  const confirmarDeposito = async () => {
    if (!user || !selectedPacote) return;

    try {
      setIsDepositing(true);
      const { error } = await supabase.from('depositos_pendentes').insert({
        user_id: user.id,
        pacote_nome: selectedPacote.nome,
        valor_reais: selectedPacote.reais,
        moedas_recebidas: selectedPacote.moedas,
        status: 'pendente'
      } as never);

      if (error) throw error;

      toast.success('Pagamento notificado! Aguarde a aprovação do administrador.');
      setSelectedPacote(null);
    } catch (error) {
      console.error('Erro ao notificar depósito:', error);
      toast.error('Erro ao notificar depósito. Tente novamente.');
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || balance === null) return;

    const amount = Number(saqueAmount);

    if (isNaN(amount) || amount < 50) {
      toast.error('O valor mínimo para saque é de 50 BagreCoins');
      return;
    }

    if (amount > balance) {
      toast.error('Saldo insuficiente');
      return;
    }

    if (!pixKey.trim()) {
      toast.error('Informe a chave PIX');
      return;
    }

    try {
      setIsWithdrawing(true);
      const valorReais = amount * REAIS_PER_BAGRECOIN;

      const { error } = await supabase.rpc('solicitar_saque' as any, {
        p_user_id: user.id,
        p_valor_bagrecoins: amount,
        p_valor_reais: valorReais,
        p_chave_pix: pixKey
      } as any);

      if (error) throw error;

      toast.success('Solicitação de saque enviada com sucesso!');
      setSaqueAmount('');
      setPixKey('');

      fetchBalance();
    } catch (error: any) {
      console.error('Error requesting withdrawal:', error);
      toast.error(error.message || 'Erro ao solicitar saque');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const reaisBalance = balance !== null ? balance * REAIS_PER_BAGRECOIN : 0;
  const saqueReais = Number(saqueAmount) && !isNaN(Number(saqueAmount)) ? Number(saqueAmount) * REAIS_PER_BAGRECOIN : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <div className="flex items-center gap-3 mb-8">
        <Wallet className="w-8 h-8 text-[#00E676]" />
        <h1 className="text-3xl font-bold font-heading uppercase">Sua Carteira</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1 bg-surface border border-white/10 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E676]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <h2 className="text-white/60 font-medium mb-2">Saldo Atual</h2>

          {isLoading ? (
            <div className="space-y-2">
              <div className="h-10 w-32 bg-white/10 rounded animate-pulse"></div>
              <div className="h-6 w-24 bg-white/5 rounded animate-pulse"></div>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-bold font-mono tabular-nums text-white">
                  {balance?.toLocaleString('pt-BR')}
                </span>
                <span className="text-white/60 mb-1 font-medium">BC</span>
              </div>
              <div className="text-lg text-[#00E676] font-medium font-mono tabular-nums">
                ~ R$ {reaisBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </>
          )}
        </div>

        <div className="md:col-span-2 bg-surface border border-white/10 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-[#00E676]" />
            Adicionar Fundos (Aquisição de Pontos)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleDeposit('Pacote Bagrinho', 10, 50)}
              className="bg-black/30 border border-white/5 rounded-lg p-4 hover:border-[#00E676]/50 hover:bg-[#00E676]/5 transition-all text-left"
            >
              <div className="text-white/60 text-sm mb-1">Bagrinho</div>
              <div className="font-bold text-xl text-white mb-2 font-mono">50 BC</div>
              <div className="text-[#00E676] font-medium">R$ 10,00</div>
            </button>

            <button
              onClick={() => handleDeposit('Pacote Bagre Titular', 20, 100)}
              className="bg-black/30 border border-[#00E676]/30 rounded-lg p-4 hover:border-[#00E676] hover:bg-[#00E676]/10 transition-all text-left relative"
            >
              <div className="absolute -top-3 -right-3 bg-[#00E676] text-black text-xs font-bold px-2 py-1 rounded-full uppercase">
                Popular
              </div>
              <div className="text-white/60 text-sm mb-1">Bagre Titular</div>
              <div className="font-bold text-xl text-white mb-2 font-mono">100 BC</div>
              <div className="text-[#00E676] font-medium">R$ 20,00</div>
            </button>

            <button
              onClick={() => handleDeposit('Pacote Bagre Lenda', 50, 250)}
              className="bg-black/30 border border-white/5 rounded-lg p-4 hover:border-[#00E676]/50 hover:bg-[#00E676]/5 transition-all text-left"
            >
              <div className="text-white/60 text-sm mb-1">Bagre Lenda</div>
              <div className="font-bold text-xl text-white mb-2 font-mono">250 BC</div>
              <div className="text-[#00E676] font-medium">R$ 50,00</div>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-white/10 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <ArrowUpFromLine className="w-5 h-5 text-red-400" />
          Sacar Fundos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-white/60 mb-6 text-sm">
              Converta seus BagreCoins em dinheiro real. O saque é processado via PIX e pode levar até 24h para cair na sua conta.
              <br /><br />
              <strong className="text-white">Taxa de conversão:</strong> 5 BC = R$ 1,00
              <br />
              <strong className="text-white">Saque mínimo:</strong> 50 BC (R$ 10,00)
            </p>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  Valor em BagreCoins a sacar
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    step="1"
                    value={saqueAmount}
                    onChange={(e) => setSaqueAmount(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#00E676] transition-colors font-mono tabular-nums"
                    placeholder="Ex: 100"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 font-mono">
                    BC
                  </div>
                </div>
                {saqueReais > 0 && (
                  <div className="mt-2 text-sm text-[#00E676] flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    Você receberá: <strong className="font-mono tabular-nums">R$ {saqueReais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  Chave PIX
                </label>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#00E676] transition-colors"
                  placeholder="CPF, E-mail, Celular ou Chave Aleatória"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isWithdrawing || !saqueAmount || !pixKey}
                className="w-full bg-[#00E676] hover:bg-[#00c968] text-black font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWithdrawing ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ArrowUpFromLine className="w-5 h-5" />
                    Solicitar Saque
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-black/30 rounded-xl p-6 border border-white/5">
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Regras de Saque
            </h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
                <span>O titular da conta PIX deve ser o mesmo cadastrado na plataforma.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
                <span>Pagamentos são processados todos os dias úteis.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
                <span>Para sua segurança, saques acima de 1.000 BC podem exigir verificação manual.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
                <span>O saldo será deduzido imediatamente da sua conta ao solicitar.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de Depósito (Checkout Manual) */}
      {selectedPacote && activePixConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Finalizar Aquisição</h3>
            <p className="text-white/60 text-sm mb-6">
              Transfira o valor exato para a chave PIX abaixo. Após o pagamento, clique em "Notificar Pagamento".
            </p>

            <div className="bg-dark-bg rounded-lg p-4 mb-6 border border-white/5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Pacote:</span>
                <span className="text-white font-bold">{selectedPacote.nome}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Valor:</span>
                <span className="text-[#00E676] font-bold font-mono">R$ {selectedPacote.reais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="bg-[#00E676]/10 border border-[#00E676]/20 rounded-lg p-4 mb-6 relative">
               <div className="text-xs text-[#00E676] mb-1 font-bold uppercase tracking-wider">Chave PIX (Copia e Cola)</div>
               <div className="text-white font-mono break-all text-sm">{activePixConfig.chave_pix_ativa}</div>
               <div className="mt-2 text-xs text-white/50">Titular: {activePixConfig.nome_titular}</div>
            </div>

            <div className="flex gap-3 mt-8">
               <button
                 onClick={() => setSelectedPacote(null)}
                 disabled={isDepositing}
                 className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
               >
                 Cancelar
               </button>
               <button
                 onClick={confirmarDeposito}
                 disabled={isDepositing}
                 className="flex-1 bg-[#00E676] hover:bg-[#00c968] text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
               >
                 {isDepositing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                 Notificar Pagamento
               </button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}
