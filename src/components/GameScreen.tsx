import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { PuzzleSettings, PuzzleState } from '@/lib/puzzle'
import { createSolvedPuzzle, shufflePuzzle, movePiece, isSolved, getPiecePosition, getImagePosition, getGridSize } from '@/lib/puzzle'
import { cropImageToSquare } from '@/lib/utils'
import { Timer, Move, RotateCcw, RefreshCw } from 'lucide-react'

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
  const [pieceSize, setPieceSize] = useState(0)
  const [gridContainerSize, setGridContainerSize] = useState(0)
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>(settings.imageUrl)
  const [isImageLoading, setIsImageLoading] = useState(true)

  const timerIntervalRef = useRef<number | null>(null)
  const timeElapsedRef = useRef(0)
  const startTimeRef = useRef<number>(Date.now())
  const gridContainerRef = useRef<HTMLDivElement>(null)

  const size = puzzleState.size

  // Crop image to square when imageUrl changes
  useEffect(() => {
    setIsImageLoading(true)
    cropImageToSquare(settings.imageUrl)
      .then((croppedUrl) => {
        setCroppedImageUrl(croppedUrl)
        setIsImageLoading(false)
      })
      .catch((error) => {
        console.error('Failed to crop image:', error)
        // Fallback to original image if cropping fails
        setCroppedImageUrl(settings.imageUrl)
        setIsImageLoading(false)
      })
  }, [settings.imageUrl])

  // Calculate grid size based on viewport
  const calculateGridSize = useCallback(() => {
    // Get available viewport dimensions
    const viewportWidth = window.innerWidth - 6
    const viewportHeight = window.innerHeight

    // Estimate space used by other elements
    // Header: 64px height
    // Padding to avoid header: 32px
    // Stats cards: 126px height (including margins)
    // Quit button: 60px height (including margins)
    // Bottom padding: 32px
    // Total: 314px height
    const reservedHeight = viewportWidth >= 768 ? 314 : 0
    const reservedWidth = viewportWidth >= 768 ? 346 : 32 // More space on desktop due to side-by-side layout

    // Available space for grid
    const availableWidth = viewportWidth - reservedWidth
    const availableHeight = viewportHeight - reservedHeight

    // Account for grid container padding (16px * 2 = 32px)
    const containerPadding = 32
    // Gap between pieces (2px * (size - 1))
    const totalGap = 2 * (size - 1)

    // Border width (2px * 2 = 4px)
    const borderWidth = 4

    // Calculate max size considering both width and height
    // Ensure square aspect ratio
    const maxSizeByWidth = Math.floor((availableWidth - containerPadding - totalGap - borderWidth) / size)
    const maxSizeByHeight = Math.floor((availableHeight - containerPadding - totalGap - borderWidth) / size)

    // Use the smaller dimension to ensure it fits in viewport
    const calculatedPieceSize = Math.max(20, Math.min(maxSizeByWidth, maxSizeByHeight))

    // Calculate total grid container size (including padding)
    const calculatedGridSize = calculatedPieceSize * size + totalGap + containerPadding + borderWidth

    setPieceSize(calculatedPieceSize)
    setGridContainerSize(calculatedGridSize)
  }, [size])

  // Set up resize listeners
  useEffect(() => {
    // Initial calculation
    calculateGridSize()

    // Add window resize listeners
    window.addEventListener('resize', calculateGridSize)
    window.addEventListener('orientationchange', calculateGridSize)

    // Recalculate after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(calculateGridSize, 100)

    return () => {
      window.removeEventListener('resize', calculateGridSize)
      window.removeEventListener('orientationchange', calculateGridSize)
      clearTimeout(timeoutId)
    }
  }, [calculateGridSize])

  // Set up ResizeObserver when container becomes available
  useEffect(() => {
    const containerElement = gridContainerRef.current
    if (!containerElement) return

    const resizeObserver = new ResizeObserver(calculateGridSize)
    resizeObserver.observe(containerElement)

    return () => {
      resizeObserver.disconnect()
    }
  }, [calculateGridSize])

  useEffect(() => {
    // Don't start timer if game is over or image is still loading
    if (isGameOver || isImageLoading) {
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
  }, [isGameOver, isImageLoading, settings.timeLimit])

  useEffect(() => {
    if (isSolved(puzzleState) && !isGameOver) {
      setIsGameOver(true)
      onComplete(timeElapsedRef.current, slidesTaken)
    }
  }, [puzzleState, slidesTaken, isGameOver, onComplete])


  const handlePieceClick = useCallback(
    (row: number, col: number) => {
      if (isGameOver || puzzleState.grid[row][col] === 0) return

      const newState = movePiece(puzzleState, row, col)
      if (newState) {
        setPuzzleState(newState)
        setSlidesTaken((prev) => prev + 1)
      }
    },
    [puzzleState, isGameOver]
  )

  const handlePlayAgain = useCallback(() => {
    // Clear any existing timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    
    // Reset puzzle state
    const solved = createSolvedPuzzle(getGridSize(settings.difficulty))
    setPuzzleState(shufflePuzzle(solved, 1000))
    
    // Reset game state
    setSlidesTaken(0)
    setTimeElapsed(0)
    setIsGameOver(false)
    
    // Reset timer refs
    timeElapsedRef.current = 0
    startTimeRef.current = Date.now()
  }, [settings.difficulty])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const remainingTime = settings.timeLimit ? Math.max(0, settings.timeLimit - timeElapsed) : null

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="space-y-6">
        {/* Game Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          <Card>
            <CardContent>
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
            <CardContent>
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
              <CardContent>
                <div>
                  <p className="text-sm text-muted-foreground">Time Remaining</p>
                  <p
                    className={`text-2xl font-bold ${
                      remainingTime < ((settings.timeLimit ?? 0) / 3) ? 'text-destructive' : ''
                    }`}
                  >
                    {formatTime(remainingTime)}
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
          <motion.div
            ref={gridContainerRef}
            className="grid bg-card rounded-lg border-2 border-border p-4 shrink-0 overflow-hidden relative"
            style={{
              gridTemplateColumns: `repeat(${size}, ${pieceSize}px)`,
              gridTemplateRows: `repeat(${size}, ${pieceSize}px)`,
              gap: '2px',
              width: gridContainerSize > 0 ? `${gridContainerSize}px` : 'auto',
              height: gridContainerSize > 0 ? `${gridContainerSize}px` : 'auto',
              aspectRatio: '1 / 1',
            }}
          >
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-lg">
                <p className="text-muted-foreground">Processing image...</p>
              </div>
            )}
            {pieceSize > 0 && !isImageLoading && puzzleState.grid.map((row, rowIndex) =>
              row.map((value, colIndex) => {
                if (value === 0) {
                  return (
                    <motion.div
                      key={`empty-${rowIndex}-${colIndex}`}
                      layoutId={`empty-${rowIndex}-${colIndex}`}
                      className="bg-muted rounded-lg shrink-0"
                      style={{
                        width: `${pieceSize}px`,
                        height: `${pieceSize}px`,
                        minWidth: `${pieceSize}px`,
                        minHeight: `${pieceSize}px`,
                      }}
                    />
                  )
                }

                const { row: targetRow, col: targetCol } = getPiecePosition(value, size)
                const { backgroundPositionX, backgroundPositionY } = getImagePosition(
                  targetRow,
                  targetCol,
                  size
                )

                return (
                  <motion.button
                    key={`piece-${value}`}
                    layoutId={`piece-${value}`}
                    layout
                    transition={{
                      layout: {
                        type: "spring", stiffness: 2000, damping: 20, mass: 1,
                      }
                    }}
                    whileHover={{ filter: 'brightness(1.3)' }}
                    onClick={() => handlePieceClick(rowIndex, colIndex)}
                    disabled={isGameOver}
                    className="rounded-lg overflow-hidden cursor-pointer transition-all disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                    style={{
                      width: `${pieceSize}px`,
                      height: `${pieceSize}px`,
                      minWidth: `${pieceSize}px`,
                      minHeight: `${pieceSize}px`,
                      backgroundImage: `url(${croppedImageUrl})`,
                      backgroundSize: `${size * 100}%`,
                      backgroundPositionX,
                      backgroundPositionY,
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                )
              })
            )}
          </motion.div>

          {/* Reference Image */}
          <Card className="w-auto">
            <CardContent>
              <div className="space-y-2 flex flex-col items-center justify-center">
                <h3 className="text-sm font-semibold text-muted-foreground text-center">
                  Reference Image
                </h3>
                <div
                  className="rounded-lg overflow-hidden border-2 border-border shadow-lg bg-muted flex items-center justify-center"
                  style={{
                    width: `${Math.floor(size * 80)}px`,
                    height: `${Math.floor(size * 80)}px`,
                    maxWidth: '100%',
                  }}
                >
                  <img
                    src={croppedImageUrl}
                    alt="Reference"
                    className="w-full h-full object-contain"
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
                  : 'Better luck next time!'}
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={handlePlayAgain} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Play Again
                </Button>
                <Button onClick={onQuit} variant="outline" className="w-full">
                  Return to Start
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

