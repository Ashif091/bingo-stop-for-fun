'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Hash, LogOut, Users, Wifi, WifiOff, Maximize2, Minimize2 } from 'lucide-react';

interface GameHeaderProps {
  roomId: string;
  playerCount: number;
  isConnected: boolean;
  onLeave: () => void;
}

export default function GameHeader({ roomId, playerCount, isConnected, onLeave }: GameHeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isFullscreenSupported, setIsFullscreenSupported] = useState(false);

  // Check if fullscreen is supported after mount
  useEffect(() => {
    setIsMounted(true);
    const supported = 
      document.fullscreenEnabled || 
      !!(document as unknown as { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled ||
      !!(document as unknown as { mozFullScreenEnabled?: boolean }).mozFullScreenEnabled ||
      !!(document as unknown as { msFullscreenEnabled?: boolean }).msFullscreenEnabled;
    setIsFullscreenSupported(supported);
  }, []);

  // Update fullscreen state
  const updateFullscreenState = useCallback(() => {
    const fullscreenElement = 
      document.fullscreenElement ||
      (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
      (document as unknown as { mozFullScreenElement?: Element }).mozFullScreenElement ||
      (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement;
    
    setIsFullscreen(!!fullscreenElement);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          await (elem as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
        } else if ((elem as unknown as { mozRequestFullScreen?: () => Promise<void> }).mozRequestFullScreen) {
          await (elem as unknown as { mozRequestFullScreen: () => Promise<void> }).mozRequestFullScreen();
        } else if ((elem as unknown as { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen) {
          await (elem as unknown as { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
          await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
        } else if ((document as unknown as { mozCancelFullScreen?: () => Promise<void> }).mozCancelFullScreen) {
          await (document as unknown as { mozCancelFullScreen: () => Promise<void> }).mozCancelFullScreen();
        } else if ((document as unknown as { msExitFullscreen?: () => Promise<void> }).msExitFullscreen) {
          await (document as unknown as { msExitFullscreen: () => Promise<void> }).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    if (!isMounted) return;

    const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
    
    events.forEach(event => {
      document.addEventListener(event, updateFullscreenState);
    });

    updateFullscreenState();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateFullscreenState);
      });
    };
  }, [isMounted, updateFullscreenState]);

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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Fullscreen button */}
            {isMounted && isFullscreenSupported && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleFullscreen}
                className="p-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-lg text-slate-300 hover:text-white transition-all"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </motion.button>
            )}

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

