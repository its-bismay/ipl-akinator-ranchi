import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, ThumbsUp, ThumbsDown, Brain, LogIn, Swords, Target, XCircle, Percent, ShieldCheck } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { UserAnswer } from '../../lib/engine';
import { useAuth } from '../../context/AuthContext';
import type { UserData } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, setDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';

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

  const { user, userData, login, loginError, refreshUserData } = useAuth();
  const [pendingStart, setPendingStart] = useState(false);
   
  const players = {
    "Virat Kohli":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/2.png",

    "MS Dhoni":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/57.png",

    "Rohit Sharma":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/6.png",

    "AB de Villiers":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/25.png",

    "Chris Gayle":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/40.png",

    "Jasprit Bumrah":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/9.png",

    "Suryakumar Yadav":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/174.png",

    "Hardik Pandya":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/54.png",

    "KL Rahul":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/1125.png",

    "Jos Buttler":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/509.png",

    "Yuzvendra Chahal":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/111.png",

    "Ravindra Jadeja":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/46.png",

    "Andre Russell":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/177.png",

    "Sunil Narine":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/203.png",

    "David Warner":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/170.png",

    "Shubman Gill":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/3761.png",

    "Ruturaj Gaikwad":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/5443.png",

    "Sanju Samson":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/258.png",

    "Rishabh Pant":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/2972.png",

    "Kieron Pollard":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/210.png",

    "Faf du Plessis":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/24.png",

    "Glenn Maxwell":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/282.png",

    "Shikhar Dhawan":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/41.png",

    "Dinesh Karthik":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/102.png",

    "Trent Boult":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/969.png",

    "Rashid Khan":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/2885.png",

    "Mohammed Siraj":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/3840.png",

    "Kane Williamson":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/440.png",

    "Quinton de Kock":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/834.png",

    "Harbhajan Singh":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/18.png",

    "Ajinkya Rahane":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/135.png",

    "Ambati Rayudu":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/100.png",

    "Bhuvneshwar Kumar":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/116.png",

    "Robin Uthappa":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/127.png",

    "Lasith Malinga":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/29.png",

    "Aiden Markram":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/1667.png",

    "Mitchell Starc":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/157.png",

    "Pat Cummins":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/488.png",

    "Nitish Rana":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/2738.png",

    "Deepak Chahar":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/140.png",

    "Axar Patel":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/1113.png",

    "Kuldeep Yadav":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/261.png",

    "Ishan Kishan":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/2975.png",

    "Rahul Tripathi":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/3838.png",

    "Shane Watson":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/227.png",

    "Devon Conway":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/601.png",

    "Yashasvi Jaiswal":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/13538.png",

    "Arshdeep Singh":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/12598.png",

    "Marcus Stoinis":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/964.png",

    "Kagiso Rabada":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/1664.png",

    "Varun Chakravarthy":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/5432.png",

    "Heinrich Klaasen":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/202.png",

    "Tilak Varma":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/20593.png",

    "Rinku Singh":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/3830.png",

    "Jofra Archer":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/181.png",

    "Washington Sundar":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/2973.png",

    "Prithvi Shaw":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/3764.png",

    "Mohit Sharma":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/107.png",

    "Avesh Khan":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/1561.png",

    "Nicholas Pooran":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/1703.png",

    "Ravichandran Ashwin":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/8.png",

    "Cameron Green":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/1705.png",

    "Yusuf Pathan":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/190.png",

    "Manish Pandey":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/123.png",

    "Navdeep Saini":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/3825.png",

    "Sam Curran":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/2930.png",

    "Sai Sudharsan":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/20586.png",

    "Rahul Chahar":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/3826.png",

    "Shimron Hetmyer":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/1700.png",

    "Mukesh Kumar":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/20584.png",

    "Riyan Parag":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/4445.png",

    "Maheesh Theekshana":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/20587.png",

    "Abhishek Sharma":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/3760.png",

    "Tim David":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/4524.png",

    "Harshal Patel":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/114.png",

    "Venkatesh Iyer":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/8540.png",

    "Travis Head":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/37.png",

    "Shardul Thakur":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/1745.png",

    "Rahmanullah Gurbaz":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/15994.png",

    "T Natarajan":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/3831.png",

    "Amit Mishra":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/32.png",

    "Phil Salt":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/1220.png",

    "Shreyas Iyer":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/1563.png",

    "Noor Ahmad":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/20591.png",

    "Mohsin Khan":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/20588.png",

    "Rachin Ravindra":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/7242.png",

    "Devdutt Padikkal":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/5430.png",

    "Krunal Pandya":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/3183.png",

    "Liam Livingstone":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/3644.png",

    "Sandeep Sharma":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/137.png",

    "Mohammed Shami":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/94.png",

    "Virender Sehwag":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/19.png",

    "Gautam Gambhir":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/84.png",

    "Dwayne Bravo":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/25.png",

    "Robin Minz":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/20595.png",

    "Brett Lee":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/13.png",

    "Pragyan Ojha":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/58.png",

    "Tilak Naidu":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/20596.png",

    "Umesh Yadav":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/59.png",

    "Adam Zampa":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/958.png",

    "Murali Vijay":
      "https://documents.iplt20.com/ipl/IPLHeadshot2025/75.png"
  };

  function getPlayerImage(name: string) {
    return players[name];
  }
  // Auto-start the game once user logs in after clicking Launch Protocol
  useEffect(() => {
    if (pendingStart && user) {
      setPendingStart(false);
      setHistory([]);
      setQuestionCount(0);
      setLastGuess(null);
      setIsLastGuessCorrect(null);
      fetchNextStep([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pendingStart]);

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
        const playerName = data.guess;
        const imageUrl = getPlayerImage(playerName);
        setLastGuess({
          name: playerName,
          confidence: data.confidence,
          reason: data.reason,
          imageUrl: imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(playerName)}&background=random&color=fff&size=256`,
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
    if (!user) {
      setPendingStart(true); // will auto-start once login completes
      login();
      return;
    }
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



  const handleGuessResult = async (correct: boolean) => {
    setIsLastGuessCorrect(correct);
    setGameState('result');

    if (user && lastGuess) {
      try {
        // Save session
        const sessionId = Date.now().toString();
        const sessionRef = doc(db, 'sessions', sessionId);
        await setDoc(sessionRef, {
          sessionId,
          userId: user.uid,
          guess: lastGuess.name,
          won: correct,
          questionCount,
          createdAt: serverTimestamp(),
        });

        // Update user stats
        const userRef = doc(db, 'users', user.uid);
        const newGamesPlayed = (userData?.gamesPlayed ?? 0) + 1;
        const newCorrect = (userData?.correctGuesses ?? 0) + (correct ? 1 : 0);
        const newAccuracy = Math.round((newCorrect / newGamesPlayed) * 100);
        await updateDoc(userRef, {
          gamesPlayed: increment(1),
          correctGuesses: correct ? increment(1) : increment(0),
          wrongGuesses: !correct ? increment(1) : increment(0),
          accuracy: newAccuracy,
          lastPlayed: serverTimestamp(),
        });
        await refreshUserData();
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
            className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch"
          >
            {/* Launch Card */}
            <div className="flex-1 bg-slate-900/60 border border-white/10 rounded-[32px] p-12 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[400px]">
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

            {/* User Dashboard — only shown when logged in */}
            {user && userData && (
              <UserDashboard user={user} userData={userData} />
            )}
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
                    <div className="w-full h-full rounded-full bg-gradient-to-b from-blue-500 to-indigo-700 flex items-center justify-center shadow-[0_0_30px_rgb(59_130_246_/_0.3)]">
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

// --- User Dashboard ---

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; accent: string }> = ({ icon, label, value, accent }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border ${accent} group hover:bg-slate-800 transition-all`}>
    <div className="p-2 rounded-lg bg-slate-700/50 text-slate-300 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">{label}</p>
      <p className="text-lg font-black text-white tabular-nums leading-none">{value}</p>
    </div>
  </div>
);

const UserDashboard: React.FC<{ user: FirebaseUser; userData: UserData }> = ({ user, userData }) => {
  const winRate = userData.gamesPlayed > 0
    ? Math.round((userData.correctGuesses / userData.gamesPlayed) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 }}
      className="w-full lg:w-80 flex flex-col gap-5"
    >
      <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500 mb-4 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" /> Verified Player
          </p>
          <div className="flex items-center gap-4 mb-5">
            <div className="relative flex-shrink-0">
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=1e40af&color=fff&size=128`}
                alt={user.displayName || 'User'}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl border-2 border-amber-400/30 shadow-lg object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-white truncate leading-tight">
                {user.displayName || 'Anonymous'}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                @{userData.username || user.displayName?.toLowerCase().replace(/\s/g, '') || 'player'}
              </p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.email}</p>
            </div>
          </div>
          <div className="mb-1 flex justify-between items-center">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">AI Win Rate</span>
            <span className="text-[11px] font-black text-amber-400">{winRate}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${winRate}%` }}
              transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Swords className="w-4 h-4" />} label="Matches" value={userData.gamesPlayed} accent="border-white/5" />
        <StatCard icon={<Target className="w-4 h-4 text-green-400" />} label="AI Correct" value={userData.correctGuesses} accent="border-green-500/20" />
        <StatCard icon={<XCircle className="w-4 h-4 text-red-400" />} label="You Won" value={userData.wrongGuesses ?? 0} accent="border-red-500/20" />
        <StatCard icon={<Percent className="w-4 h-4 text-blue-400" />} label="Accuracy" value={`${winRate}%`} accent="border-blue-500/20" />
      </div>
    </motion.div>
  );
};

// --- Sign In Prompt ---
const SignInPrompt: React.FC<{ onLogin: () => void; error: string | null }> = ({ onLogin, error }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await onLogin();
    // Reset loading if the popup was closed without completing (error or cancel)
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 }}
      className="w-full lg:w-80 bg-slate-900/60 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-amber-400/5 pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600/20 to-amber-400/20 border border-white/10 flex items-center justify-center shadow-xl">
          <LogIn className="w-9 h-9 text-amber-400" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white mb-2 tracking-tight">Track Your Battles</h3>
          <p className="text-slate-400 text-sm leading-relaxed max-w-[220px] mx-auto">
            Sign in with Google to unlock your personal dashboard, stats &amp; battle history.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-xs leading-relaxed text-left">
            ⚠️ {error}
          </div>
        )}

        <button
          id="google-sign-in-btn"
          onClick={handleClick}
          disabled={isLoading}
          className="flex items-center gap-3 bg-white text-slate-900 font-black text-sm uppercase tracking-widest px-6 py-3.5 rounded-xl hover:bg-slate-100 active:scale-95 transition-all shadow-xl w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          {isLoading ? 'Opening Google...' : 'Sign in with Google'}
        </button>
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Free · No password needed</p>
      </div>
    </motion.div>
  );
};

export default GameContainer;

