'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Hash, ArrowRight, Sparkles, Edit2, Check, Plus, UserPlus, ChevronLeft } from 'lucide-react';

type Mode = 'select' | 'create' | 'join';

interface LobbyProps {
  onCreateRoom: (roomId: string, playerName: string, maxPlayers: number) => void;
  onJoinRoom: (roomId: string, playerName: string) => void;
  error?: string | null;
}

export default function Lobby({ onCreateRoom, onJoinRoom, error }: LobbyProps) {
  const [mode, setMode] = useState<Mode>('select');
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isEditingName, setIsEditingName] = useState(false);
  const [hasSavedName, setHasSavedName] = useState(false);

  // Load saved name from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('bingoPlayerName');
    if (savedName) {
      setPlayerName(savedName);
      setHasSavedName(true);
    }
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && roomId.trim()) {
      localStorage.setItem('bingoPlayerName', playerName.trim());
      onCreateRoom(roomId.trim().toLowerCase(), playerName.trim(), maxPlayers);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && roomId.trim()) {
      localStorage.setItem('bingoPlayerName', playerName.trim());
      onJoinRoom(roomId.trim().toLowerCase(), playerName.trim());
    }
  };

  const generateRandomRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    setRoomId(randomId);
  };

  const handleEditName = () => {
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (playerName.trim()) {
      localStorage.setItem('bingoPlayerName', playerName.trim());
      setHasSavedName(true);
      setIsEditingName(false);
    }
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
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo/Title */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-center mb-6 sm:mb-8"
        >
          {/* Logo Image */}
          <img
            src="/bongo-logo.svg"
            alt="Bingo Logo"
            className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 drop-shadow-2xl"
          />
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30 mb-3 sm:mb-4">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
            <span className="text-purple-300 text-xs sm:text-sm font-medium">Multiplayer Game</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            BINGO
          </h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">1-25 • First to 5 lines wins!</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5 sm:p-8 shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {mode === 'select' ? (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Player Name */}
                <div className="space-y-2 mb-6">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Your Name
                  </label>
                  
                  {hasSavedName && !isEditingName ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                            {playerName.charAt(0).toUpperCase()}
                          </div>
                          <span>{playerName}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleEditName}
                        className="p-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-xl text-slate-300 hover:text-white transition-all"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter your name"
                        className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                        maxLength={20}
                        autoFocus={isEditingName}
                      />
                      {isEditingName && (
                        <button
                          type="button"
                          onClick={handleSaveName}
                          className="p-3 bg-green-600/50 hover:bg-green-500/50 border border-green-500/50 rounded-xl text-green-300 hover:text-white transition-all"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => playerName.trim() && setMode('create')}
                    disabled={!playerName.trim()}
                    className={`py-4 rounded-xl font-semibold flex flex-col items-center justify-center gap-2 transition-all ${
                      playerName.trim()
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-sm">Create Room</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => playerName.trim() && setMode('join')}
                    disabled={!playerName.trim()}
                    className={`py-4 rounded-xl font-semibold flex flex-col items-center justify-center gap-2 transition-all ${
                      playerName.trim()
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <UserPlus className="w-6 h-6" />
                    <span className="text-sm">Join Room</span>
                  </motion.button>
                </div>
              </motion.div>
            ) : mode === 'create' ? (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => setMode('select')}
                  className="flex items-center gap-1 text-slate-400 hover:text-white mb-4 text-sm transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-400" />
                  Create Room
                </h2>

                <form onSubmit={handleCreate} className="space-y-4">
                  {/* Room ID */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Room ID
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Enter room ID"
                        className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                        maxLength={20}
                        required
                      />
                      <button
                        type="button"
                        onClick={generateRandomRoom}
                        className="px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-xl text-slate-300 hover:text-white transition-all"
                        title="Generate random room"
                      >
                        <Sparkles className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Player Limit */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Player Limit
                    </label>
                    <div className="flex items-center gap-3">
                      {[2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setMaxPlayers(num)}
                          className={`
                            w-10 h-10 rounded-lg font-semibold transition-all
                            ${maxPlayers === num
                              ? 'bg-purple-500 text-white'
                              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-white'
                            }
                          `}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">Max players allowed in your room</p>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all"
                  >
                    Create & Join
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => setMode('select')}
                  className="flex items-center gap-1 text-slate-400 hover:text-white mb-4 text-sm transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                  Join Room
                </h2>

                <form onSubmit={handleJoin} className="space-y-4">
                  {/* Room ID */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Room ID
                    </label>
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="Enter room ID to join"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                      maxLength={20}
                      required
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl font-semibold text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
                  >
                    Join Game
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info */}
          {mode === 'select' && (
            <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-slate-700/50">
              <p className="text-slate-500 text-xs sm:text-sm text-center">
                Create a room to host, or join with a Room ID
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
