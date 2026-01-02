'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface StartingScreenProps {
  onComplete: () => void;
  countdownSeconds?: number;
}

export default function StartingScreen({
  onComplete,
  countdownSeconds = 3,
}: StartingScreenProps) {
  const [count, setCount] = useState(countdownSeconds);
  const [showGo, setShowGo] = useState(false);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (count === 0 && !showGo) {
      setShowGo(true);
      // Wait a moment after showing "GO!" before completing
      const goTimer = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(goTimer);
    }
  }, [count, showGo, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold text-white/80 mb-8"
        >
          Game Starting
        </motion.h1>

        {/* Countdown */}
        <AnimatePresence mode="wait">
          {count > 0 ? (
            <motion.div
              key={count}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {/* Glow effect behind number */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 sm:w-48 sm:h-48 bg-purple-500/30 rounded-full blur-2xl" />
              </div>
              
              {/* Number */}
              <span className="relative text-[120px] sm:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-200 drop-shadow-2xl">
                {count}
              </span>
            </motion.div>
          ) : showGo ? (
            <motion.div
              key="go"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.5 }}
                  className="w-48 h-48 sm:w-64 sm:h-64 bg-green-500/30 rounded-full blur-2xl"
                />
              </div>
              
              {/* GO! text */}
              <span className="relative text-[80px] sm:text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-emerald-400 drop-shadow-2xl">
                GO!
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-slate-400 text-sm sm:text-base"
        >
          Get ready to mark your numbers!
        </motion.p>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner decorations */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.5, scale: 1 }}
            transition={{ delay: i * 0.1 + 0.3 }}
            className={`absolute w-2 h-2 bg-purple-400 rounded-full ${
              i === 0 ? 'top-8 left-8' :
              i === 1 ? 'top-8 right-8' :
              i === 2 ? 'bottom-8 left-8' :
              'bottom-8 right-8'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
