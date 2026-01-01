'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket-client';
import { 
  GameState, 
  Player, 
  SOCKET_EVENTS,
  RoomJoinedPayload,
  PlayerJoinedPayload,
  PlayerLeftPayload,
  GameStartedPayload,
  NumberMarkedPayload,
  GameOverPayload,
  ErrorPayload,
  NumberPlacedPayload,
  PlayerReadyPayload,
  PlayerWonPayload,
} from '@/types/game';
import { getCompletedLinePositions } from '@/lib/bingo-utils';

interface UseBingoReturn {
  // State
  gameState: GameState | null;
  playerId: string | null;
  isMyTurn: boolean;
  myPlayer: Player | null;
  error: string | null;
  isConnected: boolean;
  completedLinePositions: Set<string>;
  
  // Actions
  joinRoom: (roomId: string, playerName: string) => void;
  leaveRoom: () => void;
  startArranging: () => void;
  placeNumber: (row: number, col: number) => void;
  startGame: () => void;
  markNumber: (number: number) => void;
  restartGame: () => void;
  clearError: () => void;
}

export function useBingo(): UseBingoReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [completedLinePositions, setCompletedLinePositions] = useState<Set<string>>(new Set());
  
  // Prevent double joins from React StrictMode
  const hasJoinedRef = useRef(false);

  // Derived state
  const myPlayer = gameState?.players.find(p => p.id === playerId) ?? null;
  const isMyTurn = gameState?.phase === 'playing'
    ? gameState.players[gameState.currentTurnIndex]?.id === playerId 
    : false;

  // Update completed line positions when marked numbers change
  useEffect(() => {
    if (myPlayer && gameState && gameState.phase !== 'waiting' && gameState.phase !== 'arranging') {
      const positions = getCompletedLinePositions(myPlayer.grid, gameState.markedNumbers);
      setCompletedLinePositions(positions);
    } else {
      setCompletedLinePositions(new Set());
    }
  }, [myPlayer, gameState?.markedNumbers, gameState?.phase]);

  // Setup socket event listeners
  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    socket.on(SOCKET_EVENTS.ROOM_JOINED, (payload: RoomJoinedPayload) => {
      setGameState(payload.gameState);
      setPlayerId(payload.playerId);
      setError(null);
    });

    socket.on(SOCKET_EVENTS.PLAYER_JOINED, (payload: PlayerJoinedPayload) => {
      setGameState(prev => prev ? { ...prev, players: payload.players } : null);
    });

    socket.on(SOCKET_EVENTS.PLAYER_LEFT, (payload: PlayerLeftPayload) => {
      setGameState(prev => prev ? { 
        ...prev, 
        players: payload.players,
        currentTurnIndex: payload.currentTurnIndex 
      } : null);
    });

    socket.on(SOCKET_EVENTS.ARRANGING_STARTED, (payload: GameStartedPayload) => {
      setGameState(payload.gameState);
      setError(null);
    });

    socket.on(SOCKET_EVENTS.NUMBER_PLACED, (payload: NumberPlacedPayload) => {
      setGameState(prev => {
        if (!prev) return null;
        const players = prev.players.map(p => {
          if (p.id === payload.playerId) {
            const newGrid = p.grid.map(row => [...row]);
            newGrid[payload.row][payload.col] = payload.number;
            return {
              ...p,
              grid: newGrid,
              currentPlacement: payload.currentPlacement,
              isReady: payload.isReady,
            };
          }
          return p;
        });
        return { ...prev, players };
      });
    });

    socket.on(SOCKET_EVENTS.PLAYER_READY, (payload: PlayerReadyPayload) => {
      setGameState(prev => prev ? { ...prev, players: payload.players } : null);
    });

    socket.on(SOCKET_EVENTS.GAME_STARTED, (payload: GameStartedPayload) => {
      setGameState(payload.gameState);
      setError(null);
    });

    socket.on(SOCKET_EVENTS.NUMBER_MARKED, (payload: NumberMarkedPayload) => {
      setGameState(prev => prev ? {
        ...prev,
        markedNumbers: payload.markedNumbers,
        currentTurnIndex: payload.currentTurnIndex,
        players: payload.players,
      } : null);
    });

    socket.on(SOCKET_EVENTS.PLAYER_WON, (payload: PlayerWonPayload) => {
      setGameState(prev => {
        if (!prev) return null;
        const players = prev.players.map(p => 
          p.id === payload.player.id ? { ...p, rank: payload.rank } : p
        );
        const winners = [...prev.winners, payload.player];
        return { ...prev, players, winners };
      });
    });

    socket.on(SOCKET_EVENTS.GAME_OVER, (payload: GameOverPayload) => {
      setGameState(prev => prev ? { 
        ...prev, 
        phase: 'ended',
        winners: payload.winners,
        players: payload.players,
      } : null);
    });

    socket.on(SOCKET_EVENTS.ERROR, (payload: ErrorPayload) => {
      setError(payload.message);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off(SOCKET_EVENTS.ROOM_JOINED);
      socket.off(SOCKET_EVENTS.PLAYER_JOINED);
      socket.off(SOCKET_EVENTS.PLAYER_LEFT);
      socket.off(SOCKET_EVENTS.ARRANGING_STARTED);
      socket.off(SOCKET_EVENTS.NUMBER_PLACED);
      socket.off(SOCKET_EVENTS.PLAYER_READY);
      socket.off(SOCKET_EVENTS.GAME_STARTED);
      socket.off(SOCKET_EVENTS.NUMBER_MARKED);
      socket.off(SOCKET_EVENTS.PLAYER_WON);
      socket.off(SOCKET_EVENTS.GAME_OVER);
      socket.off(SOCKET_EVENTS.ERROR);
    };
  }, []);

  const joinRoom = useCallback((roomId: string, playerName: string) => {
    // Prevent double joins from React StrictMode
    if (hasJoinedRef.current) {
      console.log('Already joined, skipping duplicate join');
      return;
    }
    hasJoinedRef.current = true;
    
    const socket = getSocket();
    socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId, playerName });
  }, []);

  const leaveRoom = useCallback(() => {
    hasJoinedRef.current = false;
    const socket = getSocket();
    socket.emit(SOCKET_EVENTS.LEAVE_ROOM);
    setGameState(null);
    setPlayerId(null);
    disconnectSocket();
  }, []);

  const startArranging = useCallback(() => {
    if (!gameState) return;
    const socket = getSocket();
    socket.emit(SOCKET_EVENTS.START_ARRANGING, gameState.roomId);
  }, [gameState]);

  const placeNumber = useCallback((row: number, col: number) => {
    if (!gameState || !playerId) return;
    const socket = getSocket();
    socket.emit(SOCKET_EVENTS.PLACE_NUMBER, {
      roomId: gameState.roomId,
      playerId,
      row,
      col,
    });
  }, [gameState, playerId]);

  const startGame = useCallback(() => {
    if (!gameState) return;
    const socket = getSocket();
    socket.emit(SOCKET_EVENTS.START_GAME, gameState.roomId);
  }, [gameState]);

  const markNumber = useCallback((number: number) => {
    if (!gameState || !playerId) return;
    const socket = getSocket();
    socket.emit(SOCKET_EVENTS.MARK_NUMBER, {
      roomId: gameState.roomId,
      number,
      playerId,
    });
  }, [gameState, playerId]);

  const restartGame = useCallback(() => {
    if (!gameState) return;
    const socket = getSocket();
    socket.emit(SOCKET_EVENTS.RESTART_GAME, gameState.roomId);
  }, [gameState]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
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
    clearError,
  };
}
