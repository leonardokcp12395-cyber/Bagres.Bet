import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

export default function Onboarding() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setLoading(true);

    try {
      const cleanUsername = username.toLowerCase().trim();

      const insertData = {
        id: user.id,
        username: cleanUsername,
        saldo_bagrecoins: 0, // Starts with 0
      };

      const { error: profileError } = await supabase.from('profiles').insert(insertData as any);

      if (profileError) {
        if (profileError.code === '23505') { // Unique violation
          throw new Error('Esse vulgo já está em uso por outro bagre.');
        }
        throw profileError;
      }

      await fetchProfile(user.id);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao salvar seu vulgo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-primary-green/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="flex justify-center mb-6">
          <img src="/src/assets/LogoIcon.png" alt="Bagre.bet Logo" className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-pulse" />
        </div>
        <h2 className="text-3xl font-extrabold text-text-light tracking-tight mb-2">
          Escolha seu Vulgo
        </h2>
        <p className="text-text-muted">
          Como os outros apostadores vão te conhecer no torneio?
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-sm text-red-500 text-center">{error}</p>
              </div>
            )}

            <div>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-dark-bg border-2 border-dark-border rounded-xl px-4 py-4 text-center text-xl text-text-light placeholder-text-muted focus:border-primary-green focus:ring-1 focus:ring-primary-green outline-none transition-all"
                placeholder="Digite seu Nickname"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-dark-bg bg-primary-green hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green focus:ring-offset-dark-bg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin"></div>
              ) : (
                <>
                  Entrar no Torneio <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
