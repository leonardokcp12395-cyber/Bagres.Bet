import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';
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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setError('Falha ao autenticar com o Google.');
      setLoading(false);
    }
  };

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
          <img src="/src/assets/LogoIcon.png" alt="Bagre.bet Logo" className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse" />
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-text-light tracking-tight">
          Bagre.bet
        </h2>
        <p className="mt-2 text-center text-sm text-text-muted">
          {isLogin ? 'Já é um apostador? Entre agora' : 'Primeira vez aqui? Crie seu usuário'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-8 px-4 sm:px-10">
          {/* Tabs */}
          <div className="flex mb-8 bg-dark-bg/50 p-1 rounded-lg">
            <button
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                isLogin ? 'bg-dark-card text-primary-green shadow-sm' : 'text-text-muted hover:text-text-light'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                !isLogin ? 'bg-dark-card text-primary-green shadow-sm' : 'text-text-muted hover:text-text-light'
              }`}
            >
              Cadastro
            </button>
          </div>

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
                <span className="px-2 bg-dark-card text-text-muted">Ou continuar com</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-dark-border rounded-lg bg-white text-gray-800 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green focus:ring-offset-dark-bg transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
