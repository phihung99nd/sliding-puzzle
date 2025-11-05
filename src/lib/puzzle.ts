export type Difficulty = '3x3' | '4x4' | '5x5' | '6x6'

export interface PuzzleSettings {
  difficulty: Difficulty
  timeLimit: number | null // in seconds, null for no limit
  slideLimit: number | null // null for no limit
  imageUrl: string
}

export interface PuzzleState {
  grid: number[][]
  emptyRow: number
  emptyCol: number
  size: number
}

export function getGridSize(difficulty: Difficulty): number {
  return parseInt(difficulty.split('x')[0])
}

export function getTimeLimit(difficulty: Difficulty): number {
  const timeLimits: Record<Difficulty, number> = {
    '3x3': 180,  // 3 minutes
    '4x4': 300,  // 5 minutes
    '5x5': 480,  // 8 minutes
    '6x6': 900,  // 15 minutes
  }
  return timeLimits[difficulty]
}

export function createSolvedPuzzle(size: number): PuzzleState {
  const grid: number[][] = []
  let value = 1
  for (let i = 0; i < size; i++) {
    grid[i] = []
    for (let j = 0; j < size; j++) {
      grid[i][j] = value++
    }
  }
  grid[size - 1][size - 1] = 0 // Empty space
  return {
    grid,
    emptyRow: size - 1,
    emptyCol: size - 1,
    size,
  }
}

export function shufflePuzzle(state: PuzzleState, moves: number = 1000): PuzzleState {
  const currentState = { ...state, grid: state.grid.map((row) => [...row]) }
  const directions = [
    { row: -1, col: 0 }, // Up
    { row: 1, col: 0 }, // Down
    { row: 0, col: -1 }, // Left
    { row: 0, col: 1 }, // Right
  ]

  for (let i = 0; i < moves; i++) {
    const validMoves = directions.filter((dir) => {
      const newRow = currentState.emptyRow + dir.row
      const newCol = currentState.emptyCol + dir.col
      return (
        newRow >= 0 &&
        newRow < currentState.size &&
        newCol >= 0 &&
        newCol < currentState.size
      )
    })

    if (validMoves.length === 0) break

    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
    const newRow = currentState.emptyRow + randomMove.row
    const newCol = currentState.emptyCol + randomMove.col

    // Swap
    const temp = currentState.grid[currentState.emptyRow][currentState.emptyCol]
    currentState.grid[currentState.emptyRow][currentState.emptyCol] =
      currentState.grid[newRow][newCol]
    currentState.grid[newRow][newCol] = temp

    currentState.emptyRow = newRow
    currentState.emptyCol = newCol
  }

  // Move empty space to bottom right corner
  const targetRow = currentState.size - 1
  const targetCol = currentState.size - 1

  // Move empty space down first, then right
  while (currentState.emptyRow < targetRow) {
    const newRow = currentState.emptyRow + 1
    const temp = currentState.grid[currentState.emptyRow][currentState.emptyCol]
    currentState.grid[currentState.emptyRow][currentState.emptyCol] =
      currentState.grid[newRow][currentState.emptyCol]
    currentState.grid[newRow][currentState.emptyCol] = temp
    currentState.emptyRow = newRow
  }

  while (currentState.emptyCol < targetCol) {
    const newCol = currentState.emptyCol + 1
    const temp = currentState.grid[currentState.emptyRow][currentState.emptyCol]
    currentState.grid[currentState.emptyRow][currentState.emptyCol] =
      currentState.grid[currentState.emptyRow][newCol]
    currentState.grid[currentState.emptyRow][newCol] = temp
    currentState.emptyCol = newCol
  }

  return currentState
}

export function canMove(
  state: PuzzleState,
  row: number,
  col: number
): boolean {
  const { emptyRow, emptyCol } = state
  return (
    (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
    (Math.abs(col - emptyCol) === 1 && row === emptyRow)
  )
}

export function movePiece(
  state: PuzzleState,
  row: number,
  col: number
): PuzzleState | null {
  if (!canMove(state, row, col)) {
    return null
  }

  const newGrid = state.grid.map((r) => [...r])
  const { emptyRow, emptyCol } = state

  // Swap
  newGrid[emptyRow][emptyCol] = newGrid[row][col]
  newGrid[row][col] = 0

  return {
    grid: newGrid,
    emptyRow: row,
    emptyCol: col,
    size: state.size,
  }
}

export function isSolved(state: PuzzleState): boolean {
  const solved = createSolvedPuzzle(state.size)
  for (let i = 0; i < state.size; i++) {
    for (let j = 0; j < state.size; j++) {
      if (state.grid[i][j] !== solved.grid[i][j]) {
        return false
      }
    }
  }
  return true
}

export function getPiecePosition(value: number, size: number): { row: number; col: number } {
  if (value === 0) return { row: size - 1, col: size - 1 }
  const row = Math.floor((value - 1) / size)
  const col = (value - 1) % size
  return { row, col }
}

export function getImagePosition(
  row: number,
  col: number,
  size: number
): { backgroundPositionX: string; backgroundPositionY: string } {
  // For background-size: size * 100%, each piece is 100% of container
  // We need to shift the background to show the correct tile
  // Negative values move the background left/up to reveal the correct portion
  const colPercent = col * 100 / (size - 1)
  const rowPercent = row * 100 / (size - 1)
  return {
    backgroundPositionX: `${colPercent}%`,
    backgroundPositionY: `${rowPercent}%`,
  }
}

