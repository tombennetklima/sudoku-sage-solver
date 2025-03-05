
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
  const [solutions, setSolutions] = useState<Array<Array<Array<number | null>>>>([]);
  const [currentSolution, setCurrentSolution] = useState(0);

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
    
    // Reset solutions when the board changes
    setSolutions([]);
    setCurrentSolution(0);
  };

  // Clear the board
  const handleClear = () => {
    setBoard(Array(9).fill(null).map(() => Array(9).fill(null)));
    setOriginalBoard(Array(9).fill(null).map(() => Array(9).fill(null)));
    setSelectedCell(null);
    setSolutions([]);
    setCurrentSolution(0);
  };

  // Show next solution
  const handleNextSolution = () => {
    if (solutions.length > 0) {
      const nextIndex = (currentSolution + 1) % solutions.length;
      setCurrentSolution(nextIndex);
      setBoard(solutions[nextIndex]);
    }
  };

  // Show previous solution
  const handlePrevSolution = () => {
    if (solutions.length > 0) {
      const prevIndex = (currentSolution - 1 + solutions.length) % solutions.length;
      setCurrentSolution(prevIndex);
      setBoard(solutions[prevIndex]);
    }
  };

  // Solve the puzzle and find all solutions
  const handleSolve = async () => {
    try {
      setSolving(true);
      setSolutions([]);
      setCurrentSolution(0);
      
      const solver = new SudokuSolver(JSON.parse(JSON.stringify(board)));
      
      // First validate the board
      if (!solver.validateBoard()) {
        toast({
          title: "Ungültiges Sudoku",
          description: "Das eingegebene Sudoku hat widersprüchliche Zahlen.",
          variant: "destructive",
        });
        setSolving(false);
        return;
      }
      
      // Find all solutions (limit to 1000 to prevent excessive computation)
      const limit = 1000;
      solver.findAllSolutions(limit);
      const allSolutions = solver.getSolutions();
      
      if (allSolutions.length > 0) {
        setSolutions(allSolutions);
        
        // Display the first solution immediately
        setBoard(allSolutions[0]);
        setCurrentSolution(0);
        
        const solutionText = allSolutions.length === 1 
          ? "Es gibt genau eine Lösung."
          : allSolutions.length >= limit
            ? `Es wurden ${allSolutions.length} Lösungen gefunden (Limit erreicht).`
            : `Es wurden ${allSolutions.length} Lösungen gefunden.`;
        
        toast({
          title: "Sudoku gelöst!",
          description: solutionText,
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
      
      {/* Solution navigation */}
      {solutions.length > 1 && (
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={handlePrevSolution}
            disabled={solutions.length <= 1}
            className="px-3"
          >
            &#8592; Vorherige
          </Button>
          
          <div className="text-center font-medium">
            Lösung {currentSolution + 1} von {solutions.length}
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleNextSolution}
            disabled={solutions.length <= 1}
            className="px-3"
          >
            Nächste &#8594;
          </Button>
        </div>
      )}
      
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
        Drücke "Lösen", um das Sudoku automatisch zu lösen und alle möglichen Lösungen zu finden.
      </div>
    </div>
  );
};

export default Sudoku;
