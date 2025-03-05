
import sys
import copy
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QGridLayout, QPushButton, 
                             QVBoxLayout, QHBoxLayout, QLabel, QFrame, QMessageBox)
from PyQt5.QtCore import Qt, QSize
from PyQt5.QtGui import QFont

class SudokuSolver:
    def __init__(self, initial_board):
        # Deep copy the initial board
        self.board = copy.deepcopy(initial_board)
        self.solutions = []
    
    # Get the current state of the board
    def get_board(self):
        return self.board
    
    # Get all found solutions
    def get_solutions(self):
        return self.solutions
    
    # Check if placing 'num' at position (row, col) is valid
    def is_valid(self, row, col, num):
        # Check row
        for x in range(9):
            if self.board[row][x] == num:
                return False
        
        # Check column
        for x in range(9):
            if self.board[x][col] == num:
                return False
        
        # Check 3x3 box
        box_row = (row // 3) * 3
        box_col = (col // 3) * 3
        
        for i in range(3):
            for j in range(3):
                if self.board[box_row + i][box_col + j] == num:
                    return False
        
        return True
    
    # Find an empty cell on the board
    def find_empty(self):
        for row in range(9):
            for col in range(9):
                if self.board[row][col] is None:
                    return row, col
        return None  # No empty cell found
    
    # Solve the Sudoku puzzle using backtracking and find all solutions
    def find_all_solutions(self, limit=1000):
        self.solutions = []
        return self.solve_recursive(limit)
    
    # Recursive helper function to find all solutions
    def solve_recursive(self, limit):
        empty_pos = self.find_empty()
        
        # If no empty positions, we found a solution
        if not empty_pos:
            # Add the current state of the board as a solution
            self.solutions.append(copy.deepcopy(self.board))
            
            # If we've reached our solution limit, stop searching
            if len(self.solutions) >= limit:
                return True
            
            # Backtrack to find more solutions
            return False
        
        row, col = empty_pos
        
        # Try each number 1-9
        for num in range(1, 10):
            if self.is_valid(row, col, num):
                # Place the number if it's valid
                self.board[row][col] = num
                
                # Recursively try to solve the rest of the puzzle
                found_all_solutions = self.solve_recursive(limit)
                
                # If we've reached our solution limit, stop searching
                if found_all_solutions:
                    return True
                
                # Backtrack
                self.board[row][col] = None
        
        # Return False to indicate we should continue searching for more solutions
        return False
    
    # For backward compatibility - solve the Sudoku puzzle and find just one solution
    def solve(self):
        self.solutions = []
        result = self.solve_recursive(1)
        
        # If we found a solution, update the board to that solution
        if len(self.solutions) > 0:
            self.board = self.solutions[0]
            return True
        
        return False
    
    # Validate the initial board to check if it's a valid sudoku setup
    def validate_board(self):
        # Check each filled cell for validity
        for row in range(9):
            for col in range(9):
                value = self.board[row][col]
                
                if value is not None:
                    # Temporarily remove the value to check if it can be placed there
                    self.board[row][col] = None
                    is_valid = self.is_valid(row, col, value)
                    self.board[row][col] = value  # Restore the value
                    
                    if not is_valid:
                        return False
        
        return True


class SudokuCell(QPushButton):
    def __init__(self, row, col, parent=None):
        super().__init__(parent)
        self.row = row
        self.col = col
        self.value = None
        self.is_original = False
        self.setFixedSize(QSize(50, 50))
        self.setFont(QFont('Arial', 14))
        self.setStyleSheet("""
            QPushButton {
                background-color: white;
                border: 1px solid #ccc;
            }
            QPushButton:hover {
                background-color: #e6f7ff;
            }
        """)

    def set_value(self, value, is_original=False):
        self.value = value
        self.is_original = is_original
        
        if value is not None:
            self.setText(str(value))
            if is_original:
                self.setStyleSheet("""
                    QPushButton {
                        background-color: white;
                        border: 1px solid #ccc;
                        font-weight: bold;
                        color: black;
                    }
                    QPushButton:hover {
                        background-color: #e6f7ff;
                    }
                """)
            else:
                self.setStyleSheet("""
                    QPushButton {
                        background-color: white;
                        border: 1px solid #ccc;
                        color: #2563eb;
                    }
                    QPushButton:hover {
                        background-color: #e6f7ff;
                    }
                """)
        else:
            self.setText("")
            self.setStyleSheet("""
                QPushButton {
                    background-color: white;
                    border: 1px solid #ccc;
                }
                QPushButton:hover {
                    background-color: #e6f7ff;
                }
            """)


class SudokuApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Sudoku Löser")
        self.setGeometry(100, 100, 600, 700)
        
        # Initialize board data
        self.board = [[None for _ in range(9)] for _ in range(9)]
        self.original_board = [[None for _ in range(9)] for _ in range(9)]
        self.solutions = []
        self.current_solution = 0
        self.selected_cell = None
        
        # Create the main widget and layout
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.main_layout = QVBoxLayout(self.central_widget)
        
        # Add title and description
        title_label = QLabel("Sudoku Löser")
        title_label.setFont(QFont('Arial', 18, QFont.Bold))
        title_label.setAlignment(Qt.AlignCenter)
        self.main_layout.addWidget(title_label)
        
        description_label = QLabel("Gib ein Sudoku-Rätsel ein und lass es automatisch lösen")
        description_label.setAlignment(Qt.AlignCenter)
        self.main_layout.addWidget(description_label)
        
        # Add the Sudoku grid
        self.grid_frame = QFrame()
        self.grid_frame.setFrameShape(QFrame.Box)
        self.grid_frame.setLineWidth(2)
        self.grid_layout = QGridLayout(self.grid_frame)
        self.grid_layout.setSpacing(0)
        
        # Create cells
        self.cells = [[None for _ in range(9)] for _ in range(9)]
        for row in range(9):
            for col in range(9):
                cell = SudokuCell(row, col)
                cell.clicked.connect(lambda checked, r=row, c=col: self.handle_cell_click(r, c))
                
                # Add thicker border for 3x3 subgrids
                if row % 3 == 2 and row < 8:
                    cell.setStyleSheet(cell.styleSheet() + """
                        QPushButton {
                            border-bottom: 2px solid #333;
                        }
                    """)
                if col % 3 == 2 and col < 8:
                    cell.setStyleSheet(cell.styleSheet() + """
                        QPushButton {
                            border-right: 2px solid #333;
                        }
                    """)
                
                self.grid_layout.addWidget(cell, row, col)
                self.cells[row][col] = cell
        
        self.main_layout.addWidget(self.grid_frame)
        
        # Solution navigation
        self.solution_nav_layout = QHBoxLayout()
        self.prev_button = QPushButton("← Vorherige")
        self.prev_button.clicked.connect(self.handle_prev_solution)
        self.prev_button.setEnabled(False)
        
        self.solution_label = QLabel("Keine Lösungen gefunden")
        self.solution_label.setAlignment(Qt.AlignCenter)
        
        self.next_button = QPushButton("Nächste →")
        self.next_button.clicked.connect(self.handle_next_solution)
        self.next_button.setEnabled(False)
        
        self.solution_nav_layout.addWidget(self.prev_button)
        self.solution_nav_layout.addWidget(self.solution_label)
        self.solution_nav_layout.addWidget(self.next_button)
        self.main_layout.addLayout(self.solution_nav_layout)
        
        # Number input buttons
        self.num_layout = QGridLayout()
        for num in range(1, 10):
            button = QPushButton(str(num))
            button.setFixedSize(QSize(40, 40))
            button.clicked.connect(lambda checked, n=num: self.handle_number_input(n))
            row, col = divmod(num - 1, 3)
            self.num_layout.addWidget(button, row, col)
        
        self.main_layout.addLayout(self.num_layout)
        
        # Control buttons
        self.control_layout = QHBoxLayout()
        
        self.clear_cell_button = QPushButton("Löschen")
        self.clear_cell_button.clicked.connect(lambda: self.handle_number_input(None))
        
        self.reset_button = QPushButton("Zurücksetzen")
        self.reset_button.clicked.connect(self.handle_clear)
        
        self.solve_button = QPushButton("Lösen")
        self.solve_button.clicked.connect(self.handle_solve)
        
        self.control_layout.addWidget(self.clear_cell_button)
        self.control_layout.addWidget(self.reset_button)
        self.control_layout.addWidget(self.solve_button)
        
        self.main_layout.addLayout(self.control_layout)
        
        # Help text
        help_text = QLabel("Klicke auf eine Zelle und gib eine Ziffer ein (1-9), oder verwende die Buttons. "
                          "Drücke \"Lösen\", um das Sudoku automatisch zu lösen und alle möglichen Lösungen zu finden.")
        help_text.setWordWrap(True)
        help_text.setAlignment(Qt.AlignCenter)
        self.main_layout.addWidget(help_text)
        
        # Set up key press events
        self.setFocusPolicy(Qt.StrongFocus)
    
    def keyPressEvent(self, event):
        if not self.selected_cell:
            super().keyPressEvent(event)
            return
        
        key = event.key()
        
        # Handle number keys
        if Qt.Key_1 <= key <= Qt.Key_9:
            number = key - Qt.Key_0  # Convert to actual number
            self.handle_number_input(number)
        # Handle backspace, delete, or 0 for clearing
        elif key in (Qt.Key_Backspace, Qt.Key_Delete, Qt.Key_0):
            self.handle_number_input(None)
        else:
            super().keyPressEvent(event)
    
    def handle_cell_click(self, row, col):
        # Clear previous selection
        if self.selected_cell:
            prev_row, prev_col = self.selected_cell
            self.cells[prev_row][prev_col].setStyleSheet(self.cells[prev_row][prev_col].styleSheet().replace("background-color: #e6f7ff;", "background-color: white;"))
        
        # Set new selection
        self.selected_cell = (row, col)
        self.cells[row][col].setStyleSheet(self.cells[row][col].styleSheet().replace("background-color: white;", "background-color: #e6f7ff;"))
    
    def handle_number_input(self, value):
        if not self.selected_cell:
            return
        
        row, col = self.selected_cell
        
        # Update board data
        self.board[row][col] = value
        self.original_board[row][col] = value
        
        # Update cell display
        self.cells[row][col].set_value(value, True)
        
        # Reset solutions when the board changes
        self.solutions = []
        self.current_solution = 0
        self.update_solution_navigation()
    
    def handle_clear(self):
        # Reset board data
        self.board = [[None for _ in range(9)] for _ in range(9)]
        self.original_board = [[None for _ in range(9)] for _ in range(9)]
        
        # Reset cells
        for row in range(9):
            for col in range(9):
                self.cells[row][col].set_value(None)
        
        # Clear selected cell
        self.selected_cell = None
        
        # Reset solutions
        self.solutions = []
        self.current_solution = 0
        self.update_solution_navigation()
    
    def handle_next_solution(self):
        if len(self.solutions) > 0:
            self.current_solution = (self.current_solution + 1) % len(self.solutions)
            self.display_solution(self.solutions[self.current_solution])
            self.update_solution_navigation()
    
    def handle_prev_solution(self):
        if len(self.solutions) > 0:
            self.current_solution = (self.current_solution - 1) % len(self.solutions)
            self.display_solution(self.solutions[self.current_solution])
            self.update_solution_navigation()
    
    def handle_solve(self):
        # Create solver and validate board
        solver = SudokuSolver(copy.deepcopy(self.board))
        
        if not solver.validate_board():
            QMessageBox.warning(self, "Ungültiges Sudoku", 
                               "Das eingegebene Sudoku hat widersprüchliche Zahlen.")
            return
        
        # Find all solutions (limit to 1000 to prevent excessive computation)
        limit = 1000
        solver.find_all_solutions(limit)
        self.solutions = solver.get_solutions()
        
        if len(self.solutions) > 0:
            # Display the first solution
            self.current_solution = 0
            self.display_solution(self.solutions[0])
            
            solution_text = ""
            if len(self.solutions) == 1:
                solution_text = "Es gibt genau eine Lösung."
            elif len(self.solutions) >= limit:
                solution_text = f"Es wurden {len(self.solutions)} Lösungen gefunden (Limit erreicht)."
            else:
                solution_text = f"Es wurden {len(self.solutions)} Lösungen gefunden."
            
            QMessageBox.information(self, "Sudoku gelöst!", solution_text)
        else:
            QMessageBox.warning(self, "Keine Lösung gefunden", 
                               "Das eingegebene Sudoku-Rätsel kann nicht gelöst werden.")
        
        self.update_solution_navigation()
    
    def display_solution(self, solution):
        for row in range(9):
            for col in range(9):
                # Display the solution, marking original cells
                is_original = self.original_board[row][col] is not None
                self.cells[row][col].set_value(solution[row][col], is_original)
    
    def update_solution_navigation(self):
        if len(self.solutions) > 1:
            self.solution_label.setText(f"Lösung {self.current_solution + 1} von {len(self.solutions)}")
            self.prev_button.setEnabled(True)
            self.next_button.setEnabled(True)
        else:
            self.solution_label.setText("Keine Lösungen gefunden" if len(self.solutions) == 0 else "Eine Lösung gefunden")
            self.prev_button.setEnabled(False)
            self.next_button.setEnabled(False)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = SudokuApp()
    window.show()
    sys.exit(app.exec_())
