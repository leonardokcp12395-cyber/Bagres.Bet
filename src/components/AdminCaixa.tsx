import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, Minus, CheckCircle, XCircle } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  saldo_bagrecoins: number;
}

export function AdminCaixa() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, saldo_bagrecoins')
          .ilike('username', `%${searchTerm}%`)
          .limit(5);

        if (!error && data) {
          setSearchResults(data);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateBalance = async (type: 'add' | 'remove') => {
    if (!selectedUser || typeof amount !== 'number' || amount <= 0) return;

    try {
      const newBalance = type === 'add'
        ? selectedUser.saldo_bagrecoins + amount
        : Math.max(0, selectedUser.saldo_bagrecoins - amount);

      const { error } = await supabase
        .from('profiles')
        .update({ saldo_bagrecoins: newBalance } as never)
        .eq('id', selectedUser.id);

      if (error) throw error;

      setSelectedUser({ ...selectedUser, saldo_bagrecoins: newBalance });
      showToast(`Saldo de ${amount} ${type === 'add' ? 'adicionado a' : 'removido de'} ${selectedUser.username} com sucesso`, 'success');
      setAmount('');
    } catch (err: any) {
      console.error(err);
      showToast('Erro ao atualizar saldo.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
          toast.type === 'success' ? 'bg-green-600/90' : 'bg-red-600/90'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />}
          <span className="text-white font-medium text-sm">{toast.message}</span>
        </div>
      )}

      <div className="bg-dark-card border border-dark-border rounded-2xl p-4">
        <h2 className="text-xl font-bold text-text-light mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-primary-green" /> Buscar Usuário
        </h2>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedUser(null); // Reset selection when typing
            }}
            placeholder="Digite o vulgo (ex: bagre123)..."
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-text-light placeholder-text-muted focus:border-primary-green outline-none"
          />

          {searchResults.length > 0 && !selectedUser && (
            <div className="absolute top-full left-0 w-full mt-2 bg-dark-card border border-dark-border rounded-xl shadow-xl overflow-hidden z-10">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user);
                    setSearchTerm(user.username);
                    setSearchResults([]);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-dark-bg flex justify-between items-center transition-colors border-b border-dark-border last:border-0"
                >
                  <span className="font-bold text-text-light">{user.username}</span>
                  <span className="text-sm text-text-muted">{user.saldo_bagrecoins} 🪙</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-text-light">Gerenciar {selectedUser.username}</h3>
            <span className="bg-dark-bg px-3 py-1 rounded-full text-primary-green font-black">
              {selectedUser.saldo_bagrecoins} 🪙
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || '')}
              placeholder="Valor da transação..."
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-text-light placeholder-text-muted focus:border-primary-green outline-none text-center text-xl font-bold"
            />

            <div className="flex gap-3">
              <button
                onClick={() => handleUpdateBalance('remove')}
                disabled={!amount || amount <= 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
              >
                <Minus className="w-5 h-5" /> Remover
              </button>
              <button
                onClick={() => handleUpdateBalance('add')}
                disabled={!amount || amount <= 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-green/10 border border-primary-green/50 text-primary-green rounded-xl font-bold hover:bg-primary-green hover:text-dark-bg transition-all disabled:opacity-50"
              >
                <Plus className="w-5 h-5" /> Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
