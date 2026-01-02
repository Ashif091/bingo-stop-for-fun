'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Play, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface HostNotificationProps {
  isVisible: boolean;
  onStartGame: () => void;
  onDismiss: () => void;
}

export default function HostNotification({
  isVisible,
  onStartGame,
  onDismiss,
}: HostNotificationProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedSound = useRef(false);

  // Play notification sound when notification becomes visible
  useEffect(() => {
    if (isVisible && !hasPlayedSound.current) {
      hasPlayedSound.current = true;
      
      // Create and play a simple notification sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        
        // Create a simple "ding" sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
        oscillator.type = 'sine';
        
        // Low volume
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.log('Could not play notification sound:', error);
      }
    }
    
    if (!isVisible) {
      hasPlayedSound.current = false;
    }
  }, [isVisible]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-gradient-to-r from-green-600/90 to-emerald-600/90 backdrop-blur-xl rounded-2xl border border-green-400/30 shadow-2xl shadow-green-500/20 overflow-hidden">
            {/* Progress bar for auto-dismiss */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="h-1 bg-white/30"
            />
            
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Everyone is Ready!</h4>
                    <p className="text-green-100 text-xs">All players have arranged their grids</p>
                  </div>
                </div>
                <button
                  onClick={onDismiss}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>

              {/* Start Game Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartGame}
                className="w-full py-3 bg-white text-green-600 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-green-50 transition-colors"
              >
                <Play className="w-5 h-5" />
                Start Game Now!
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
