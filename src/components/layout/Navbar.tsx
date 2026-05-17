import React from 'react';
import { Trophy, History, Shield, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  setView: (view: 'home' | 'leaderboard' | 'history') => void;
  currentView: string;
}

const Navbar: React.FC<NavbarProps> = ({ setView, currentView }) => {
  const { user, login, logout } = useAuth();

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-white/10 relative z-50 bg-slate-950/40 backdrop-blur-md">
      <button onClick={() => setView('home')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 bg-gradient-to-tr from-amber-400 to-blue-600 rounded-lg flex items-center justify-center font-black text-slate-900 shadow-[0_0_15px_rgba(251,191,36,0.4)]">
          G
        </div>
        <span className="font-bold tracking-tighter text-xl uppercase">
          IPL <span className="text-amber-400">Genius</span>
        </span>
      </button>

      <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-bold">
        <button 
          onClick={() => setView('home')}
          className={`${currentView === 'home' ? 'text-amber-400' : 'text-slate-400'} hover:text-white transition-colors`}
        >
          Engine
        </button>
        <button 
          onClick={() => setView('leaderboard')}
          className={`${currentView === 'leaderboard' ? 'text-amber-400' : 'text-slate-400'} hover:text-white transition-colors flex items-center gap-1.5`}
        >
          Hall of Fame
        </button>
        <button 
          onClick={() => setView('history')}
          className={`${currentView === 'history' ? 'text-amber-400' : 'text-slate-400'} hover:text-white transition-colors flex items-center gap-1.5`}
        >
          Battles
        </button>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end leading-none">
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-1">Active Player</span>
              <span className="text-sm font-bold text-white truncate max-w-[100px]">{user.displayName}</span>
            </div>
            <img 
              src={user.photoURL || ''} 
              alt={user.displayName || ''} 
              className="w-8 h-8 rounded-full border border-slate-700 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={logout}
              className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all underline decoration-amber-400/30 underline-offset-4 text-[10px] font-black uppercase tracking-widest"
              title="Logout"
            >
              Exit
            </button>
          </div>
        ) : (
          <button 
            onClick={login}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 shadow-xl"
          >
            <LogIn className="w-3 h-3 text-amber-400" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
