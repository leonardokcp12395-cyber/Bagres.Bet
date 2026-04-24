import { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminCaixa } from '../components/AdminCaixa';
import { AdminPartidas } from '../components/AdminPartidas';
import { AdminAnalytics } from '../components/AdminAnalytics';
import { ArrowLeft } from 'lucide-react';

export default function Admin() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'analytics' | 'partidas' | 'caixa'>('analytics');

  if (!profile?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 pt-8 min-h-screen bg-dark-bg flex flex-col"
    >
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-dark-card rounded-full border border-dark-border text-text-muted hover:text-text-light">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-black text-text-light">Painel Admin</h1>
      </div>

      <div className="flex bg-dark-card border border-dark-border p-1 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-lg transition-colors ${
            activeTab === 'analytics' ? 'bg-dark-bg text-primary-green shadow' : 'text-text-muted hover:text-text-light'
          }`}
        >
          Risco
        </button>
        <button
          onClick={() => setActiveTab('partidas')}
          className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-lg transition-colors ${
            activeTab === 'partidas' ? 'bg-dark-bg text-primary-green shadow' : 'text-text-muted hover:text-text-light'
          }`}
        >
          Partidas
        </button>
        <button
          onClick={() => setActiveTab('caixa')}
          className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-lg transition-colors ${
            activeTab === 'caixa' ? 'bg-dark-bg text-primary-green shadow' : 'text-text-muted hover:text-text-light'
          }`}
        >
          Caixa
        </button>
      </div>

      <div className="flex-grow">
        {activeTab === 'analytics' && <AdminAnalytics />}
        {activeTab === 'partidas' && <AdminPartidas />}
        {activeTab === 'caixa' && <AdminCaixa />}
      </div>
    </motion.div>
  );
}
