'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Lobby from '@/components/Lobby';

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleJoinRoom = (roomId: string, playerName: string) => {
    if (!roomId.trim() || !playerName.trim()) {
      setError('Please enter both your name and a room ID');
      return;
    }

    // Store player name in sessionStorage
    sessionStorage.setItem('playerName', playerName);
    
    // Navigate to game room
    router.push(`/game/${roomId}`);
  };

  return (
    <Lobby onJoinRoom={handleJoinRoom} error={error} />
  );
}
