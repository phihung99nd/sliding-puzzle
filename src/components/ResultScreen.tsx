import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Clock, Move, Home } from 'lucide-react'
import type { PuzzleSettings } from '@/lib/puzzle'

interface ResultScreenProps {
  settings: PuzzleSettings
  timeTaken: number
  slidesTaken: number
  onPlayAgain: () => void
  onHome: () => void
}

export function ResultScreen({
  settings,
  timeTaken,
  slidesTaken,
  onPlayAgain,
  onHome,
}: ResultScreenProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Success Message */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="p-4 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500">
              <Trophy className="h-16 w-16 text-white" />
            </div>
          </motion.div>
          <h1 className="md:text-[48px] text-[32px] font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-primary bg-clip-text text-transparent">
            Congratulations!
          </h1>
          <p className="md:text-xl text-md text-muted-foreground">
            You completed the {settings.difficulty} puzzle!
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Time Taken</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{formatTime(timeTaken)}</p>
                <p className="h-5 text-sm text-muted-foreground mt-2">
                  {settings.timeLimit && <>Time limit: {formatTime(settings.timeLimit)}</>}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Move className="h-5 w-5 text-primary" />
                  <span>Total Moves</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{slidesTaken}</p>
                <p className="h-5 text-sm text-muted-foreground mt-2">
                  {settings.slideLimit && <>Move limit: {settings.slideLimit}</>}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Completed Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Completed Puzzle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-border">
                <img
                  src={settings.imageUrl}
                  alt="Completed puzzle"
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            onClick={onPlayAgain}
            className="px-8 bg-gradient-to-r from-primary via-cyan-500 to-emerald-500 hover:opacity-90"
          >
            Play Again
          </Button>
          <Button size="lg" variant="outline" onClick={onHome}>
            <Home className="mr-2 h-5 w-5" />
            Back to Start
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

