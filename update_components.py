import re

# Update AdminPartidas.tsx to include the Combobox and Custom Team fallback
admin_partidas_content = """import { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { teamsData } from '../utils/teamsData';
import { getTeamLogoUrl } from '../utils/teamLogos';
import { toast } from 'sonner';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, ShieldAlert } from '@heroicons/react/24/solid';

export function AdminPartidas() {
  const [loading, setLoading] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  // Time A state
  const [queryA, setQueryA] = useState('');
  const [selectedTeamA, setSelectedTeamA] = useState(teamsData[0] || null);
  const [customNameA, setCustomNameA] = useState('');

  // Time B state
  const [queryB, setQueryB] = useState('');
  const [selectedTeamB, setSelectedTeamB] = useState(teamsData[1] || null);
  const [customNameB, setCustomNameB] = useState('');

  // Odds
  const [oddA, setOddA] = useState('1.5');
  const [oddB, setOddB] = useState('2.5');

  const filteredTeamsA = useMemo(() => {
    return queryA === ''
      ? teamsData
      : teamsData.filter((team) =>
          team.name.toLowerCase().includes(queryA.toLowerCase())
        );
  }, [queryA]);

  const filteredTeamsB = useMemo(() => {
    return queryB === ''
      ? teamsData
      : teamsData.filter((team) =>
          team.name.toLowerCase().includes(queryB.toLowerCase())
        );
  }, [queryB]);

  const handleCreatePartida = async () => {
    if (loading) return;

    const finalTeamA = isCustom ? customNameA : selectedTeamA?.name;
    const finalTeamB = isCustom ? customNameB : selectedTeamB?.name;

    const logoA = (!isCustom && selectedTeamA) ? getTeamLogoUrl(selectedTeamA.leagueFolder, selectedTeamA.id) : null;
    const logoB = (!isCustom && selectedTeamB) ? getTeamLogoUrl(selectedTeamB.leagueFolder, selectedTeamB.id) : null;

    if (!finalTeamA || !finalTeamB) {
      toast.error('Preencha os dois times!');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('partidas').insert([
        {
          time_a: finalTeamA,
          time_b: finalTeamB,
          logo_time_a: logoA,
          logo_time_b: logoB,
          odd_a: Number(oddA),
          odd_b: Number(oddB),
          status: 'aberta'
        }
      ]);

      if (error) throw error;
      toast.success('Partida criada com sucesso!');

      // Reset
      setCustomNameA('');
      setCustomNameB('');
      setOddA('1.5');
      setOddB('2.5');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro ao criar partida');
    } finally {
      setLoading(false);
    }
  };

  const TeamCombobox = ({ selected, setSelected, setQuery, filteredTeams, label }: any) => (
    <Combobox value={selected} onChange={setSelected}>
      <div className="relative mt-1">
        <label className="text-sm font-bold text-text-muted mb-2 block">{label}</label>
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-dark-bg text-left border border-dark-border focus-within:border-primary-green transition-colors sm:text-sm">
          <Combobox.Input
            className="w-full border-none py-3 pl-3 pr-10 text-sm leading-5 text-text-light bg-transparent focus:ring-0 focus:outline-none"
            displayValue={(team: any) => team?.name || ''}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>
        </div>
        <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-dark-card py-1 text-base shadow-lg border border-dark-border ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {filteredTeams.length === 0 && (
            <div className="relative cursor-default select-none py-2 px-4 text-text-muted">
              Nenhum time encontrado.
            </div>
          )}
          {filteredTeams.map((team: any) => (
            <Combobox.Option
              key={team.id}
              className={({ active }) =>
                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                  active ? 'bg-primary-green/20 text-primary-green' : 'text-text-light'
                }`
              }
              value={team}
            >
              {({ selected, active }) => (
                <>
                  <div className="flex items-center gap-3">
                    <img
                      src={getTeamLogoUrl(team.leagueFolder, team.id)}
                      alt={team.name}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        (e.target as any).style.display = 'none';
                      }}
                    />
                    <div className="flex flex-col">
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {team.name}
                      </span>
                      <span className="text-[10px] text-text-muted">{team.leagueName}</span>
                    </div>
                  </div>
                  {selected ? (
                    <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-primary-green' : 'text-primary-green'}`}>
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  ) : null}
                </>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </div>
    </Combobox>
  );

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-text-light">Nova Partida</h2>
        <button
          onClick={() => setIsCustom(!isCustom)}
          className={`text-xs px-3 py-1.5 rounded-full font-bold border transition-colors ${isCustom ? 'bg-primary-green/20 text-primary-green border-primary-green' : 'border-dark-border text-text-muted hover:text-text-light'}`}
        >
          {isCustom ? 'Modo Normal' : 'Time Personalizado'}
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isCustom ? (
            <>
              <div>
                <label className="text-sm font-bold text-text-muted mb-2 block">Nome Time A (Personalizado)</label>
                <input
                  type="text"
                  value={customNameA}
                  onChange={(e) => setCustomNameA(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-text-light focus:outline-none focus:border-primary-green transition-colors"
                  placeholder="Ex: Amigos do Zé"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-text-muted mb-2 block">Nome Time B (Personalizado)</label>
                <input
                  type="text"
                  value={customNameB}
                  onChange={(e) => setCustomNameB(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-text-light focus:outline-none focus:border-primary-green transition-colors"
                  placeholder="Ex: Real Matismo"
                />
              </div>
            </>
          ) : (
            <>
              <TeamCombobox label="Time A" selected={selectedTeamA} setSelected={setSelectedTeamA} setQuery={setQueryA} filteredTeams={filteredTeamsA} />
              <TeamCombobox label="Time B" selected={selectedTeamB} setSelected={setSelectedTeamB} setQuery={setQueryB} filteredTeams={filteredTeamsB} />
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
            <label className="text-sm font-bold text-text-muted mb-2 block">Odd Inicial Time A</label>
            <input
              type="number"
              step="0.01"
              value={oddA}
              onChange={(e) => setOddA(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-text-light focus:outline-none focus:border-primary-green transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-text-muted mb-2 block">Odd Inicial Time B</label>
            <input
              type="number"
              step="0.01"
              value={oddB}
              onChange={(e) => setOddB(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-4 text-text-light focus:outline-none focus:border-primary-green transition-colors"
            />
          </div>
        </div>

        <button
          onClick={handleCreatePartida}
          disabled={loading}
          className="w-full bg-primary-green text-dark-bg font-black uppercase tracking-wider py-4 rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 mt-4"
        >
          {loading ? 'Criando...' : 'Criar Partida'}
        </button>
      </div>
    </div>
  );
}
"""
with open('src/components/AdminPartidas.tsx', 'w') as f:
    f.write(admin_partidas_content)

# Update Profile.tsx to include an edit username button
profile_content = """import { useState } from 'react';
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
      const { error } = await supabase
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
"""
with open('src/pages/Profile.tsx', 'w') as f:
    f.write(profile_content)
