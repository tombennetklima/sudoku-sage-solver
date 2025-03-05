
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { SudokuSolver } from "@/lib/sudoku-solver";

const Sudoku = () => {
  const [board, setBoard] = useState<Array<Array<number | null>>>(Array(9).fill(null).map(() => Array(9).fill(null)));
  const [originalBoard, setOriginalBoard] = useState<Array<Array<number | null>>>(Array(9).fill(null).map(() => Array(9).fill(null)));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [solving, setSolving] = useState(false);

  // Handle cell selection
  const handleCellClick = (row: number, col: number) => {
    setSelectedCell([row, col]);
  };

  // Handle number input
  const handleNumberInput = (value: number | null) => {
    if (!selectedCell) return;
    
    const [row, col] = selectedCell;
    const newBoard = [...board];
    newBoard[row][col] = value;
    setBoard(newBoard);
    
    // Update original board for tracking user inputs
    const newOriginalBoard = [...originalBoard];
    newOriginalBoard[row][col] = value;
    setOriginalBoard(newOriginalBoard);
  };

  // Clear the board
  const handleClear = () => {
    setBoard(Array(9).fill(null).map(() => Array(9).fill(null)));
    setOriginalBoard(Array(9).fill(null).map(() => Array(9).fill(null)));
    setSelectedCell(null);
  };

  // Solve the puzzle
  const handleSolve = async () => {
    try {
      setSolving(true);
      const solver = new SudokuSolver(JSON.parse(JSON.stringify(board)));
      const solved = solver.solve();
      
      if (solved) {
        // Animate the solution by filling in cells one by one
        const solution = solver.getBoard();
        
        // Create a copy of the current board
        let currentBoard = JSON.parse(JSON.stringify(board));
        
        // Find all cells that need to be filled
        const cellsToFill: [number, number, number][] = [];
        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            if (currentBoard[row][col] === null && solution[row][col] !== null) {
              cellsToFill.push([row, col, solution[row][col]]);
            }
          }
        }
        
        // Randomize the order of filling for more interesting animation
        cellsToFill.sort(() => Math.random() - 0.5);
        
        // Animate filling cells
        for (const [row, col, value] of cellsToFill) {
          await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for animation
          currentBoard = JSON.parse(JSON.stringify(currentBoard));
          currentBoard[row][col] = value;
          setBoard(currentBoard);
        }
        
        toast({
          title: "Sudoku gelöst!",
          description: "Das Sudoku-Rätsel wurde erfolgreich gelöst.",
        });
      } else {
        toast({
          title: "Keine Lösung gefunden",
          description: "Das eingegebene Sudoku-Rätsel kann nicht gelöst werden.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Fehler beim Lösen des Sudoku:", error);
      toast({
        title: "Fehler beim Lösen",
        description: "Es ist ein Fehler aufgetreten. Bitte überprüfe deine Eingabe.",
        variant: "destructive",
      });
    } finally {
      setSolving(false);
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleNumberInput(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell]);

  // Helper to check if a cell is part of the original input
  const isOriginalCell = (row: number, col: number) => {
    return originalBoard[row][col] !== null;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Sudoku Löser</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
          Gib ein Sudoku-Rätsel ein und lass es automatisch lösen
        </p>
      </div>
      
      <div className="grid grid-cols-9 gap-0 mb-6 border-2 border-gray-800">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isSelected = selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex;
            const isOriginal = isOriginalCell(rowIndex, colIndex);
            
            // Add borders to visually separate 3x3 grids
            const borderRight = (colIndex + 1) % 3 === 0 && colIndex < 8 ? 'border-r-2 border-r-gray-800' : 'border-r border-r-gray-300';
            const borderBottom = (rowIndex + 1) % 3 === 0 && rowIndex < 8 ? 'border-b-2 border-b-gray-800' : 'border-b border-b-gray-300';
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center cursor-pointer transition-colors",
                  borderRight,
                  borderBottom,
                  isSelected ? "bg-blue-200 dark:bg-blue-800" : "",
                  isOriginal ? "font-bold text-black dark:text-white" : "text-blue-600 dark:text-blue-400"
                )}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell !== null ? cell : ""}
              </div>
            );
          })
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            variant="outline"
            className="w-10 h-10 md:w-12 md:h-12 text-lg"
            onClick={() => handleNumberInput(num)}
          >
            {num}
          </Button>
        ))}
      </div>
      
      <div className="flex gap-4 mb-6 w-full max-w-sm justify-center">
        <Button 
          variant="outline" 
          onClick={() => handleNumberInput(null)}
          className="flex-1"
        >
          Löschen
        </Button>
        <Button 
          variant="outline" 
          onClick={handleClear}
          className="flex-1"
        >
          Zurücksetzen
        </Button>
        <Button 
          onClick={handleSolve} 
          disabled={solving}
          className="flex-1"
        >
          {solving ? "Löse..." : "Lösen"}
        </Button>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md text-center">
        Klicke auf eine Zelle und gib eine Ziffer ein (1-9), oder verwende die Buttons unten.
        Drücke "Lösen", um das Sudoku automatisch zu lösen.
      </div>
    </div>
  );
};

export default Sudoku;
