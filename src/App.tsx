import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/auth';
import { OfflineOverlay } from './components/OfflineOverlay';

import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import MinhasApostas from './pages/MinhasApostas';
import Ranking from './pages/Ranking';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Loja from './pages/Loja';
import { MainLayout } from './layouts/MainLayout';
import { Toaster, toast } from 'sonner';
import { PwaPrompt } from './components/PwaPrompt';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If user is authenticated but has no profile, force onboarding
  if (!profile && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { setUser, fetchProfile } = useAuthStore();

  useEffect(() => {
    // Global Real-time Listener for Bets
    const globalApostasChannel = supabase
      .channel('global-apostas')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'apostas' },
        (payload) => {
          const novaAposta = payload.new as any;
          const time = novaAposta.is_multipla ? 'uma Múltipla' : novaAposta.time_escolhido;

          toast(`🔥 ${novaAposta.username_apostador} apostou em ${time}!`, {
            style: {
              background: 'rgba(13, 14, 18, 0.95)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              border: '1px solid #22c55e',
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)',
            },
            duration: 4000,
          });
        }
      )
      .subscribe();

    // Single source of truth para Auth (Resolve o Race Condition)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        if (useAuthStore.getState().profile?.id !== session.user.id) {
          useAuthStore.setState({ loading: true });
          fetchProfile(session.user.id);
        }
      } else {
        useAuthStore.setState({ profile: null, loading: false });
      }
    });

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(globalApostasChannel);
    };
  }, [setUser, fetchProfile]);

  return (
    <BrowserRouter>
        <PwaPrompt />
        <Toaster theme="dark" position="top-center" />
        <OfflineOverlay />
        <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      {/* Main Layout Wrapper for Dashboard, Apostas, Ranking, Perfil */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/minhas-apostas" element={<MinhasApostas />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/loja" element={<Loja />} />
      </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
