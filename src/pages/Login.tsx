import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle, Gamepad2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { fetchProfile } = useAuthStore();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const email = `${username.toLowerCase().trim()}@bagre.bet`;

      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        navigate('/dashboard');
      } else {
        // Registration flow
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          // Insert into profiles table
          const insertData = {
              id: signUpData.user.id,
              username: username.toLowerCase().trim(),
          };
          const { error: profileError } = await supabase.from('profiles').insert(insertData as any);

          if (profileError) {
             // Rollback: if profile insertion fails, we should ideally handle it or log it
             console.error('Failed to create profile:', profileError);
             throw new Error('Falha ao criar o perfil do usuário.');
          }

          await fetchProfile(signUpData.user.id);
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === 'Invalid login credentials') {
         setError('Usuário ou senha inválidos.');
      } else if (err.message.includes('User already registered')) {
         setError('Este nome de usuário já está em uso.');
      } else {
         setError(err.message || 'Ocorreu um erro durante a autenticação.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-primary-green/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-dark-card border-2 border-primary-green rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
             <Gamepad2 className="w-12 h-12 text-primary-green" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-text-light tracking-tight">
          Bagre.bet
        </h2>
        <p className="mt-2 text-center text-sm text-text-muted">
          {isLogin ? 'Entre para fazer seus palpites' : 'Crie sua conta e ganhe 1000 BagreCoins'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleAuth}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-muted mb-2">
                Nome de Usuário
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Seu nick no campeonato"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-muted mb-2">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="btn-primary mt-8 shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isLogin ? (
                <>
                  <LogIn className="w-5 h-5" /> Entrar
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" /> Cadastrar
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-card text-text-muted">Ou</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="w-full text-center text-sm text-text-muted hover:text-primary-green transition-colors font-medium"
              >
                {isLogin
                  ? 'Não tem uma conta? Cadastre-se'
                  : 'Já tem uma conta? Entre aqui'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
