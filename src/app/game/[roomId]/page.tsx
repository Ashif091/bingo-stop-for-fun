'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBingo } from '@/hooks/useBingo';
import GameHeader from '@/components/GameHeader';
import BingoGrid from '@/components/BingoGrid';
import GridArrangement from '@/components/GridArrangement';
import PlayerList from '@/components/PlayerList';
import WinnerModal from '@/components/WinnerModal';
import WaitingRoom from '@/components/WaitingRoom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Users, ChevronUp, ChevronDown, Trophy } from 'lucide-react';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [showPlayers, setShowPlayers] = useState(false); // Mobile: toggle player list
  const [showScoreboard, setShowScoreboard] = useState(false); // Toggle scoreboard

  const {
    gameState,
    playerId,
    isMyTurn,
    myPlayer,
    error,
    isConnected,
    completedLinePositions,
    wasKicked,
    joinRoom,
    leaveRoom,
    kickPlayer,
    startArranging,
    placeNumber,
    startGame,
    markNumber,
    restartGame,
    createRoom,
  } = useBingo();

  // Get player name from localStorage/sessionStorage or redirect to lobby
  useEffect(() => {
    let playerName = sessionStorage.getItem('playerName');
    const isHost = sessionStorage.getItem('isHost') === 'true';
    const maxPlayersStr = sessionStorage.getItem('maxPlayers');
    const maxPlayers = maxPlayersStr ? parseInt(maxPlayersStr, 10) : 4;
    
    // Also check localStorage if sessionStorage is empty
    if (!playerName) {
      const savedName = localStorage.getItem('bingoPlayerName');
      if (savedName) {
        playerName = savedName;
        sessionStorage.setItem('playerName', savedName);
      }
    }
    
    if (!playerName) {
      router.push('/');
      return;
    }

    // Join or create the room
    if (roomId && !gameState) {
      if (isHost) {
        createRoom(roomId, playerName, maxPlayers);
        // Clear host flags after creating
        sessionStorage.removeItem('isHost');
        sessionStorage.removeItem('maxPlayers');
      } else {
        joinRoom(roomId, playerName);
      }
    }
  }, [roomId, gameState, joinRoom, createRoom, router]);

  const handleLeave = () => {
    leaveRoom();
    sessionStorage.removeItem('playerName');
    // Use window.location for full refresh
    window.location.href = '/';
  };

  const handlePlayAgain = () => {
    restartGame();
  };

  const handleGoHome = () => {
    handleLeave();
  };

  // Loading state
  if (!gameState || !playerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Connecting to game...</p>
        </div>
      </div>
    );
  }

  // Waiting room
  if (gameState.phase === 'waiting') {
    return (
      <WaitingRoom
        roomId={roomId}
        players={gameState.players}
        myPlayerId={playerId}
        phase={gameState.phase}
        scores={gameState.scores}
        maxPlayers={gameState.maxPlayers}
        onStartArranging={startArranging}
        onStartGame={startGame}
        onLeave={handleLeave}
        onKickPlayer={kickPlayer}
      />
    );
  }

  // Arranging phase - show grid arrangement with player list
  if (gameState.phase === 'arranging' && myPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <GameHeader
          roomId={roomId}
          playerCount={gameState.players.length}
          isConnected={isConnected}
          onLeave={handleLeave}
        />

        {/* Main content */}
        <main className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 relative z-10">
          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Mobile: Collapsible Player Status */}
          <div className="lg:hidden mb-3">
            <button
              onClick={() => setShowPlayers(!showPlayers)}
              className="w-full flex items-center justify-between p-3 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm font-medium">
                  Players ({gameState.players.filter(p => p.isReady).length}/{gameState.players.length} ready)
                </span>
              </div>
              {showPlayers ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            
            {showPlayers && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-3"
              >
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {gameState.players.map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                        player.isReady ? 'bg-green-500/10' : 'bg-slate-700/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white">{player.name}</span>
                        {player.id === playerId && (
                          <span className="text-xs px-1 py-0.5 bg-purple-500/20 text-purple-300 rounded">You</span>
                        )}
                        {index === 0 && (
                          <span className="text-xs px-1 py-0.5 bg-yellow-500/20 text-yellow-300 rounded">Host</span>
                        )}
                      </div>
                      <span className={`text-xs ${player.isReady ? 'text-green-400' : 'text-slate-500'}`}>
                        {player.isReady ? '✓' : `${player.currentPlacement - 1}/25`}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="grid lg:grid-cols-[1fr_280px] gap-4 sm:gap-6 max-w-5xl mx-auto">
            {/* Grid Arrangement */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <GridArrangement
                grid={myPlayer.grid}
                currentPlacement={myPlayer.currentPlacement}
                isReady={myPlayer.isReady}
                onPlaceNumber={placeNumber}
              />
              
              {/* Mobile: Host start button below grid */}
              {gameState.players[0]?.id === playerId && (
                <motion.button
                  whileHover={{ scale: gameState.players.every(p => p.isReady) ? 1.02 : 1 }}
                  whileTap={{ scale: gameState.players.every(p => p.isReady) ? 0.98 : 1 }}
                  onClick={startGame}
                  disabled={!gameState.players.every(p => p.isReady)}
                  className={`
                    lg:hidden w-full mt-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm
                    ${gameState.players.every(p => p.isReady)
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                      : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                    }
                  `}
                >
                  {gameState.players.every(p => p.isReady) ? '🎮 Start Game!' : 'Waiting for all...'}
                </motion.button>
              )}
            </motion.div>

            {/* Desktop: Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block space-y-4"
            >
              {/* Player status */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4">
                <h3 className="font-semibold text-white mb-3 text-sm">Players Status</h3>
                <div className="space-y-2">
                  {gameState.players.map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        player.isReady ? 'bg-green-500/10' : 'bg-slate-700/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white text-sm">{player.name}</span>
                        {player.id === playerId && (
                          <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded">You</span>
                        )}
                        {index === 0 && (
                          <span className="text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 rounded">Host</span>
                        )}
                      </div>
                      <span className={`text-xs ${player.isReady ? 'text-green-400' : 'text-slate-500'}`}>
                        {player.isReady ? '✓ Ready' : `${player.currentPlacement - 1}/25`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Host start button */}
              {gameState.players[0]?.id === playerId && (
                <motion.button
                  whileHover={{ scale: gameState.players.every(p => p.isReady) ? 1.02 : 1 }}
                  whileTap={{ scale: gameState.players.every(p => p.isReady) ? 0.98 : 1 }}
                  onClick={startGame}
                  disabled={!gameState.players.every(p => p.isReady)}
                  className={`
                    w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm
                    ${gameState.players.every(p => p.isReady)
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25'
                      : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                    }
                  `}
                >
                  {gameState.players.every(p => p.isReady) ? '🎮 Start Game!' : 'Waiting for all to be ready...'}
                </motion.button>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  // Game in progress or ended
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <GameHeader
        roomId={roomId}
        playerCount={gameState.players.length}
        isConnected={isConnected}
        onLeave={handleLeave}
      />

      {/* Main content */}
      <main className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 relative z-10">
        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Mobile: Compact Player Info Bar */}
        <div className="lg:hidden mb-3">
          <button
            onClick={() => setShowPlayers(!showPlayers)}
            className="w-full flex items-center justify-between p-2.5 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm font-medium">{gameState.players.length}</span>
              </div>
              <div className="h-4 w-px bg-slate-600" />
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Turn:</span>
                <span className={`font-medium ${isMyTurn ? 'text-green-400' : 'text-white'}`}>
                  {isMyTurn ? 'You!' : gameState.players[gameState.currentTurnIndex]?.name}
                </span>
              </div>
              <div className="h-4 w-px bg-slate-600" />
              <span className="text-xs text-slate-400">
                {gameState.markedNumbers.length}/25
              </span>
            </div>
            {showPlayers ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          
          {showPlayers && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <PlayerList
                players={gameState.players}
                currentTurnIndex={gameState.currentTurnIndex}
                myPlayerId={playerId}
                phase={gameState.phase}
                showAllLines={gameState.phase === 'ended'}
              />
            </motion.div>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-4 sm:gap-6 max-w-5xl mx-auto">
          {/* Bingo Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {myPlayer && (
              <BingoGrid
                grid={myPlayer.grid}
                markedNumbers={gameState.markedNumbers}
                completedLinePositions={completedLinePositions}
                isMyTurn={isMyTurn}
                onMarkNumber={markNumber}
                disabled={gameState.phase === 'ended'}
                phase={gameState.phase}
                showLines={true}
                myRank={myPlayer.rank}
                currentPlayerName={gameState.players[gameState.currentTurnIndex]?.name}
              />
            )}
            
            {/* Mobile: Winners display */}
            {gameState.winners.length > 0 && gameState.phase === 'playing' && (
              <div className="lg:hidden mt-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-xl border border-yellow-500/20 p-3">
                <div className="flex items-center gap-3 overflow-x-auto">
                  <span className="text-yellow-400 text-xs font-medium whitespace-nowrap">Winners:</span>
                  {gameState.winners.map((winner, idx) => (
                    <span key={winner.id} className="flex items-center gap-1 text-sm whitespace-nowrap">
                      <span>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                      <span className="text-white">{winner.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile: Scoreboard below grid */}
            {Object.keys(gameState.scores).length > 0 && (
              <div className="lg:hidden mt-3">
                <button
                  onClick={() => setShowScoreboard(!showScoreboard)}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-xl border border-yellow-500/20 hover:from-yellow-500/15 hover:to-amber-500/15 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">Room Scoreboard</span>
                    <span className="text-xs text-yellow-400/60 ml-1">
                      ({Object.keys(gameState.scores).length} player{Object.keys(gameState.scores).length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  {showScoreboard ? (
                    <ChevronUp className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-yellow-400" />
                  )}
                </button>
                
                <AnimatePresence>
                  {showScoreboard && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 pt-2 space-y-1 bg-slate-800/30 rounded-b-xl border-x border-b border-yellow-500/20">
                        {Object.entries(gameState.scores)
                          .sort(([, a], [, b]) => b - a)
                          .map(([name, wins], idx) => (
                            <div key={name} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                {idx === 0 && <span>🥇</span>}
                                {idx === 1 && <span>🥈</span>}
                                {idx === 2 && <span>🥉</span>}
                                <span className="text-white">{name}</span>
                                {name === myPlayer?.name && (
                                  <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded">You</span>
                                )}
                              </div>
                              <span className="text-yellow-400 font-medium">{wins} win{wins !== 1 ? 's' : ''}</span>
                            </div>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Desktop: Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block"
          >
            <PlayerList
              players={gameState.players}
              currentTurnIndex={gameState.currentTurnIndex}
              myPlayerId={playerId}
              phase={gameState.phase}
              showAllLines={gameState.phase === 'ended'}
            />

            {/* Marked numbers count */}
            <div className="mt-4 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4">
              <div className="text-center">
                <span className="text-2xl font-bold text-white">
                  {gameState.markedNumbers.length}
                </span>
                <span className="text-slate-400 text-sm block">
                  / 25 numbers marked
                </span>
              </div>
            </div>

            {/* Winners so far */}
            {gameState.winners.length > 0 && gameState.phase === 'playing' && (
              <div className="mt-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-2xl border border-yellow-500/20 p-4">
                <h4 className="font-semibold text-yellow-400 mb-2 text-sm">Winners</h4>
                <div className="space-y-1">
                  {gameState.winners.map((winner, idx) => (
                    <div key={winner.id} className="flex items-center gap-2 text-sm">
                      <span>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                      <span className="text-white">{winner.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop: Room Scoreboard */}
            {Object.keys(gameState.scores).length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowScoreboard(!showScoreboard)}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-xl border border-yellow-500/20 hover:from-yellow-500/15 hover:to-amber-500/15 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">Room Scoreboard</span>
                    <span className="text-xs text-yellow-400/60 ml-1">
                      ({Object.keys(gameState.scores).length})
                    </span>
                  </div>
                  {showScoreboard ? (
                    <ChevronUp className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-yellow-400" />
                  )}
                </button>
                
                <AnimatePresence>
                  {showScoreboard && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 pt-2 space-y-1 bg-slate-800/30 rounded-b-xl border-x border-b border-yellow-500/20">
                        {Object.entries(gameState.scores)
                          .sort(([, a], [, b]) => b - a)
                          .map(([name, wins], idx) => (
                            <div key={name} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                {idx === 0 && <span>🥇</span>}
                                {idx === 1 && <span>🥈</span>}
                                {idx === 2 && <span>🥉</span>}
                                <span className="text-white">{name}</span>
                                {name === myPlayer?.name && (
                                  <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded">You</span>
                                )}
                              </div>
                              <span className="text-yellow-400 font-medium">{wins} win{wins !== 1 ? 's' : ''}</span>
                            </div>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Winner Modal */}
      {gameState.phase === 'ended' && (
        <WinnerModal
          winners={gameState.winners}
          players={gameState.players}
          myPlayerId={playerId}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
        />
      )}
    </div>
  );
}
