'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Player, GamePhase } from '@/types/game';

interface BingoGridProps {
  grid: number[][];
  markedNumbers: number[];
  completedLinePositions: Set<string>;
  isMyTurn: boolean;
  onMarkNumber: (number: number) => void;
  disabled?: boolean;
  phase: GamePhase;
  showLines?: boolean; // Whether to show completed lines
  myRank?: number; // Player's winning rank
}

export default function BingoGrid({
  grid,
  markedNumbers,
  completedLinePositions,
  isMyTurn,
  onMarkNumber,
  disabled = false,
  phase,
  showLines = true,
  myRank,
}: BingoGridProps) {
  const markedSet = new Set(markedNumbers);

  const handleClick = (number: number) => {
    if (disabled || !isMyTurn || markedSet.has(number) || phase !== 'playing') return;
    if (myRank) return; // Already won, can't mark
    onMarkNumber(number);
  };

  return (
    <div className="relative">
      {/* Won overlay */}
      <AnimatePresence>
        {myRank && phase === 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-[2px] rounded-2xl z-10 flex items-center justify-center"
          >
            <div className="bg-slate-800/90 px-6 py-4 rounded-xl border border-green-500/30 text-center">
              <span className="text-4xl mb-2 block">
                {myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : '🥉'}
              </span>
              <p className="text-green-400 font-bold text-lg">
                {myRank === 1 ? '1st Place!' : myRank === 2 ? '2nd Place!' : '3rd Place!'}
              </p>
              <p className="text-slate-400 text-sm">Waiting for game to end...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Turn indicator overlay */}
      <AnimatePresence>
        {!isMyTurn && !disabled && phase === 'playing' && !myRank && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] rounded-2xl z-10 flex items-center justify-center"
          >
            <div className="bg-slate-800/90 px-6 py-3 rounded-xl border border-slate-600/50">
              <p className="text-slate-300 font-medium">Waiting for opponent...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 p-4 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50">
        {grid.map((row, rowIndex) =>
          row.map((number, colIndex) => {
            const isMarked = markedSet.has(number);
            const isInCompletedLine = showLines && completedLinePositions.has(`${rowIndex}-${colIndex}`);
            
            return (
              <motion.button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleClick(number)}
                disabled={disabled || !isMyTurn || isMarked || phase !== 'playing' || !!myRank}
                whileHover={!disabled && isMyTurn && !isMarked && phase === 'playing' && !myRank ? { scale: 1.05 } : {}}
                whileTap={!disabled && isMyTurn && !isMarked && phase === 'playing' && !myRank ? { scale: 0.95 } : {}}
                className={`
                  relative aspect-square flex items-center justify-center
                  text-lg sm:text-2xl font-bold rounded-xl
                  transition-all duration-300 cursor-pointer
                  ${isMarked
                    ? isInCompletedLine
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                      : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 border border-slate-600/30'
                  }
                  ${!isMyTurn || disabled || myRank ? 'cursor-not-allowed' : ''}
                `}
              >
                {/* Number */}
                <span className={isMarked ? 'opacity-50' : ''}>{number}</span>

                {/* Marked indicator */}
                <AnimatePresence>
                  {isMarked && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <svg
                        className="w-8 h-8 sm:w-12 sm:h-12 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Glow effect for completed lines */}
                {isInCompletedLine && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-xl bg-green-400/20"
                  />
                )}
              </motion.button>
            );
          })
        )}
      </div>

      {/* Your turn indicator */}
      {isMyTurn && !disabled && phase === 'playing' && !myRank && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 font-medium">Your turn! Pick a number.</span>
          </span>
        </motion.div>
      )}
    </div>
  );
}
