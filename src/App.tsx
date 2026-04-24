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
import { MainLayout } from './layouts/MainLayout';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

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
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        useAuthStore.setState({ loading: false });
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        useAuthStore.setState({ profile: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, fetchProfile]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
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
    </ErrorBoundary>
  );
}

export default App;
