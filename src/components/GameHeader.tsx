'use client';

import { motion } from 'framer-motion';
import { Hash, LogOut, Users, Wifi, WifiOff } from 'lucide-react';

interface GameHeaderProps {
  roomId: string;
  playerCount: number;
  isConnected: boolean;
  onLeave: () => void;
}

export default function GameHeader({ roomId, playerCount, isConnected, onLeave }: GameHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              BINGO
            </h1>
            
            {/* Room ID Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg border border-slate-600/50">
              <Hash className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-mono text-slate-300">{roomId}</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Connection status */}
            <div className={`
              flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium
              ${isConnected
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
              }
            `}>
              {isConnected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Player count */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-700/50 rounded-lg text-xs font-medium text-slate-300">
              <Users className="w-3 h-3" />
              <span>{playerCount}</span>
            </div>

            {/* Leave button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLeave}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Leave</span>
            </motion.button>
          </div>
        </div>

        {/* Mobile Room ID */}
        <div className="sm:hidden mt-2 flex items-center gap-2 text-xs text-slate-400">
          <Hash className="w-3 h-3" />
          <span className="font-mono">{roomId}</span>
        </div>
      </div>
    </motion.header>
  );
}
