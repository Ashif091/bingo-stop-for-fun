'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBingo } from '@/hooks/useBingo';
import GameHeader from '@/components/GameHeader';
import BingoGrid from '@/components/BingoGrid';
import GridArrangement from '@/components/GridArrangement';
import PlayerList from '@/components/PlayerList';
import WinnerModal from '@/components/WinnerModal';
import WaitingRoom from '@/components/WaitingRoom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const {
    gameState,
    playerId,
    isMyTurn,
    myPlayer,
    error,
    isConnected,
    completedLinePositions,
    joinRoom,
    leaveRoom,
    startArranging,
    placeNumber,
    startGame,
    markNumber,
    restartGame,
  } = useBingo();

  // Get player name from sessionStorage or redirect to lobby
  useEffect(() => {
    const playerName = sessionStorage.getItem('playerName');
    if (!playerName) {
      router.push('/');
      return;
    }

    // Join the room
    if (roomId && !gameState) {
      joinRoom(roomId, playerName);
    }
  }, [roomId, gameState, joinRoom, router]);

  const handleLeave = () => {
    leaveRoom();
    sessionStorage.removeItem('playerName');
    router.push('/');
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

  // Waiting room or Arranging phase (with sidebar)
  if (gameState.phase === 'waiting') {
    return (
      <WaitingRoom
        roomId={roomId}
        players={gameState.players}
        myPlayerId={playerId}
        phase={gameState.phase}
        onStartArranging={startArranging}
        onStartGame={startGame}
        onLeave={handleLeave}
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
        <main className="container mx-auto px-4 py-6 relative z-10">
          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <div className="grid lg:grid-cols-[1fr_320px] gap-6 max-w-5xl mx-auto">
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
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {/* Player status */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4">
                <h3 className="font-semibold text-white mb-3">Players Status</h3>
                <div className="space-y-2">
                  {gameState.players.map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        player.isReady ? 'bg-green-500/10' : 'bg-slate-700/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
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
                    w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
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
      <main className="container mx-auto px-4 py-6 relative z-10">
        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="grid lg:grid-cols-[1fr_320px] gap-6 max-w-5xl mx-auto">
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
                showLines={true} // Show own lines
                myRank={myPlayer.rank}
              />
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
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
                <span className="text-3xl font-bold text-white">
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
                <h4 className="font-semibold text-yellow-400 mb-2">Winners</h4>
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
