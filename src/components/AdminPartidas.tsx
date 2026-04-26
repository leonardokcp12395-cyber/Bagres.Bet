import { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { teamsData } from '../utils/teamsData';
import { getTeamLogoUrl } from '../utils/teamLogos';
import { toast } from 'sonner';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/solid';


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

  // Multiplicadores
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
      const { error } = await (supabase as any).from('partidas').insert([
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
