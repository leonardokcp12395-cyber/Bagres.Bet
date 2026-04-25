import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Copy, CheckCircle, Wallet } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/format';

const PACOTES = [
  { id: 1, nome: 'Bagre de Aquário', valor: 5, coins: 50 },
  { id: 2, nome: 'Bagre de Represa', valor: 10, coins: 110 },
  { id: 3, nome: 'Bagre Titular', valor: 20, coins: 230 },
  { id: 4, nome: 'Bagre Europeu', valor: 25, coins: 300 },
  { id: 5, nome: 'Lobo do PIX', valor: 40, coins: 500 },
  { id: 6, nome: 'Tubarão de Poça', valor: 50, coins: 650 },
  { id: 7, nome: 'Mago das ODDs', valor: 75, coins: 1000 },
  { id: 8, nome: 'O Dono do Rio', valor: 100, coins: 1500 },
];

const CHAVE_PIX = "000.000.000-00"; // Substitua pela sua chave real

export default function Loja() {
  const { profile, user } = useAuthStore();
  const [selectedPackage, setSelectedPackage] = useState<typeof PACOTES[0] | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(CHAVE_PIX);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPackage || !user || !profile) return;

    setLoading(true);
    try {
      const { error } = await (supabase as any).from('compras').insert({
        user_id: user.id,
        username: profile.username,
        pacote_nome: selectedPackage.nome,
        valor_real: selectedPackage.valor,
        moedas_recebidas: selectedPackage.coins,
        status: 'pendente'
      });

      if (error) throw error;

      toast.success('Compra registrada! Aguardando confirmação do pagamento.', { duration: 5000 });
      setSelectedPackage(null);
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao registrar compra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 pt-8 pb-24 min-h-screen"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-dark-card rounded-xl border border-dark-border shadow-[0_0_15px_rgba(34,197,94,0.2)]">
          <ShoppingCart className="w-6 h-6 text-primary-green" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-text-light uppercase tracking-wide">Loja do Bagre</h1>
          <p className="text-sm text-text-muted">Compre moedas e vire lenda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PACOTES.map((pacote) => (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            key={pacote.id}
            onClick={() => setSelectedPackage(pacote)}
            className="bg-dark-card border border-dark-border rounded-2xl p-5 flex items-center justify-between hover:border-primary-green transition-colors group relative overflow-hidden"
          >
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary-green/5 rounded-full blur-2xl group-hover:bg-primary-green/10 transition-colors"></div>

            <div className="flex flex-col items-start z-10">
              <span className="font-black text-lg text-text-light mb-1">{pacote.nome}</span>
              <span className="text-sm text-text-muted font-bold flex items-center gap-1">
                Recebe: <span className="text-primary-green">{pacote.coins} 🪙</span>
              </span>
            </div>

            <div className="z-10 bg-dark-bg px-4 py-2 rounded-xl border border-dark-border group-hover:border-primary-green/50 transition-colors">
              <span className="font-black text-primary-green">{formatCurrency(pacote.valor)}</span>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPackage(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card border border-dark-border rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-text-light">Finalizar Compra</h2>
                <button
                  onClick={() => setSelectedPackage(null)}
                  className="w-8 h-8 flex items-center justify-center bg-dark-bg rounded-full text-text-muted hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="bg-dark-bg rounded-2xl p-4 mb-6 border border-dark-border text-center">
                <p className="text-text-muted text-sm font-bold mb-1">Pacote Selecionado</p>
                <p className="text-2xl font-black text-primary-green mb-2">{selectedPackage.nome}</p>
                <p className="text-text-light font-bold">Total: {formatCurrency(selectedPackage.valor)}</p>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-text-muted text-center font-bold">
                  1. Pague com PIX (Copia e Cola)
                </p>

                <button
                  onClick={handleCopyPix}
                  className="w-full flex items-center justify-between p-4 bg-dark-bg border border-dark-border rounded-xl hover:border-primary-green transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-primary-green" />
                    <span className="font-mono text-text-light">{CHAVE_PIX}</span>
                  </div>
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-primary-green" />
                  ) : (
                    <Copy className="w-5 h-5 text-text-muted group-hover:text-primary-green" />
                  )}
                </button>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mt-4">
                  <p className="text-xs text-yellow-500 text-center font-bold">
                    ⚠️ Importante: Após fazer o pagamento via PIX, clique no botão abaixo para avisar o sistema. O Admin validará seu pagamento e creditará as moedas.
                  </p>
                </div>

                <button
                  onClick={handleConfirmPurchase}
                  disabled={loading}
                  className="w-full mt-4 py-4 bg-primary-green text-dark-bg font-black rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 uppercase"
                >
                  {loading ? 'Registrando...' : 'Já Paguei, Confirmar Compra'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
