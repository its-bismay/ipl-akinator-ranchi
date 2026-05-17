import React, { useState } from 'react';
import Navbar from './components/layout/Navbar';
import GameContainer from './components/game/GameContainer';
import Leaderboard from './components/game/Leaderboard';
import History from './components/game/History';
import { motion, AnimatePresence } from 'motion/react';

type View = 'home' | 'leaderboard' | 'history';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-amber-400/30 overflow-x-hidden relative flex flex-col">
      {/* Dynamic Theme Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e1b4b_0%,transparent_50%)] opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_80%,#1e3a8a_0%,transparent_30%)] opacity-30"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light" />
      </div>

      <Navbar setView={setCurrentView} currentView={currentView} />

      <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="h-full flex flex-col"
            >
              <section className="text-center mb-10 max-w-2xl mx-auto">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-500 block mb-4"
                >
                  Neural Deduction Engine v2.0
                </motion.span>
                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
                  I can guess any <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">IPL Player</span>
                </h1>
              </section>
              <GameContainer />
            </motion.div>
          )}

          {currentView === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-10"
            >
              <Leaderboard />
            </motion.div>
          )}

          {currentView === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="py-10"
            >
              <History />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 h-14 border-t border-white/5 flex items-center justify-between px-8 bg-slate-950/40 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
        <div className="flex gap-8">
          <span>Neural Net Active</span>
          <span className="hidden sm:block">Deduction Accuracy: 92.4%</span>
        </div>
        <div className="flex gap-4">
          <span className="text-blue-500/50">Gemini Reasoning Protocol</span>
        </div>
      </footer>
    </div>
  );
}
