import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Trophy, Medal, Award } from 'lucide-react';
import { motion } from 'motion/react';

interface LeaderboardUser {
  uid: string;
  name: string;
  gamesWon: number;
  accuracy: number;
}

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('gamesWon', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const fetchedUsers = querySnapshot.docs.map(doc => doc.data() as LeaderboardUser);
        setUsers(fetchedUsers);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading champions...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto glass-card overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Trophy className="text-ipl-gold w-8 h-8" />
          Global Hall of Fame
        </h2>
      </div>

      <div className="p-0">
        {users.length === 0 ? (
          <div className="p-10 text-center text-slate-500 italic">No legends recorded yet. Start playing!</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-500 text-xs uppercase tracking-widest bg-slate-900/30">
                <th className="px-6 py-4 font-semibold">Rank</th>
                <th className="px-6 py-4 font-semibold">Player</th>
                <th className="px-6 py-4 font-semibold text-right">Victories</th>
                <th className="px-6 py-4 font-semibold text-right">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr 
                  key={user.uid} 
                  className={`border-b border-white/5 transition-colors hover:bg-white/5 ${index === 0 ? 'bg-ipl-gold/5' : ''}`}
                >
                  <td className="px-6 py-4 font-bold">
                    {index === 0 && <Medal className="inline w-5 h-5 text-ipl-gold mr-2" />}
                    {index === 1 && <Award className="inline w-5 h-5 text-slate-300 mr-2" />}
                    {index === 2 && <Award className="inline w-5 h-5 text-amber-600 mr-2" />}
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-white">{user.name}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-blue-400 font-bold">{user.gamesWon}</td>
                  <td className="px-6 py-4 text-right font-mono text-slate-400">{user.accuracy?.toFixed(1) || 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
};

export default Leaderboard;
