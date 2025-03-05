
export class SudokuSolver {
  private board: Array<Array<number | null>>;
  
  constructor(initialBoard: Array<Array<number | null>>) {
    // Deep copy the initial board
    this.board = JSON.parse(JSON.stringify(initialBoard));
  }
  
  // Get the current state of the board
  getBoard(): Array<Array<number | null>> {
    return this.board;
  }
  
  // Check if placing 'num' at position (row, col) is valid
  isValid(row: number, col: number, num: number): boolean {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (this.board[row][x] === num) {
        return false;
      }
    }
    
    // Check column
    for (let x = 0; x < 9; x++) {
      if (this.board[x][col] === num) {
        return false;
      }
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.board[boxRow + i][boxCol + j] === num) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  // Find an empty cell on the board
  findEmpty(): [number, number] | null {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.board[row][col] === null) {
          return [row, col];
        }
      }
    }
    return null; // No empty cell found
  }
  
  // Solve the Sudoku puzzle using backtracking
  solve(): boolean {
    const emptyPos = this.findEmpty();
    
    // If no empty positions, puzzle is solved
    if (!emptyPos) {
      return true;
    }
    
    const [row, col] = emptyPos;
    
    // Try each number 1-9
    for (let num = 1; num <= 9; num++) {
      if (this.isValid(row, col, num)) {
        // Place the number if it's valid
        this.board[row][col] = num;
        
        // Recursively try to solve the rest of the puzzle
        if (this.solve()) {
          return true;
        }
        
        // If placing 'num' didn't lead to a solution, backtrack
        this.board[row][col] = null;
      }
    }
    
    // No solution found with the current configuration
    return false;
  }

  // Validate the initial board to check if it's a valid sudoku setup
  validateBoard(): boolean {
    // Check each filled cell for validity
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = this.board[row][col];
        
        if (value !== null) {
          // Temporarily remove the value to check if it can be placed there
          this.board[row][col] = null;
          const isValid = this.isValid(row, col, value);
          this.board[row][col] = value; // Restore the value
          
          if (!isValid) {
            return false;
          }
        }
      }
    }
    
    return true;
  }
}
