'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

interface GridArrangementProps {
  grid: number[][];
  currentPlacement: number;
  isReady: boolean;
  onPlaceNumber: (row: number, col: number) => void;
}

export default function GridArrangement({
  grid,
  currentPlacement,
  isReady,
  onPlaceNumber,
}: GridArrangementProps) {
  const handleCellClick = (row: number, col: number) => {
    if (isReady) return;
    if (grid[row][col] !== 0) return; // Cell already filled
    onPlaceNumber(row, col);
  };

  return (
    <div className="relative">
      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-white mb-1">Arrange Your Grid</h3>
            <p className="text-sm text-slate-300">
              Click on empty cells to place numbers from 1 to 25 in your preferred order.
              {!isReady && (
                <span className="block mt-1 text-purple-400">
                  Next number to place: <strong className="text-xl">{currentPlacement}</strong>
                </span>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-slate-400 mb-1">
          <span>Progress</span>
          <span>{Math.min(currentPlacement - 1, 25)} / 25</span>
        </div>
        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentPlacement - 1) / 25) * 100}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 p-4 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50">
        {grid.map((row, rowIndex) =>
          row.map((cellValue, colIndex) => {
            const isEmpty = cellValue === 0;
            
            return (
              <motion.button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={!isEmpty || isReady}
                whileHover={isEmpty && !isReady ? { scale: 1.05 } : {}}
                whileTap={isEmpty && !isReady ? { scale: 0.95 } : {}}
                className={`
                  relative aspect-square flex items-center justify-center
                  text-lg sm:text-2xl font-bold rounded-xl
                  transition-all duration-300
                  ${isEmpty
                    ? isReady
                      ? 'bg-slate-700/30 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-700/50 hover:bg-purple-500/30 hover:border-purple-500/50 text-slate-400 cursor-pointer border-2 border-dashed border-slate-600/50'
                    : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30'
                  }
                `}
              >
                <AnimatePresence mode="wait">
                  {isEmpty ? (
                    !isReady && (
                      <motion.span
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        exit={{ opacity: 0 }}
                        className="text-sm"
                      >
                        ?
                      </motion.span>
                    )
                  ) : (
                    <motion.span
                      key={cellValue}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      {cellValue}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })
        )}
      </div>

      {/* Ready status */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 text-center"
          >
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-semibold text-lg">Ready to Play!</span>
            </span>
            <p className="text-slate-400 text-sm mt-2">Waiting for other players...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
