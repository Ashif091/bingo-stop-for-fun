import { Server as SocketIOServer, Socket } from 'socket.io';
import { 
  GameState, 
  Player, 
  CreateRoomPayload,
  JoinRoomPayload, 
  PlaceNumberPayload,
  MarkNumberPayload,
  SOCKET_EVENTS 
} from '@/types/game';
import { calculateCompletedLines } from './bingo-utils';

// In-memory storage for rooms
const rooms: Map<string, GameState> = new Map();

// Track socket to room mapping for cleanup
const socketToRoom: Map<string, string> = new Map();

/**
 * Create empty 5x5 grid (all zeros)
 */
function createEmptyGrid(): number[][] {
  return Array.from({ length: 5 }, () => Array(5).fill(0));
}

/**
 * Calculate score points based on rank and number of players
 * - 2 players: 1st = 1 point
 * - 3 players: 1st = 2 points, 2nd = 1 point
 * - 4+ players: 1st = 3 points, 2nd = 2 points, 3rd = 1 point
 */
function calculateScoreForRank(rank: number, totalPlayers: number): number {
  if (totalPlayers === 2) {
    // Only 1 winner, gets 1 point
    return rank === 1 ? 1 : 0;
  } else if (totalPlayers === 3) {
    // 2 winners: 1st = 2, 2nd = 1
    if (rank === 1) return 2;
    if (rank === 2) return 1;
    return 0;
  } else {
    // 4+ players: 3 winners: 1st = 3, 2nd = 2, 3rd = 1
    if (rank === 1) return 3;
    if (rank === 2) return 2;
    if (rank === 3) return 1;
    return 0;
  }
}

/**
 * Initialize Socket.io event handlers
 */
export function initializeSocketHandlers(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle creating a room (host sets player limit)
    socket.on(SOCKET_EVENTS.CREATE_ROOM, (payload: CreateRoomPayload) => {
      handleCreateRoom(io, socket, payload);
    });

    // Handle joining a room
    socket.on(SOCKET_EVENTS.JOIN_ROOM, (payload: JoinRoomPayload) => {
      handleJoinRoom(io, socket, payload);
    });

    // Handle leaving a room
    socket.on(SOCKET_EVENTS.LEAVE_ROOM, () => {
      handleLeaveRoom(io, socket);
    });

    // Handle kicking a player (host only)
    socket.on(SOCKET_EVENTS.KICK_PLAYER, (payload: { roomId: string; playerId: string }) => {
      handleKickPlayer(io, socket, payload);
    });

    // Handle starting the arranging phase
    socket.on(SOCKET_EVENTS.START_ARRANGING, (roomId: string) => {
      handleStartArranging(io, socket, roomId);
    });

    // Handle placing a number during arrangement
    socket.on(SOCKET_EVENTS.PLACE_NUMBER, (payload: PlaceNumberPayload) => {
      handlePlaceNumber(io, socket, payload);
    });

    // Handle starting the game
    socket.on(SOCKET_EVENTS.START_GAME, (roomId: string) => {
      handleStartGame(io, socket, roomId);
    });

    // Handle marking a number
    socket.on(SOCKET_EVENTS.MARK_NUMBER, (payload: MarkNumberPayload) => {
      handleMarkNumber(io, socket, payload);
    });

    // Handle restarting the game
    socket.on(SOCKET_EVENTS.RESTART_GAME, (roomId: string) => {
      handleRestartGame(io, socket, roomId);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      handleLeaveRoom(io, socket);
    });
  });
}

function handleCreateRoom(io: SocketIOServer, socket: Socket, payload: CreateRoomPayload) {
  const { roomId, playerName, maxPlayers } = payload;

  // Check if this socket already joined a room
  if (socketToRoom.has(socket.id)) {
    console.log(`Socket ${socket.id} already in a room, ignoring`);
    return;
  }

  // Check if room already exists
  if (rooms.has(roomId)) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room already exists. Try a different ID or join.' });
    return;
  }

  // Create new room with host's settings
  const gameState: GameState = {
    roomId,
    players: [],
    markedNumbers: [],
    currentTurnIndex: 0,
    phase: 'waiting',
    winners: [],
    maxPlayers: Math.max(2, Math.min(10, maxPlayers)), // Clamp between 2-10
    scores: {}, // Initialize empty scoreboard
  };
  rooms.set(roomId, gameState);

  // Create host player
  const player: Player = {
    id: socket.id,
    name: playerName,
    grid: createEmptyGrid(),
    completedLines: 0,
    isReady: false,
    currentPlacement: 1,
  };

  gameState.players.push(player);
  socketToRoom.set(socket.id, roomId);
  socket.join(roomId);

  socket.emit(SOCKET_EVENTS.ROOM_JOINED, {
    gameState,
    playerId: socket.id,
  });

  console.log(`Room ${roomId} created by ${playerName} (max: ${gameState.maxPlayers} players)`);
}

function handleJoinRoom(io: SocketIOServer, socket: Socket, payload: JoinRoomPayload) {
  const { roomId, playerName } = payload;

  // Check if this socket already joined a room
  if (socketToRoom.has(socket.id)) {
    console.log(`Socket ${socket.id} already in a room, ignoring duplicate join`);
    return;
  }

  // Room must exist (created by host first)
  const gameState = rooms.get(roomId);
  
  if (!gameState) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room not found. Check the Room ID or create a new room.' });
    return;
  }

  // Check if player with same socket id already exists
  if (gameState.players.some(p => p.id === socket.id)) {
    console.log(`Player ${socket.id} already in room, ignoring duplicate`);
    return;
  }

  // *** NEW: Check if name already exists in room ***
  if (gameState.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Name already taken. Please use a different name.' });
    return;
  }

  // Check if game is already playing (not waiting or arranging)
  if (gameState.phase === 'playing' || gameState.phase === 'ended') {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Game is in progress. Please wait for the next game.' });
    return;
  }

  // Check if room is full (use host's maxPlayers setting)
  if (gameState.players.length >= gameState.maxPlayers) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: `Room is full (${gameState.maxPlayers} players max)` });
    return;
  }

  // Create new player
  const player: Player = {
    id: socket.id,
    name: playerName,
    grid: createEmptyGrid(),
    completedLines: 0,
    isReady: false,
    currentPlacement: 1,
  };

  // Add player to game state
  gameState.players.push(player);
  
  // Track socket to room mapping
  socketToRoom.set(socket.id, roomId);

  // Join socket room
  socket.join(roomId);

  // Notify the joining player
  socket.emit(SOCKET_EVENTS.ROOM_JOINED, {
    gameState,
    playerId: socket.id,
  });

  // Notify other players in the room
  socket.to(roomId).emit(SOCKET_EVENTS.PLAYER_JOINED, {
    player,
    players: gameState.players,
  });

  console.log(`Player ${playerName} joined room ${roomId}`);
}

function handleLeaveRoom(io: SocketIOServer, socket: Socket) {
  const roomId = socketToRoom.get(socket.id);
  if (!roomId) return;

  const gameState = rooms.get(roomId);
  if (!gameState) return;

  // Remove player from game state
  const playerIndex = gameState.players.findIndex(p => p.id === socket.id);
  if (playerIndex === -1) return;

  const leavingPlayer = gameState.players[playerIndex];
  gameState.players.splice(playerIndex, 1);
  socketToRoom.delete(socket.id);

  // Leave socket room
  socket.leave(roomId);

  // If no players left, delete the room
  if (gameState.players.length === 0) {
    rooms.delete(roomId);
    console.log(`Room ${roomId} deleted (no players)`);
    return;
  }

  // Adjust current turn if needed
  if (gameState.currentTurnIndex >= gameState.players.length) {
    gameState.currentTurnIndex = 0;
  }

  // Check for auto-win: if only 1 player left during gameplay, they win automatically
  if ((gameState.phase === 'playing' || gameState.phase === 'starting') && gameState.players.length === 1) {
    const lastPlayer = gameState.players[0];
    
    // Don't auto-win if the last player has already won
    if (!lastPlayer.rank) {
      lastPlayer.rank = 1;
      gameState.winners = [{ ...lastPlayer }];
      gameState.phase = 'ended';
      
      // Update scoreboard with proper score based on rank
      const scoreToAdd = calculateScoreForRank(1, gameState.players.length + 1); // +1 because leaving player is already removed
      if (!gameState.scores[lastPlayer.name]) {
        gameState.scores[lastPlayer.name] = 0;
      }
      gameState.scores[lastPlayer.name] += scoreToAdd;
      
      // Notify about player leaving first
      io.to(roomId).emit(SOCKET_EVENTS.PLAYER_LEFT, {
        playerId: socket.id,
        players: gameState.players,
        currentTurnIndex: gameState.currentTurnIndex,
      });
      
      // Then notify about the auto-win
      io.to(roomId).emit(SOCKET_EVENTS.PLAYER_WON, {
        player: lastPlayer,
        rank: 1,
      });
      
      // Finally emit game over
      io.to(roomId).emit(SOCKET_EVENTS.GAME_OVER, {
        winners: gameState.winners,
        players: gameState.players,
        scores: gameState.scores,
      });
      
      console.log(`Player ${lastPlayer.name} auto-won in room ${roomId} (last player standing)`);
      return;
    }
  }

  // Notify remaining players
  io.to(roomId).emit(SOCKET_EVENTS.PLAYER_LEFT, {
    playerId: socket.id,
    players: gameState.players,
    currentTurnIndex: gameState.currentTurnIndex,
  });

  console.log(`Player ${socket.id} left room ${roomId}`);
}

// *** NEW: Handle kicking a player ***
function handleKickPlayer(io: SocketIOServer, socket: Socket, payload: { roomId: string; playerId: string }) {
  const { roomId, playerId } = payload;

  const gameState = rooms.get(roomId);
  if (!gameState) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room not found' });
    return;
  }

  // Only host can kick
  if (gameState.players[0]?.id !== socket.id) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Only the host can kick players' });
    return;
  }

  // Can only kick in waiting phase
  if (gameState.phase !== 'waiting') {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Can only kick players before the game starts' });
    return;
  }

  // Can't kick yourself
  if (playerId === socket.id) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Cannot kick yourself' });
    return;
  }

  // Find the player to kick
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Player not found' });
    return;
  }

  const kickedPlayer = gameState.players[playerIndex];

  // Remove player
  gameState.players.splice(playerIndex, 1);
  socketToRoom.delete(playerId);

  // Notify kicked player
  io.to(playerId).emit(SOCKET_EVENTS.PLAYER_KICKED, {
    reason: 'You were removed by the host',
  });

  // Make kicked player leave the socket room
  const kickedSocket = io.sockets.sockets.get(playerId);
  if (kickedSocket) {
    kickedSocket.leave(roomId);
  }

  // Notify remaining players
  io.to(roomId).emit(SOCKET_EVENTS.PLAYER_LEFT, {
    playerId,
    players: gameState.players,
    currentTurnIndex: gameState.currentTurnIndex,
  });

  console.log(`Player ${kickedPlayer.name} was kicked from room ${roomId}`);
}

function handleStartArranging(io: SocketIOServer, socket: Socket, roomId: string) {
  const gameState = rooms.get(roomId);
  if (!gameState) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room not found' });
    return;
  }

  // Only host can start arranging
  if (gameState.players[0]?.id !== socket.id) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Only the host can start' });
    return;
  }

  // Need at least 2 players
  if (gameState.players.length < 2) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Need at least 2 players to start' });
    return;
  }

  // Start arranging phase
  gameState.phase = 'arranging';
  
  // Reset all players' grids and ready state
  gameState.players.forEach(player => {
    player.grid = createEmptyGrid();
    player.isReady = false;
    player.currentPlacement = 1;
    player.completedLines = 0;
    player.rank = undefined;
  });

  // Notify all players
  io.to(roomId).emit(SOCKET_EVENTS.ARRANGING_STARTED, {
    gameState,
  });

  console.log(`Arranging phase started in room ${roomId}`);
}

function handlePlaceNumber(io: SocketIOServer, socket: Socket, payload: PlaceNumberPayload) {
  const { roomId, playerId, row, col } = payload;

  const gameState = rooms.get(roomId);
  if (!gameState) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room not found' });
    return;
  }

  if (gameState.phase !== 'arranging') {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Not in arranging phase' });
    return;
  }

  // Find the player
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Player not found' });
    return;
  }

  if (player.isReady) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Already ready' });
    return;
  }

  // Validate cell is empty
  if (player.grid[row][col] !== 0) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Cell is not empty' });
    return;
  }

  // Place the number
  player.grid[row][col] = player.currentPlacement;
  player.currentPlacement++;

  // Check if player is ready (placed all 25 numbers)
  if (player.currentPlacement > 25) {
    player.isReady = true;
  }

  // Notify all players about this placement
  io.to(roomId).emit(SOCKET_EVENTS.NUMBER_PLACED, {
    playerId,
    row,
    col,
    number: player.grid[row][col],
    currentPlacement: player.currentPlacement,
    isReady: player.isReady,
  });

  // If player is now ready, also send player ready event
  if (player.isReady) {
    io.to(roomId).emit(SOCKET_EVENTS.PLAYER_READY, {
      playerId,
      players: gameState.players,
    });
    console.log(`Player ${player.name} is ready in room ${roomId}`);
  }
}

function handleStartGame(io: SocketIOServer, socket: Socket, roomId: string) {
  const gameState = rooms.get(roomId);
  if (!gameState) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room not found' });
    return;
  }

  // Only host can start the game
  if (gameState.players[0]?.id !== socket.id) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Only the host can start' });
    return;
  }

  // Check all players are ready
  const allReady = gameState.players.every(p => p.isReady);
  if (!allReady) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'All players must be ready' });
    return;
  }

  // Set phase to 'starting' for countdown screen
  gameState.phase = 'starting';
  gameState.currentTurnIndex = 0;
  gameState.markedNumbers = [];
  gameState.winners = [];

  // Reset line counts
  gameState.players.forEach(player => {
    player.completedLines = 0;
    player.rank = undefined;
  });

  // Emit GAME_STARTING for countdown screen (3 seconds countdown + 1 second for "GO!")
  io.to(roomId).emit(SOCKET_EVENTS.GAME_STARTING, {
    gameState,
    countdownSeconds: 3,
  });

  console.log(`Game starting countdown in room ${roomId}`);

  // After countdown (3s + 1s buffer), start the actual game
  setTimeout(() => {
    const currentState = rooms.get(roomId);
    if (currentState && currentState.phase === 'starting') {
      currentState.phase = 'playing';
      
      // Notify all players that the game has actually started
      io.to(roomId).emit(SOCKET_EVENTS.GAME_STARTED, {
        gameState: currentState,
      });
      
      console.log(`Game started in room ${roomId}`);
    }
  }, 4000); // 3s countdown + 1s for "GO!" display
}

function handleMarkNumber(io: SocketIOServer, socket: Socket, payload: MarkNumberPayload) {
  const { roomId, number, playerId } = payload;

  const gameState = rooms.get(roomId);
  if (!gameState) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room not found' });
    return;
  }

  if (gameState.phase !== 'playing') {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Game not started' });
    return;
  }

  // Check if it's this player's turn
  const currentPlayer = gameState.players[gameState.currentTurnIndex];
  if (currentPlayer.id !== playerId) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Not your turn' });
    return;
  }

  // Check if number is valid
  if (number < 1 || number > 25) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid number' });
    return;
  }

  // Check if number already marked
  if (gameState.markedNumbers.includes(number)) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Number already marked' });
    return;
  }

  // Mark the number
  gameState.markedNumbers.push(number);

  // Update completed lines for all players
  gameState.players.forEach(player => {
    player.completedLines = calculateCompletedLines(player.grid, gameState.markedNumbers);
  });

  // *** PRIORITY WINNING: Clicker gets 1st if they reach 5 lines ***
  const maxWinners = gameState.players.length <= 2 ? 1 : 3;
  const clickerId = playerId; // The person who clicked
  
  // Find all players who just reached 5 lines
  const newFiveLiners = gameState.players.filter(
    p => p.completedLines >= 5 && !p.rank && gameState.winners.length < maxWinners
  );

  if (newFiveLiners.length > 0) {
    // Check if clicker is among the new 5-liners
    const clickerAmongWinners = newFiveLiners.find(p => p.id === clickerId);
    
    // Sort: clicker first, then randomize others
    const otherWinners = newFiveLiners.filter(p => p.id !== clickerId);
    shuffleArray(otherWinners);
    
    const orderedNewWinners = clickerAmongWinners 
      ? [clickerAmongWinners, ...otherWinners]
      : otherWinners;

    // Assign ranks
    for (const player of orderedNewWinners) {
      if (gameState.winners.length >= maxWinners) break;
      
      player.rank = gameState.winners.length + 1;
      gameState.winners.push({ ...player });
      
      // *** UPDATE SCOREBOARD with proper score based on rank ***
      const scoreToAdd = calculateScoreForRank(player.rank, gameState.players.length);
      if (!gameState.scores[player.name]) {
        gameState.scores[player.name] = 0;
      }
      gameState.scores[player.name] += scoreToAdd;
      
      // Notify about new winner
      io.to(roomId).emit(SOCKET_EVENTS.PLAYER_WON, {
        player,
        rank: player.rank,
      });
      
      console.log(`Player ${player.name} got ${getOrdinal(player.rank)} place in room ${roomId}!`);
    }
  }

  // Move to next turn (skip winners)
  do {
    gameState.currentTurnIndex = (gameState.currentTurnIndex + 1) % gameState.players.length;
  } while (gameState.players[gameState.currentTurnIndex].rank && 
           gameState.winners.length < gameState.players.length);

  // Check if game is over
  const gameOver = gameState.winners.length >= maxWinners || 
                   gameState.markedNumbers.length >= 25 ||
                   gameState.winners.length >= gameState.players.length - 1;

  if (gameOver) {
    gameState.phase = 'ended';
    
    // Notify all players about the number marked first
    io.to(roomId).emit(SOCKET_EVENTS.NUMBER_MARKED, {
      number,
      markedNumbers: gameState.markedNumbers,
      currentTurnIndex: gameState.currentTurnIndex,
      players: gameState.players, // All lines revealed now
    });
    
    // Then notify game over with full reveal and scores
    io.to(roomId).emit(SOCKET_EVENTS.GAME_OVER, {
      winners: gameState.winners,
      players: gameState.players,
      scores: gameState.scores,
    });

    console.log(`Game ended in room ${roomId}!`);
    return;
  }

  // Notify all players about the number marked
  io.to(roomId).emit(SOCKET_EVENTS.NUMBER_MARKED, {
    number,
    markedNumbers: gameState.markedNumbers,
    currentTurnIndex: gameState.currentTurnIndex,
    players: gameState.players,
  });

  console.log(`Number ${number} marked in room ${roomId}`);
}

function handleRestartGame(io: SocketIOServer, socket: Socket, roomId: string) {
  const gameState = rooms.get(roomId);
  if (!gameState) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room not found' });
    return;
  }

  // Find the player who clicked "Play Again"
  const player = gameState.players.find(p => p.id === socket.id);
  if (!player) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Player not found' });
    return;
  }

  // Reset only THIS player's state (not everyone)
  player.grid = createEmptyGrid();
  player.isReady = false;
  player.currentPlacement = 1;
  player.completedLines = 0;
  player.rank = undefined;

  // Check if ALL players have clicked "Play Again" (all have currentPlacement reset to 1)
  // We use currentPlacement because losers also have rank = undefined
  const allPlayersReady = gameState.players.every(p => p.currentPlacement === 1);

  if (allPlayersReady) {
    // Everyone has clicked Play Again, start arranging phase
    gameState.phase = 'arranging';
    gameState.currentTurnIndex = 0;
    gameState.markedNumbers = [];
    gameState.winners = [];

    // Notify all players to start arranging
    io.to(roomId).emit(SOCKET_EVENTS.ARRANGING_STARTED, {
      gameState,
    });

    console.log(`All players ready, game restarted in room ${roomId}`);
  } else {
    // Only this player is ready, notify everyone about the update
    // This player will see arranging screen, others still see winner modal
    io.to(roomId).emit(SOCKET_EVENTS.PLAYER_READY_FOR_NEXT, {
      playerId: socket.id,
      players: gameState.players,
    });

    console.log(`Player ${player.name} ready for next game in room ${roomId}`);
  }
}

function getOrdinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
