
export class SudokuSolver {
  private board: Array<Array<number | null>>;
  private solutions: Array<Array<Array<number | null>>> = [];
  
  constructor(initialBoard: Array<Array<number | null>>) {
    // Deep copy the initial board
    this.board = JSON.parse(JSON.stringify(initialBoard));
  }
  
  // Get the current state of the board
  getBoard(): Array<Array<number | null>> {
    return this.board;
  }
  
  // Get all found solutions
  getSolutions(): Array<Array<Array<number | null>>> {
    return this.solutions;
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
  
  // Solve the Sudoku puzzle using backtracking and find all solutions
  findAllSolutions(limit: number = 1000): boolean {
    this.solutions = [];
    return this.solveRecursive(limit);
  }
  
  // Recursive helper function to find all solutions
  private solveRecursive(limit: number): boolean {
    const emptyPos = this.findEmpty();
    
    // If no empty positions, we found a solution
    if (!emptyPos) {
      // Add the current state of the board as a solution
      this.solutions.push(JSON.parse(JSON.stringify(this.board)));
      
      // If we've reached our solution limit, stop searching
      if (this.solutions.length >= limit) {
        return true;
      }
      
      // Backtrack to find more solutions
      return false;
    }
    
    const [row, col] = emptyPos;
    
    // Try each number 1-9
    for (let num = 1; num <= 9; num++) {
      if (this.isValid(row, col, num)) {
        // Place the number if it's valid
        this.board[row][col] = num;
        
        // Recursively try to solve the rest of the puzzle
        const foundAllSolutions = this.solveRecursive(limit);
        
        // If we've reached our solution limit, stop searching
        if (foundAllSolutions) {
          return true;
        }
        
        // Backtrack
        this.board[row][col] = null;
      }
    }
    
    // Return false to indicate we should continue searching for more solutions
    return false;
  }
  
  // For backward compatibility - solve the Sudoku puzzle and find just one solution
  solve(): boolean {
    this.solutions = [];
    const result = this.solveRecursive(1);
    
    // If we found a solution, update the board to that solution
    if (this.solutions.length > 0) {
      this.board = this.solutions[0];
      return true;
    }
    
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
