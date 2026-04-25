import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User as UserIcon, Edit2, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import { toast } from 'sonner';

export default function Profile() {
  const { profile, setUser, fetchProfile } = useAuthStore();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [savingUsername, setSavingUsername] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Erro ao sair da conta.');
    }
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim() || !profile) return;
    setSavingUsername(true);
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ username: newUsername.trim() })
        .eq('id', profile.id);

      if (error) throw error;
      toast.success('Perfil atualizado!');
      setIsEditing(false);
      await fetchProfile(profile.id);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar nome.');
    } finally {
      setSavingUsername(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="p-4 pt-8 min-h-screen flex flex-col items-center pb-24"
    >
      <div className="w-full max-w-md flex flex-col items-center mt-10">
        <div className="relative mb-6">
          <div className="w-32 h-32 bg-dark-card border-4 border-primary-green rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)] overflow-hidden">
            <UserIcon className="w-16 h-16 text-primary-green" />
          </div>
          {profile?.is_admin && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary-green text-dark-bg text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
              Admin
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2 mb-6 w-full max-w-xs">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="flex-1 bg-dark-card border border-dark-border text-text-light px-4 py-2 rounded-lg focus:outline-none focus:border-primary-green text-center font-bold"
              placeholder="Seu novo vulgo"
            />
            <button onClick={handleSaveUsername} disabled={savingUsername} className="p-2.5 bg-primary-green text-dark-bg rounded-lg hover:opacity-90">
              <Check className="w-5 h-5" />
            </button>
            <button onClick={() => { setIsEditing(false); setNewUsername(profile?.username || ''); }} className="p-2.5 bg-dark-card border border-dark-border text-text-muted hover:text-text-light rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-1 group">
            <h1 className="text-3xl font-black text-text-light">
              {profile?.username || 'Bagre Desconhecido'}
            </h1>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-text-muted hover:text-primary-green hover:bg-dark-card rounded-md transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}

        <p className="text-text-muted mb-10 text-sm">Pronto para o próximo green?</p>

        <div className="w-full bg-dark-card border border-dark-border rounded-3xl p-8 mb-8 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-green to-transparent opacity-50"></div>
          <p className="text-text-muted text-sm font-bold uppercase tracking-widest mb-2">
            Saldo Atual
          </p>
          <div className="text-5xl font-black text-primary-green tabular-nums drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">
            <CountUp
              end={Number(profile?.saldo_bagrecoins) || 0}
              duration={2}
              separator="."
              preserveValue={true}
            />
            <span className="text-3xl ml-2 opacity-80">🪙</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold uppercase tracking-wider transition-all"
        >
          <LogOut className="w-5 h-5" /> Sair da Conta
        </button>
      </div>
    </motion.div>
  );
}
