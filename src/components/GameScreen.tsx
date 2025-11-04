import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { PuzzleSettings, PuzzleState } from '@/lib/puzzle'
import { createSolvedPuzzle, shufflePuzzle, movePiece, isSolved, getPiecePosition, getImagePosition, getGridSize } from '@/lib/puzzle'
import { Timer, Move, RotateCcw } from 'lucide-react'

interface GameScreenProps {
  settings: PuzzleSettings
  onComplete: (timeTaken: number, slidesTaken: number) => void
  onQuit: () => void
}

export function GameScreen({ settings, onComplete, onQuit }: GameScreenProps) {
  const [puzzleState, setPuzzleState] = useState<PuzzleState>(() => {
    const solved = createSolvedPuzzle(getGridSize(settings.difficulty))
    return shufflePuzzle(solved, 1000)
  })
  const [slidesTaken, setSlidesTaken] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [movedPiece, setMovedPiece] = useState<{ row: number; col: number } | null>(null)

  const timerIntervalRef = useRef<number | null>(null)
  const timeElapsedRef = useRef(0)
  const startTimeRef = useRef<number>(Date.now())

  const size = puzzleState.size

  useEffect(() => {
    if (isGameOver) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
      return
    }

    startTimeRef.current = Date.now()
    timeElapsedRef.current = 0

    timerIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      timeElapsedRef.current = elapsed

      if (settings.timeLimit && elapsed >= settings.timeLimit) {
        setIsGameOver(true)
        setTimeElapsed(settings.timeLimit)
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current)
          timerIntervalRef.current = null
        }
      } else {
        setTimeElapsed(elapsed)
      }
    }, 1000)

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [isGameOver, settings.timeLimit])

  useEffect(() => {
    if (isSolved(puzzleState) && !isGameOver) {
      setIsGameOver(true)
      onComplete(timeElapsedRef.current, slidesTaken)
    }
  }, [puzzleState, slidesTaken, isGameOver, onComplete])

  useEffect(() => {
    if (settings.slideLimit && slidesTaken >= settings.slideLimit && !isGameOver) {
      setIsGameOver(true)
    }
  }, [slidesTaken, settings.slideLimit, isGameOver])

  const handlePieceClick = useCallback(
    (row: number, col: number) => {
      if (isGameOver || puzzleState.grid[row][col] === 0) return

      const newState = movePiece(puzzleState, row, col)
      if (newState) {
        setPuzzleState(newState)
        setSlidesTaken((prev) => prev + 1)
        setMovedPiece({ row, col })
        setTimeout(() => setMovedPiece(null), 300)
      }
    },
    [puzzleState, isGameOver]
  )

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const remainingTime = settings.timeLimit ? Math.max(0, settings.timeLimit - timeElapsed) : null
  const remainingSlides = settings.slideLimit ? Math.max(0, settings.slideLimit - slidesTaken) : null

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Game Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="text-2xl font-bold">{formatTime(timeElapsed)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Move className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Moves</p>
                  <p className="text-2xl font-bold">{slidesTaken}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {remainingTime !== null && (
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Time Remaining</p>
                  <p
                    className={`text-2xl font-bold ${
                      remainingTime < 60 ? 'text-destructive' : ''
                    }`}
                  >
                    {formatTime(remainingTime)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {remainingSlides !== null && (
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Moves Remaining</p>
                  <p
                    className={`text-2xl font-bold ${
                      remainingSlides < 10 ? 'text-destructive' : ''
                    }`}
                  >
                    {remainingSlides}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Puzzle Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6"
        >
          {/* Puzzle Grid */}
          <div
            className="grid gap-2 p-4 bg-card rounded-lg border-2 border-border"
            style={{
              gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              width: `${size * 120}px`,
            }}
          >
            {puzzleState.grid.map((row, rowIndex) =>
              row.map((value, colIndex) => {
                const pieceSize = `${Math.floor((size * 120 - 32 - (size - 1) * 8) / size)}px`
                
                if (value === 0) {
                  return (
                    <div
                      key={`empty-${rowIndex}-${colIndex}`}
                      className="bg-muted rounded-lg border-2 border-dashed border-border"
                      style={{
                        width: pieceSize,
                        height: pieceSize,
                      }}
                    />
                  )
                }

                const { row: targetRow, col: targetCol } = getPiecePosition(value, size)
                const { backgroundPositionX, backgroundPositionY } = getImagePosition(
                  targetRow,
                  targetCol
                )

                const isMoved = movedPiece?.row === rowIndex && movedPiece?.col === colIndex

                return (
                  <motion.button
                    key={`piece-${value}`}
                    layout
                    initial={false}
                    animate={
                      isMoved
                        ? { scale: [0.95, 1], rotate: [0, -3, 3, -3, 0] }
                        : { scale: 1, rotate: 0 }
                    }
                    transition={{ 
                      duration: 0.2,
                      layout: { duration: 0.3 }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePieceClick(rowIndex, colIndex)}
                    disabled={isGameOver}
                    className="rounded-lg overflow-hidden border-2 border-border cursor-pointer hover:border-primary hover:shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      width: pieceSize,
                      height: pieceSize,
                      backgroundImage: `url(${settings.imageUrl})`,
                      backgroundSize: `${size * 100}%`,
                      backgroundPositionX,
                      backgroundPositionY,
                    }}
                  />
                )
              })
            )}
          </div>

          {/* Reference Image */}
          <Card className="w-full md:w-auto">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground text-center">
                  Reference Image
                </h3>
                <div
                  className="rounded-lg overflow-hidden border-2 border-border shadow-lg"
                  style={{
                    width: `${size * 120}px`,
                    height: `${size * 120}px`,
                  }}
                >
                  <img
                    src={settings.imageUrl}
                    alt="Reference"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onQuit}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Quit Game
          </Button>
        </div>

        {/* Game Over Overlay */}
        {isGameOver && !isSolved(puzzleState) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card rounded-lg border-2 border-border p-8 max-w-md mx-4 text-center space-y-4"
            >
              <h2 className="text-3xl font-bold text-destructive">Game Over!</h2>
              <p className="text-muted-foreground">
                {settings.timeLimit && timeElapsedRef.current >= settings.timeLimit
                  ? 'Time ran out!'
                  : settings.slideLimit && slidesTaken >= settings.slideLimit
                  ? 'You ran out of moves!'
                  : 'Better luck next time!'}
              </p>
              <Button onClick={onQuit} className="w-full">
                Return to Start
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

