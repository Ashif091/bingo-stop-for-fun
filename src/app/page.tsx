'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Lobby from '@/components/Lobby';

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = (roomId: string, playerName: string, maxPlayers: number) => {
    if (!roomId.trim() || !playerName.trim()) {
      setError('Please enter both your name and a room ID');
      return;
    }

    // Store player name and role in sessionStorage
    sessionStorage.setItem('playerName', playerName);
    sessionStorage.setItem('isHost', 'true');
    sessionStorage.setItem('maxPlayers', String(maxPlayers));
    
    // Navigate to game room
    router.push(`/game/${roomId}`);
  };

  const handleJoinRoom = (roomId: string, playerName: string) => {
    if (!roomId.trim() || !playerName.trim()) {
      setError('Please enter both your name and a room ID');
      return;
    }

    // Store player name in sessionStorage
    sessionStorage.setItem('playerName', playerName);
    sessionStorage.removeItem('isHost');
    sessionStorage.removeItem('maxPlayers');
    
    // Navigate to game room
    router.push(`/game/${roomId}`);
  };

  return (
    <Lobby 
      onCreateRoom={handleCreateRoom} 
      onJoinRoom={handleJoinRoom} 
      error={error} 
    />
  );
}
