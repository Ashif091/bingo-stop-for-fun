'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, X } from 'lucide-react';

interface FullscreenButtonProps {
  showNotification?: boolean;
  showButton?: boolean;
}

export default function FullscreenButton({ showNotification = true, showButton = true }: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
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
      setHasInteracted(true);
      setShowPrompt(false);
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

  // Show notification after a delay if not in fullscreen and hasn't interacted
  useEffect(() => {
    if (!isMounted || !showNotification || hasInteracted || isFullscreen) return;

    // Check if user has dismissed the prompt in this session
    const dismissed = sessionStorage.getItem('fullscreenPromptDismissed');
    if (dismissed) return;

    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isMounted, showNotification, hasInteracted, isFullscreen]);

  // Auto-hide notification after 10 seconds
  useEffect(() => {
    if (!showPrompt) return;

    const timer = setTimeout(() => {
      setShowPrompt(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [showPrompt]);

  const dismissPrompt = () => {
    setShowPrompt(false);
    setHasInteracted(true);
    sessionStorage.setItem('fullscreenPromptDismissed', 'true');
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!isMounted || !isFullscreenSupported) return null;

  return (
    <>
      {/* Fullscreen Toggle Button - only shown if showButton is true */}
      {showButton && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleFullscreen}
          className="fixed top-3 right-3 z-50 p-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all shadow-lg"
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

      {/* Fullscreen Notification Prompt */}
      <AnimatePresence>
        {showPrompt && !isFullscreen && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-16 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
          >
            <div className="bg-gradient-to-r from-purple-900/95 to-blue-900/95 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 shadow-2xl shadow-purple-500/20">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-purple-500/20 rounded-lg">
                  <Maximize2 className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white mb-1">
                    Fullscreen Recommended
                  </h4>
                  <p className="text-xs text-slate-300 mb-3">
                    Switch to fullscreen for a better gaming experience!
                  </p>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={toggleFullscreen}
                      className="flex-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-xs font-medium text-white transition-all"
                    >
                      Go Fullscreen
                    </motion.button>
                    <button
                      onClick={dismissPrompt}
                      className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-xs text-slate-300 hover:text-white transition-all"
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
                <button
                  onClick={dismissPrompt}
                  className="flex-shrink-0 p-1 text-slate-400 hover:text-white transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
