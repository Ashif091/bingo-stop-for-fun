// Game phases
export type GamePhase = 'waiting' | 'arranging' | 'playing' | 'ended';

// Player interface
export interface Player {
  id: string;
  name: string;
  grid: number[][]; // 5x5 grid with numbers 1-25 (0 = empty cell)
  completedLines: number;
  isReady: boolean; // Grid arrangement complete
  currentPlacement: number; // Next number to place (1-25, 26 = done)
  rank?: number; // 1st, 2nd, 3rd place (undefined = not won yet)
}

// Game state shared between all clients
export interface GameState {
  roomId: string;
  players: Player[];
  markedNumbers: number[]; // Numbers that have been marked (crossed out)
  currentTurnIndex: number; // Index of player whose turn it is
  phase: GamePhase;
  winners: Player[]; // Ordered: 1st, 2nd, 3rd place
  maxPlayers: number; // Host-configured player limit (2-10)
  scores: Record<string, number>; // Player name → win count (persists across games)
}

// Socket event payloads
export interface CreateRoomPayload {
  roomId: string;
  playerName: string;
  maxPlayers: number;
}

export interface JoinRoomPayload {
  roomId: string;
  playerName: string;
}

export interface PlaceNumberPayload {
  roomId: string;
  playerId: string;
  row: number;
  col: number;
}

export interface MarkNumberPayload {
  roomId: string;
  number: number;
  playerId: string;
}

export interface RoomJoinedPayload {
  gameState: GameState;
  playerId: string;
}

export interface NumberPlacedPayload {
  playerId: string;
  row: number;
  col: number;
  number: number;
  currentPlacement: number;
  isReady: boolean;
}

export interface NumberMarkedPayload {
  number: number;
  markedNumbers: number[];
  currentTurnIndex: number;
  players: Player[]; // Updated with new line counts (lines hidden for non-self)
}

export interface GameOverPayload {
  winners: Player[];
  players: Player[]; // All players with revealed line counts
}

export interface PlayerWonPayload {
  player: Player;
  rank: number;
}

export interface PlayerJoinedPayload {
  player: Player;
  players: Player[];
}

export interface PlayerLeftPayload {
  playerId: string;
  players: Player[];
  currentTurnIndex: number;
}

export interface GameStartedPayload {
  gameState: GameState;
}

export interface PlayerReadyPayload {
  playerId: string;
  players: Player[];
}

export interface ErrorPayload {
  message: string;
}

// Socket event names as constants for type safety
export const SOCKET_EVENTS = {
  // Client to Server
  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  START_ARRANGING: 'start-arranging',
  PLACE_NUMBER: 'place-number',
  START_GAME: 'start-game',
  MARK_NUMBER: 'mark-number',
  RESTART_GAME: 'restart-game',
  KICK_PLAYER: 'kick-player',
  
  // Server to Client
  ROOM_JOINED: 'room-joined',
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  PLAYER_KICKED: 'player-kicked',
  ARRANGING_STARTED: 'arranging-started',
  NUMBER_PLACED: 'number-placed',
  PLAYER_READY: 'player-ready',
  GAME_STARTED: 'game-started',
  NUMBER_MARKED: 'number-marked',
  PLAYER_WON: 'player-won',
  GAME_OVER: 'game-over',
  ERROR: 'error',
} as const;
