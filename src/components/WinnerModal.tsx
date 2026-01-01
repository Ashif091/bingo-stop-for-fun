'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, PartyPopper, RotateCcw, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { Player } from '@/types/game';

interface WinnerModalProps {
  winners: Player[];
  players: Player[];
  myPlayerId: string;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export default function WinnerModal({ 
  winners, 
  players,
  myPlayerId, 
  onPlayAgain, 
  onGoHome 
}: WinnerModalProps) {
  const isGameOver = winners.length > 0;
  const myRank = players.find(p => p.id === myPlayerId)?.rank;

  // Trigger confetti if I won
  useEffect(() => {
    if (isGameOver && myRank) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: myRank === 1 ? ['#fbbf24', '#f59e0b', '#eab308'] : ['#a855f7', '#3b82f6', '#22c55e'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: myRank === 1 ? ['#fbbf24', '#f59e0b', '#eab308'] : ['#a855f7', '#3b82f6', '#22c55e'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [isGameOver, myRank]);

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '😢';
  };

  const getRankLabel = (rank: number) => {
    if (rank === 1) return '1st Place';
    if (rank === 2) return '2nd Place';
    if (rank === 3) return '3rd Place';
    return 'Better luck next time!';
  };

  return (
    <AnimatePresence>
      {isGameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 p-8 shadow-2xl overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-6"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <PartyPopper className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                    Game Over!
                  </h2>
                  <PartyPopper className="w-6 h-6 text-yellow-400 transform scale-x-[-1]" />
                </div>
              </motion.div>

              {/* Podium */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <div className="flex justify-center items-end gap-2 mb-4">
                  {/* 2nd place */}
                  {winners.length >= 2 && (
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-center"
                    >
                      <div className="text-3xl mb-1">🥈</div>
                      <div className="bg-slate-600 rounded-t-lg px-4 py-6 min-w-[80px]">
                        <p className="text-white font-semibold text-sm truncate max-w-[80px]">
                          {winners[1]?.name}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* 1st place */}
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                  >
                    <div className="text-4xl mb-1">🥇</div>
                    <div className="bg-gradient-to-b from-yellow-500 to-amber-600 rounded-t-lg px-6 py-8 min-w-[100px]">
                      <p className="text-white font-bold text-sm truncate max-w-[100px]">
                        {winners[0]?.name}
                      </p>
                    </div>
                  </motion.div>

                  {/* 3rd place */}
                  {winners.length >= 3 && (
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-center"
                    >
                      <div className="text-2xl mb-1">🥉</div>
                      <div className="bg-amber-700 rounded-t-lg px-3 py-4 min-w-[70px]">
                        <p className="text-white font-semibold text-xs truncate max-w-[70px]">
                          {winners[2]?.name}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* My result */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-slate-800/50 rounded-xl p-4 mb-6 text-center"
              >
                <span className="text-4xl mb-2 block">{getRankEmoji(myRank || 0)}</span>
                <p className="text-white font-semibold">
                  {myRank ? getRankLabel(myRank) : 'You did not win this time'}
                </p>
                {myRank && (
                  <div className="flex justify-center gap-1 mt-2">
                    {['B', 'I', 'N', 'G', 'O'].map((letter) => (
                      <div
                        key={letter}
                        className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold"
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onPlayAgain}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onGoHome}
                  className="flex-1 py-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
                >
                  <Home className="w-5 h-5" />
                  Home
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
