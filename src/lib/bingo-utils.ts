/**
 * Bingo Game Utility Functions
 * 
 * This module contains all the core game logic for the 1-25 Bingo game.
 */

/**
 * Generates a shuffled 5x5 grid with numbers 1 to 25
 */
export function generateGrid(): number[][] {
  // Create array with numbers 1 to 25
  const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
  
  // Fisher-Yates shuffle
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  
  // Convert to 5x5 grid
  const grid: number[][] = [];
  for (let row = 0; row < 5; row++) {
    grid.push(numbers.slice(row * 5, (row + 1) * 5));
  }
  
  return grid;
}

/**
 * Calculates the number of completed lines on a grid
 * 
 * A line is completed when all 5 numbers in a row, column, or diagonal
 * are marked (present in markedNumbers).
 * 
 * @param grid - The player's 5x5 grid
 * @param markedNumbers - Array of numbers that have been marked
 * @returns Number of completed lines (0-12 possible: 5 rows + 5 cols + 2 diagonals)
 */
export function calculateCompletedLines(grid: number[][], markedNumbers: number[]): number {
  const markedSet = new Set(markedNumbers);
  let completedLines = 0;
  
  // Check rows (5 possible lines)
  for (let row = 0; row < 5; row++) {
    if (grid[row].every(num => markedSet.has(num))) {
      completedLines++;
    }
  }
  
  // Check columns (5 possible lines)
  for (let col = 0; col < 5; col++) {
    let columnComplete = true;
    for (let row = 0; row < 5; row++) {
      if (!markedSet.has(grid[row][col])) {
        columnComplete = false;
        break;
      }
    }
    if (columnComplete) {
      completedLines++;
    }
  }
  
  // Check main diagonal (top-left to bottom-right)
  let mainDiagonalComplete = true;
  for (let i = 0; i < 5; i++) {
    if (!markedSet.has(grid[i][i])) {
      mainDiagonalComplete = false;
      break;
    }
  }
  if (mainDiagonalComplete) {
    completedLines++;
  }
  
  // Check anti-diagonal (top-right to bottom-left)
  let antiDiagonalComplete = true;
  for (let i = 0; i < 5; i++) {
    if (!markedSet.has(grid[i][4 - i])) {
      antiDiagonalComplete = false;
      break;
    }
  }
  if (antiDiagonalComplete) {
    completedLines++;
  }
  
  return completedLines;
}

/**
 * Gets the positions of cells that form completed lines
 * Used for highlighting completed lines in the UI
 * 
 * @param grid - The player's 5x5 grid
 * @param markedNumbers - Array of numbers that have been marked
 * @returns Set of positions as "row-col" strings
 */
export function getCompletedLinePositions(grid: number[][], markedNumbers: number[]): Set<string> {
  const markedSet = new Set(markedNumbers);
  const completedPositions = new Set<string>();
  
  // Check rows
  for (let row = 0; row < 5; row++) {
    if (grid[row].every(num => markedSet.has(num))) {
      for (let col = 0; col < 5; col++) {
        completedPositions.add(`${row}-${col}`);
      }
    }
  }
  
  // Check columns
  for (let col = 0; col < 5; col++) {
    let columnComplete = true;
    for (let row = 0; row < 5; row++) {
      if (!markedSet.has(grid[row][col])) {
        columnComplete = false;
        break;
      }
    }
    if (columnComplete) {
      for (let row = 0; row < 5; row++) {
        completedPositions.add(`${row}-${col}`);
      }
    }
  }
  
  // Check main diagonal
  let mainDiagonalComplete = true;
  for (let i = 0; i < 5; i++) {
    if (!markedSet.has(grid[i][i])) {
      mainDiagonalComplete = false;
      break;
    }
  }
  if (mainDiagonalComplete) {
    for (let i = 0; i < 5; i++) {
      completedPositions.add(`${i}-${i}`);
    }
  }
  
  // Check anti-diagonal
  let antiDiagonalComplete = true;
  for (let i = 0; i < 5; i++) {
    if (!markedSet.has(grid[i][4 - i])) {
      antiDiagonalComplete = false;
      break;
    }
  }
  if (antiDiagonalComplete) {
    for (let i = 0; i < 5; i++) {
      completedPositions.add(`${i}-${4 - i}`);
    }
  }
  
  return completedPositions;
}

/**
 * Checks if a number is valid for the game (1-25)
 */
export function isValidNumber(num: number): boolean {
  return Number.isInteger(num) && num >= 1 && num <= 25;
}
