# Bingo Game - Developer Documentation

A real-time multiplayer Bingo game built with Next.js and Socket.io.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server (Next.js + Socket.io)
npm run dev:socket
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
bingo-game/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── page.tsx            # Lobby (home page)
│   │   └── game/[roomId]/      # Game room page
│   ├── components/             # React components
│   │   ├── Lobby.tsx           # Room creation/joining
│   │   ├── WaitingRoom.tsx     # Pre-game waiting room
│   │   ├── BingoGrid.tsx       # 5x5 game grid
│   │   ├── GridArrangement.tsx # Grid setup phase
│   │   ├── GameHeader.tsx      # Top navigation
│   │   └── PlayerList.tsx      # Player list sidebar
│   ├── hooks/
│   │   └── useBingo.ts         # Socket.io state management
│   ├── lib/
│   │   ├── socket-client.ts    # Client-side socket connection
│   │   ├── socket-server.ts    # Server-side socket handlers
│   │   └── bingo-utils.ts      # Game logic utilities
│   └── types/
│       └── game.ts             # TypeScript interfaces
├── public/
│   └── bongo-logo.svg          # App logo
├── server.ts                   # Next.js custom server with Socket.io
└── socket-server.ts            # Standalone Socket.io server
```

## 🎮 Game Features

### Core Gameplay
- **1-25 Numbers**: Players arrange numbers 1-25 on a 5x5 grid
- **Turn-based**: Players take turns calling numbers
- **Win Condition**: First to complete 5 lines (rows, columns, or diagonals)

### Room Features
- **Player Limit**: Host sets max players (2-10)
- **Scoreboard**: Tracks wins per player, persists across games
- **Duplicate Name Prevention**: Blocks joining with taken name
- **Host Kick**: Host can remove players before game starts

### Game Flow
1. **Lobby** → Enter name, create/join room
2. **Waiting Room** → Wait for players
3. **Arranging Phase** → Place numbers 1-25 on grid
4. **Playing Phase** → Take turns calling numbers
5. **Game Over** → View results, play again

## 🛠 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Real-time**: Socket.io
- **Build**: Turbopack

## 📝 Key Files

### `src/types/game.ts`
Core TypeScript interfaces:
- `GameState` - Room state (players, phase, scores)
- `Player` - Player data (name, grid, completedLines)
- `SOCKET_EVENTS` - Event constants

### `src/lib/socket-server.ts`
Server-side handlers:
- `handleCreateRoom` - Room creation with player limit
- `handleJoinRoom` - Join validation (name check, capacity)
- `handleMarkNumber` - Number calling with win detection
- `handleKickPlayer` - Host player removal

### `src/hooks/useBingo.ts`
Client-side state:
- Socket connection management
- Game state synchronization
- Action dispatchers (createRoom, joinRoom, markNumber, etc.)

## 🔌 Socket Events

### Client → Server
| Event | Description |
|-------|-------------|
| `create-room` | Create room with player limit |
| `join-room` | Join existing room |
| `leave-room` | Leave current room |
| `kick-player` | Host removes player |
| `start-arranging` | Begin grid setup |
| `place-number` | Place number on grid |
| `start-game` | Begin gameplay |
| `mark-number` | Call a number |
| `restart-game` | New round |

### Server → Client
| Event | Description |
|-------|-------------|
| `room-joined` | Confirmed join with game state |
| `player-joined` | New player notification |
| `player-left` | Player left notification |
| `player-kicked` | Kicked player notification |
| `number-marked` | Number called update |
| `player-won` | Winner declared |
| `game-over` | Game ended with scores |
| `error` | Error message |

## 🧪 Development Scripts

```bash
npm run dev          # Next.js dev (requires separate socket server)
npm run dev:socket   # Next.js + Socket.io combined
npm run build        # Production build
npm run start        # Start production server
npm run start:socket # Start standalone socket server
npm run lint         # ESLint check
```

## 🎨 UI Components

### Color Scheme
- Primary: Purple/Blue gradient
- Success: Green (your turn, ready)
- Warning: Yellow (scoreboard, host badge)
- Danger: Red (kick button, errors)

### Animations
- Framer Motion for transitions
- Pulse effects for active elements
- Line completion glow effect
