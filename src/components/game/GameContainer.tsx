import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, ThumbsUp, ThumbsDown, HelpCircle, User, Loader2, Brain } from 'lucide-react';
import { UserAnswer } from '../../lib/engine';
import { PlayerAttributes } from '../../data/players';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';
import History from './History';

export const GameContainer: React.FC = () => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'guessing' | 'result'>('start');
  const [currentQuestion, setCurrentQuestion] = useState<{ text: string, number: number, reason?: string, attribute: string } | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [lastGuess, setLastGuess] = useState<{ name: string, confidence: string, reason?: string, imageUrl?: string, franchises?: string[] } | null>(null);
  const [isCorrect, setIsLastGuessCorrect] = useState<boolean | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingCount, setRemainingCount] = useState<number>(0);
  const [history, setHistory] = useState<Array<{ question: string, attribute: string, answer: UserAnswer }>>([]);

  const fetchNextStep = async (newHistory: Array<{ question: string, attribute: string, answer: UserAnswer }>) => {
    try {
      setIsThinking(true);
      setError(null);
      const response = await fetch('/api/game/next-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          history: newHistory,
        }),
      });
      
      if (response.status === 429) {
        setError("AI is resting (Quota reached). Please wait a few seconds and try answering again.");
        return;
      }

      const data = await response.json();

      if (data.type === 'question') {
        setCurrentQuestion({
          text: data.question,
          number: data.question_number,
          reason: data.reason,
          attribute: data.attribute
        });
        setRemainingCount(data.remaining_players_count);
        setGameState('playing');
      } else if (data.type === 'guess') {
        setLastGuess({
          name: data.guess,
          confidence: data.confidence,
          reason: data.reason,
          imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.guess)}&background=random&color=fff&size=256`,
          franchises: [] // We could fetch this or just omit
        });
        setGameState('guessing');
      }
    } catch (err) {
      console.error('Server error:', err);
    } finally {
      setIsThinking(false);
    }
  };

  const startGame = () => {
    setHistory([]);
    setQuestionCount(0);
    setLastGuess(null);
    setIsLastGuessCorrect(null);
    fetchNextStep([]);
  };

  const handleAnswer = (answer: UserAnswer) => {
    if (!currentQuestion) return;
    const newHistory = [...history, { question: currentQuestion.text, attribute: currentQuestion.attribute, answer }];
    setHistory(newHistory);
    setQuestionCount(newHistory.length);
    fetchNextStep(newHistory);
  };

  const { user } = useAuth();

  const handleGuessResult = async (correct: boolean) => {
    setIsLastGuessCorrect(correct);
    setGameState('result');

    if (user && lastGuess) {
      try {
        const sessionId = Date.now().toString();
        const sessionRef = doc(db, 'sessions', sessionId);
        await setDoc(sessionRef, {
          sessionId,
          userId: user.uid,
          guess: lastGuess.name,
          won: correct,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error('Error saving session:', err);
      }
    }
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-stretch pt-4">
      <AnimatePresence mode="wait">
        {gameState === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="bg-slate-900/60 border border-white/10 rounded-[32px] p-12 flex flex-col items-center justify-center text-center relative overflow-hidden w-full max-w-2xl min-h-[400px]">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>
               <div className="mb-10 relative">
                <div className="w-24 h-24 rounded-full border-2 border-amber-400/30 flex items-center justify-center p-2">
                  <div className="w-full h-full rounded-full bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center shadow-amber-500/20 shadow-2xl">
                    <Play className="w-10 h-10 text-slate-900 fill-current" />
                  </div>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4 tracking-tight">Initialize Battle Session</h2>
              <p className="text-slate-400 mb-10 max-w-xs mx-auto text-sm leading-relaxed">
                Connect your thoughts to the IPL Neural Network. Choose any player from 2008 to present.
              </p>
              <button
                onClick={startGame}
                className="group relative py-4 px-10 rounded-2xl bg-white text-slate-950 font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl active:scale-95"
              >
                Launch Protocol
                <div className="absolute inset-0 rounded-2xl border border-white group-hover:scale-110 transition-transform opacity-30" />
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && currentQuestion && (
          <>
            <motion.aside 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full lg:w-72 flex flex-col gap-6"
            >
              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">Neural Certainty</h3>
                <div className="space-y-5">
                  <div className="pt-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 uppercase tracking-wider">Step</span>
                      <span className="font-mono text-white text-xs">{questionCount} / 12</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm hidden lg:block overflow-y-auto">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">Identification State</h3>
                <div className="text-xl font-bold text-white tabular-nums mb-2">
                  {remainingCount} <span className="text-zinc-600 text-sm">matching players</span>
                </div>
                <div className="space-y-2 mt-4">
                  {history.slice(-3).map((h, i) => (
                    <div key={i} className="text-[10px] text-slate-400 py-1 border-l-2 border-blue-500/20 pl-2">
                      {h.question} <span className="text-blue-400 font-bold">{h.answer}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-400/5 border border-amber-400/10 rounded-2xl p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="text-amber-400 text-xs uppercase tracking-widest font-black">AI Reasoning</div>
                  </div>
                  <p className="text-[11px] font-medium italic text-amber-200/80 leading-relaxed min-h-[40px]">
                    {currentQuestion?.reason || "Synthesizing player attributes from the IPL relational database..."}
                  </p>
                </div>
              </div>
            </motion.aside>

            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col gap-6"
            >
              <div className="flex-1 bg-slate-900/60 border border-white/10 rounded-[32px] p-8 md:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[500px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>
                
                <div className="mb-10 relative">
                  <div className="w-32 h-32 rounded-full border-2 border-blue-500/30 flex items-center justify-center p-2">
                    <div className="w-full h-full rounded-full bg-gradient-to-b from-blue-500 to-indigo-700 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                      <div className={`transition-all ${isThinking ? 'animate-spin' : 'animate-pulse'}`}>
                        <Brain className="w-16 h-16 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="max-w-xl space-y-6">
                  <span className="text-blue-400 font-mono text-xs tracking-[0.3em] uppercase block">Analysis Phase #{questionCount + 1}</span>
                  <h2 className="text-3xl md:text-5xl font-semibold leading-[1.1] tracking-tight text-white min-h-[6rem] flex items-center justify-center">
                    {isThinking ? (
                      <span className="opacity-50 italic text-2xl">Consulting Neural Net...</span>
                    ) : (
                      <span>{currentQuestion?.text.split('?')[0]}<span className="text-amber-400">?</span></span>
                    )}
                  </h2>
                  {error && (
                    <p className="text-red-400 text-xs mt-4 animate-pulse font-medium">{error}</p>
                  )}
                </div>

                <div className={`grid grid-cols-2 gap-4 mt-12 w-full max-w-lg transition-all duration-500 ${isThinking ? 'opacity-20 pointer-events-none blur-sm' : 'opacity-100'}`}>
                  <button onClick={() => handleAnswer('yes')} className="py-5 px-6 rounded-2xl bg-white text-slate-950 font-black text-base md:text-lg hover:bg-slate-200 transition-all shadow-xl active:scale-95">
                    YES
                  </button>
                  <button onClick={() => handleAnswer('no')} className="py-5 px-6 rounded-2xl bg-slate-800 text-white font-black text-base md:text-lg border border-white/10 hover:bg-slate-700 transition-all active:scale-95">
                    NO
                  </button>
                  <button onClick={() => handleAnswer('probably')} className="py-4 px-6 rounded-2xl bg-slate-900/80 text-slate-300 font-bold text-sm md:text-base border border-white/5 hover:bg-slate-800 transition-all active:scale-95">
                    MAYBE
                  </button>
                  <button onClick={() => handleAnswer('dont-know')} className="py-4 px-6 rounded-2xl bg-slate-900/80 text-slate-300 font-bold text-sm md:text-base border border-white/5 hover:bg-slate-800 transition-all active:scale-95">
                    DON'T KNOW
                  </button>
                </div>
              </div>

              <div className="h-20 flex items-center justify-between px-8 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Protocol Active</span>
                </div>
                <button 
                  onClick={() => setGameState('start')}
                  className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/5 px-4 py-2 rounded-lg hover:text-white hover:border-white/10 transition-all"
                >
                  Terminate Session
                </button>
              </div>
            </motion.section>
          </>
        )}

        {gameState === 'guessing' && lastGuess && (
          <motion.div
            key="guessing"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center py-4"
          >
            <div className="bg-slate-900/80 border border-amber-400/20 rounded-[40px] p-10 md:p-16 w-full max-w-2xl text-center relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-400/5 to-transparent"></div>
              
              <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.5em] text-amber-500 mb-10 block">Identification Protocol Complete</span>
              
              <div className="relative mb-12 mx-auto w-56 h-56 group">
                <div className="absolute inset-0 bg-amber-400 blur-[40px] opacity-20 rounded-full group-hover:opacity-40 transition-opacity"></div>
                <img 
                  src={lastGuess.imageUrl} 
                  alt={lastGuess.name}
                  className="relative z-10 w-full h-full rounded-full object-cover border-4 border-slate-900 p-1 bg-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 rounded-full border-4 border-amber-400 animate-pulse opacity-40 scale-110" />
              </div>
              
              <h2 className="relative z-10 text-5xl md:text-7xl font-black mb-4 tracking-tighter text-white">
                {lastGuess.name}
              </h2>
              
              <div className="relative z-10 bg-blue-600/20 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-8">
                {lastGuess.confidence} Match
              </div>
              
              <p className="relative z-10 text-xl font-bold mb-10 text-slate-300">
                {lastGuess.reason || "My neural net is certain. Am I correct?"}
              </p>
              
              <div className="relative z-10 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <button
                  onClick={() => handleGuessResult(true)}
                  className="flex-1 flex items-center justify-center gap-3 bg-white text-slate-950 py-5 px-8 rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl"
                >
                  <ThumbsUp className="w-5 h-5 fill-current" /> Correct
                </button>
                <button
                  onClick={() => handleGuessResult(false)}
                  className="flex-1 flex items-center justify-center gap-3 bg-slate-800 text-white py-5 px-8 rounded-2xl font-black uppercase tracking-widest border border-white/10 hover:bg-slate-700 transition-all active:scale-95"
                >
                  <ThumbsDown className="w-5 h-5 fill-current" /> Incorrect
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="glass-card p-16 max-w-xl w-full text-center relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-full h-1 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}></div>
               
              {isCorrect ? (
                <>
                  <div className="mb-8 text-8xl">👑</div>
                  <h2 className="text-5xl font-black mb-4 tracking-tighter">Match Verified.</h2>
                  <p className="text-slate-400 mb-12 text-lg">My algorithms remain unbeaten. The IPL star has been cataloged.</p>
                </>
              ) : (
                <>
                  <div className="mb-8 text-8xl">🧩</div>
                  <h2 className="text-5xl font-black mb-4 tracking-tighter">System Error.</h2>
                  <p className="text-slate-400 mb-12 text-lg">My neural weights require recalibration. You played exceptionally well.</p>
                </>
              )}
              
              <button
                onClick={startGame}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 px-10 rounded-2xl transition-all shadow-blue-500/20 shadow-2xl uppercase tracking-[0.2em] text-sm"
              >
                Initiate New Match
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AnswerButton: React.FC<{ label: string; onClick: () => void, color: string }> = ({ label, onClick, color }) => (
  <button
    onClick={onClick}
    className={`${color} hover:brightness-110 text-white font-medium py-4 px-4 rounded-xl transition-all active:scale-95 shadow-lg flex items-center justify-center text-sm md:text-base`}
  >
    {label}
  </button>
);

export default GameContainer;
