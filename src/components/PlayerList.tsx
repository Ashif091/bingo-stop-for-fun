'use client';

import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { Player, GamePhase } from '@/types/game';

interface PlayerListProps {
  players: Player[];
  currentTurnIndex: number;
  myPlayerId: string;
  phase: GamePhase;
  showAllLines?: boolean; // Show all lines after game ends
}

export default function PlayerList({ 
  players, 
  currentTurnIndex, 
  myPlayerId,
  phase,
  showAllLines = false,
}: PlayerListProps) {
  // BINGO letters
  const bingoLetters = ['B', 'I', 'N', 'G', 'O'];

  const getRankEmoji = (rank?: number) => {
    if (!rank) return null;
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-purple-400" />
        Players
      </h3>

      <div className="space-y-3">
        {players.map((player, index) => {
          const isCurrentTurn = index === currentTurnIndex && phase === 'playing';
          const isMe = player.id === myPlayerId;
          const canSeeLine = isMe || showAllLines || player.rank;

          return (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative p-3 rounded-xl transition-all duration-300
                ${player.rank
                  ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20'
                  : isCurrentTurn
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30'
                    : 'bg-slate-700/30 border border-slate-600/30'
                }
              `}
            >
              {/* Current turn indicator */}
              {isCurrentTurn && !player.rank && (
                <motion.div
                  layoutId="turn-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-l-xl"
                />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar / Rank */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-white relative
                    ${player.rank
                      ? 'bg-gradient-to-br from-yellow-500 to-amber-600'
                      : isCurrentTurn
                        ? 'bg-gradient-to-br from-purple-500 to-blue-500'
                        : 'bg-slate-600'
                    }
                  `}>
                    {player.rank ? (
                      <span className="text-lg">{getRankEmoji(player.rank)}</span>
                    ) : (
                      player.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white">
                        {player.name}
                      </span>
                      {isMe && (
                        <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                          You
                        </span>
                      )}
                      {player.rank && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full">
                          {player.rank === 1 ? '1st' : player.rank === 2 ? '2nd' : '3rd'}
                        </span>
                      )}
                    </div>
                    {isCurrentTurn && !player.rank && (
                      <span className="text-xs text-purple-400">Playing now...</span>
                    )}
                    {player.rank && (
                      <span className="text-xs text-yellow-400">BINGO!</span>
                    )}
                  </div>
                </div>

                {/* BINGO Progress */}
                <div className="flex gap-1">
                  {bingoLetters.map((letter, letterIndex) => {
                    const hasLine = letterIndex < player.completedLines;
                    const showProgress = canSeeLine;
                    
                    return (
                      <motion.div
                        key={letter}
                        initial={false}
                        animate={{
                          scale: hasLine && showProgress ? [1, 1.2, 1] : 1,
                        }}
                        className={`
                          w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center
                          text-xs font-bold transition-all duration-300
                          ${showProgress
                            ? hasLine
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/30'
                              : 'bg-slate-700/50 text-slate-500'
                            : 'bg-slate-700/50 text-slate-600'
                          }
                        `}
                      >
                        {showProgress ? letter : '?'}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <p className="text-xs text-slate-500 text-center">
          {phase === 'playing' 
            ? "Complete 5 lines to BINGO! Other players' lines are hidden."
            : phase === 'ended'
              ? 'Game Over! All lines revealed.'
              : 'Get ready for the game!'}
        </p>
      </div>
    </div>
  );
}
