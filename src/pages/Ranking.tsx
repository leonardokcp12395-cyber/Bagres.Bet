import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import CountUp from 'react-countup';
import { Skeleton } from '../components/Skeleton';

interface Profile {
  id: string;
  username: string;
  saldo_bagrecoins: number;
}

export default function Ranking() {
  const [ranking, setRanking] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchRanking = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, saldo_bagrecoins')
        .order('saldo_bagrecoins', { ascending: false })
        .limit(50); // Get top 50

      if (!error && data) {
        setRanking(data);
      }
      setLoading(false);
    };

    fetchRanking();
  }, []);

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return 'border-yellow-400 bg-yellow-400/10 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]';
      case 1:
        return 'border-gray-300 bg-gray-300/10 text-gray-300 shadow-[0_0_15px_rgba(209,213,219,0.2)]';
      case 2:
        return 'border-amber-700 bg-amber-700/10 text-amber-700 shadow-[0_0_15px_rgba(180,83,9,0.2)]';
      default:
        return 'border-dark-border bg-dark-card text-text-light';
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1: return <Medal className="w-6 h-6 text-gray-300" />;
      case 2: return <Medal className="w-6 h-6 text-amber-700" />;
      default: return <span className="font-bold text-text-muted w-6 text-center">{index + 1}º</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="p-4 pt-8 min-h-screen"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-dark-card rounded-xl border border-dark-border shadow-[0_0_15px_rgba(34,197,94,0.2)]">
          <Trophy className="w-6 h-6 text-primary-green" />
        </div>
        <h1 className="text-2xl font-black text-text-light uppercase tracking-wide">
          Ranking Global
        </h1>
      </div>

      <div className="flex flex-col gap-3 pb-24">
        {loading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))
        ) : (
          ranking.map((profile, index) => {
            const isMe = profile.id === user?.id;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={profile.id}
                className={`flex items-center justify-between p-4 rounded-xl border ${getRankStyle(index)} ${isMe ? 'ring-2 ring-primary-green ring-offset-2 ring-offset-dark-bg' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-base flex items-center gap-2">
                      {profile.username}
                      {isMe && <span className="text-[10px] bg-primary-green text-dark-bg px-2 py-0.5 rounded-full font-black uppercase">Você</span>}
                    </span>
                  </div>
                </div>
                <div className="font-black text-lg tabular-nums">
                  <CountUp
                    end={profile.saldo_bagrecoins}
                    duration={1.5}
                    separator="."
                    preserveValue={true}
                  /> <span className="text-sm opacity-80">🪙</span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
