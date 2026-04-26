import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBetSlipStore } from '../store/betSlip';
import { X, Trash2, ChevronUp, Receipt } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function BetSlip() {
  const { selections, removeSelection, clearSlip, getTotalOdds } = useBetSlipStore();
  const { user, profile, fetchProfile } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [valorInscrito, setValorInscrito] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const totalOdds = getTotalOdds();
  const potentialReturn = typeof valorInscrito === 'number' ? (valorInscrito * totalOdds).toFixed(2) : '0.00';
  const hasSelections = selections.length > 0;

  const handleSubmitBet = async () => {
    if (!user || !profile) {
      toast.error('Você precisa estar logado.');
      return;
    }

    if (typeof valorInscrito !== 'number' || valorInscrito <= 0) {
      toast.error('Insira um valor válido para apostar.');
      return;
    }

    if (profile.saldo_bagrecoins < valorInscrito) {
      toast.error('Saldo insuficiente.');
      return;
    }

    setLoading(true);

    try {
      // 1. Deduct balance
      const newBalance = profile.saldo_bagrecoins - valorInscrito;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ saldo_bagrecoins: newBalance } as never)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Saving as a Multiple Bet
      // We store the full JSON payload of the parlay inside `multipla_data`.
      // We use the first match ID as the primary key placeholder, but it represents the slip.
      const isMultipla = selections.length > 1;

      const { error: betError } = await supabase.from('apostas').insert({
        user_id: user.id,
        username_apostador: profile.username,
        partida_id: selections[0].partidaId,
        time_escolhido: isMultipla ? 'Múltipla' : selections[0].timeEscolhido,
        valor_apostado: valorInscrito,
        status: 'pendente',
        is_multipla: isMultipla,
        multipla_data: isMultipla ? selections : null
      } as any);

      if (betError) throw betError;

      await fetchProfile(user.id);
      clearSlip();
      setIsOpen(false);
      setValorInscrito('');
      toast.success('Múltipla registrada com sucesso!');

    } catch (err) {
      console.error(err);
      toast.error('Erro ao registrar aposta.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasSelections) return null;

  return (
    <>
      {/* Mobile Floating Button (Visible when closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-4 z-40 bg-primary-green text-dark-bg p-4 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2 font-black lg:hidden"
          >
            <Receipt className="w-6 h-6" />
            <span className="bg-dark-bg text-primary-green w-6 h-6 rounded-full text-xs flex items-center justify-center">
              {selections.length}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Slip Panel (Bottom Sheet on Mobile, Right Sidebar on Desktop) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 w-full bg-dark-card border-t border-dark-border z-50 rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] lg:top-0 lg:right-0 lg:left-auto lg:w-96 lg:h-screen lg:rounded-none lg:border-l lg:border-t-0"
            >
              {/* Header */}
              <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-bg/50 rounded-t-3xl lg:rounded-none">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary-green" />
                  <h3 className="font-black text-text-light uppercase tracking-wider">Cupom ({selections.length})</h3>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={clearSlip} className="text-text-muted hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-white transition-colors lg:hidden">
                    <ChevronUp className="w-6 h-6 rotate-180" />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="hidden lg:block text-text-muted hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Selections List */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {selections.map((sel) => (
                    <motion.div
                      key={sel.partidaId}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-dark-bg border border-dark-border p-3 rounded-xl relative"
                    >
                      <button
                        onClick={() => removeSelection(sel.partidaId)}
                        className="absolute top-2 right-2 text-text-muted hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="text-xs text-text-muted mb-1">{sel.timeA} vs {sel.timeB}</div>
                      <div className="flex justify-between items-end">
                        <span className="font-bold text-text-light">{sel.timeEscolhido}</span>
                        <span className="font-black text-primary-green">{sel.odd.toFixed(2)}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Footer / Input */}
              <div className="p-4 border-t border-dark-border bg-dark-bg/80">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-text-muted font-medium">Odd Total Múltipla</span>
                  <span className="text-2xl font-black text-primary-green tabular-nums">{totalOdds.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-bold">🪙</span>
                    <input
                      type="number"
                      value={valorInscrito}
                      onChange={(e) => setValorInscrito(Number(e.target.value) || '')}
                      placeholder="Valor"
                      className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-3 text-text-light font-bold focus:border-primary-green outline-none"
                    />
                  </div>
                  <div className="flex flex-col items-end flex-1">
                    <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Retorno Potencial</span>
                    <span className="font-black text-lg text-text-light tabular-nums">{potentialReturn}</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmitBet}
                  disabled={loading || !valorInscrito || selections.length === 0}
                  className="w-full py-4 bg-primary-green text-dark-bg font-black rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  {loading ? 'Processando...' : 'Confirmar Múltipla'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Trigger for Desktop (when closed) */}
      <AnimatePresence>
        {!isOpen && hasSelections && (
          <motion.button
            initial={{ x: 100 }}
            animate={{ x: 0 }}
            exit={{ x: 100 }}
            onClick={() => setIsOpen(true)}
            className="hidden lg:flex fixed top-24 right-0 z-40 bg-dark-card border-y border-l border-primary-green text-text-light py-4 px-3 rounded-l-2xl shadow-[-10px_0_30px_rgba(34,197,94,0.2)] flex-col items-center gap-3"
          >
            <Receipt className="w-5 h-5 text-primary-green" />
            <span className="font-black vertical-text [writing-mode:vertical-rl] rotate-180 tracking-widest text-sm">
              CUPOM ({selections.length})
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
