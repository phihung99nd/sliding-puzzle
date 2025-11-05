import { useState } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Header } from '@/components/Header'
import { StartScreen } from '@/components/StartScreen'
import { GameScreen } from '@/components/GameScreen'
import { ResultScreen } from '@/components/ResultScreen'
import type { PuzzleSettings } from '@/lib/puzzle'
import { Analytics } from "@vercel/analytics/react"

type Screen = 'start' | 'game' | 'result'

function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [settings, setSettings] = useState<PuzzleSettings | null>(null)
  const [gameResult, setGameResult] = useState<{ timeTaken: number; slidesTaken: number } | null>(
    null
  )

  const handleStart = (newSettings: PuzzleSettings) => {
    setSettings(newSettings)
    setScreen('game')
    setGameResult(null)
  }

  const handleGameComplete = (timeTaken: number, slidesTaken: number) => {
    setGameResult({ timeTaken, slidesTaken })
    setScreen('result')
  }

  const handleQuit = () => {
    setScreen('start')
    setSettings(null)
    setGameResult(null)
  }

  const handlePlayAgain = () => {
    if (settings) {
      setScreen('game')
      setGameResult(null)
    }
  }

  return (
    <ThemeProvider>
      <Analytics />
      <div className="min-h-screen bg-background flex flex-col">
        <Header onHome={handleQuit} />
        <main className="flex-1 py-8">
          {screen === 'start' && <StartScreen onStart={handleStart} />}
          {screen === 'game' && settings && (
            <GameScreen
              settings={settings}
              onComplete={handleGameComplete}
              onQuit={handleQuit}
            />
          )}
          {screen === 'result' && settings && gameResult && (
            <ResultScreen
              settings={settings}
              timeTaken={gameResult.timeTaken}
              slidesTaken={gameResult.slidesTaken}
              onPlayAgain={handlePlayAgain}
              onHome={handleQuit}
            />
          )}
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
