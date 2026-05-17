import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { History as HistoryIcon, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface GameSession {
  sessionId: string;
  guess: string;
  won: boolean;
  createdAt: any;
}

const History: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const sessionsRef = collection(db, 'sessions');
        const q = query(
          sessionsRef, 
          where('userId', '==', user.uid), 
          orderBy('createdAt', 'desc'), 
          limit(20)
        );
        const querySnapshot = await getDocs(q);
        const fetchedSessions = querySnapshot.docs.map(doc => doc.data() as GameSession);
        setSessions(fetchedSessions);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (!user) return <div className="text-center py-20 text-slate-500">Sign in to view your battle history.</div>;
  if (loading) return <div className="text-center py-20 text-slate-500">Retrieving records...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto glass-card p-6"
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <HistoryIcon className="text-blue-500 w-7 h-7" />
        Recent Battles
      </h2>

      {sessions.length === 0 ? (
        <div className="text-center py-10 text-slate-500 italic">No games played yet. Challenge me!</div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div 
              key={session.sessionId} 
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${session.won ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {session.won ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-bold text-white leading-tight">Guessed: {session.guess}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {session.createdAt?.toDate?.() ? session.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </p>
                </div>
              </div>
              
              <div className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${session.won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {session.won ? 'Genius Won' : 'Player Won'}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default History;
