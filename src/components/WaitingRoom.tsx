'use client';

import { motion } from 'framer-motion';
import { Users, Play, Loader2, Copy, Check, Sparkles, X, Trophy } from 'lucide-react';
import { useState } from 'react';
import { Player, GamePhase } from '@/types/game';

interface WaitingRoomProps {
  roomId: string;
  players: Player[];
  myPlayerId: string;
  phase: GamePhase;
  scores?: Record<string, number>;
  maxPlayers?: number;
  onStartArranging: () => void;
  onStartGame: () => void;
  onLeave: () => void;
  onKickPlayer?: (playerId: string) => void;
}

export default function WaitingRoom({
  roomId,
  players,
  myPlayerId,
  phase,
  scores = {},
  maxPlayers = 10,
  onStartArranging,
  onStartGame,
  onLeave,
  onKickPlayer,
}: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);
  const isHost = players[0]?.id === myPlayerId;
  const canStartArranging = players.length >= 2 && phase === 'waiting';
  const allReady = players.every(p => p.isReady);
  const canStartGame = allReady && phase === 'arranging';

  // Check if there are any scores to show
  const hasScores = Object.keys(scores).length > 0;

  const copyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {phase === 'waiting' ? 'Waiting Room' : 'Arranging Phase'}
          </h1>
          <p className="text-slate-400">
            {phase === 'waiting' 
              ? 'Waiting for players to join...'
              : 'Arrange your grid by clicking cells 1-25'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
          {/* Room ID */}
          <div className="mb-6">
            <label className="text-sm text-slate-400 mb-2 block">Room ID</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 bg-slate-900/50 rounded-xl font-mono text-white text-lg">
                {roomId}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyRoomId}
                className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-slate-300 transition-all"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Scoreboard (if there are scores) */}
          {hasScores && (
            <div className="mb-6 p-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-xl border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <label className="text-sm font-medium text-yellow-400">Scoreboard</label>
              </div>
              <div className="space-y-1">
                {Object.entries(scores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, wins]) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span className="text-white">{name}</span>
                      <span className="text-yellow-400 font-medium">{wins} win{wins !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Players list */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Players ({players.length}/{maxPlayers})
              </label>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{player.name}</span>
                      {player.id === myPlayerId && (
                        <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                          You
                        </span>
                      )}
                      {index === 0 && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full">
                          Host
                        </span>
                      )}
                      {/* Show score if they have one */}
                      {scores[player.name] && (
                        <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full">
                          {scores[player.name]}🏆
                        </span>
                      )}
                    </div>
                    {phase === 'arranging' && (
                      <span className={`text-xs ${player.isReady ? 'text-green-400' : 'text-slate-500'}`}>
                        {player.isReady ? '✓ Ready' : `Placing: ${player.currentPlacement}/25`}
                      </span>
                    )}
                  </div>
                  {phase === 'arranging' && player.isReady && (
                    <Sparkles className="w-5 h-5 text-green-400" />
                  )}
                  {/* Kick button (host only, waiting phase, not self) */}
                  {isHost && phase === 'waiting' && player.id !== myPlayerId && onKickPlayer && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onKickPlayer(player.id)}
                      className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-all"
                      title="Remove player"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </motion.div>
              ))}

              {/* Empty slots (only in waiting phase) */}
              {phase === 'waiting' && players.length < 2 && (
                <div className="flex items-center gap-3 p-3 bg-slate-700/20 rounded-xl border border-dashed border-slate-600/30">
                  <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                  </div>
                  <span className="text-slate-500">Waiting for player...</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {isHost ? (
            phase === 'waiting' ? (
              <motion.button
                whileHover={{ scale: canStartArranging ? 1.02 : 1 }}
                whileTap={{ scale: canStartArranging ? 0.98 : 1 }}
                onClick={onStartArranging}
                disabled={!canStartArranging}
                className={`
                  w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                  ${canStartArranging
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                  }
                `}
              >
                <Play className="w-5 h-5" />
                {canStartArranging ? 'Start Arranging' : 'Need at least 2 players'}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: canStartGame ? 1.02 : 1 }}
                whileTap={{ scale: canStartGame ? 0.98 : 1 }}
                onClick={onStartGame}
                disabled={!canStartGame}
                className={`
                  w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                  ${canStartGame
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25'
                    : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                  }
                `}
              >
                <Play className="w-5 h-5" />
                {canStartGame ? 'Start Game!' : 'Waiting for all players to be ready...'}
              </motion.button>
            )
          ) : (
            <div className="text-center p-4 bg-slate-700/30 rounded-xl">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin mx-auto mb-2" />
              <p className="text-slate-400">
                {phase === 'waiting' 
                  ? 'Waiting for host to start...'
                  : allReady 
                    ? 'Waiting for host to start the game...'
                    : 'Arrange your grid, then wait for others...'}
              </p>
            </div>
          )}

          {/* Leave button */}
          <button
            onClick={onLeave}
            className="w-full mt-3 py-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            Leave Room
          </button>
        </div>
      </motion.div>
    </div>
  );
}
