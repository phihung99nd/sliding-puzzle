import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PuzzleSettings, Difficulty } from '@/lib/puzzle'
import { Play } from 'lucide-react'

interface StartScreenProps {
  onStart: (settings: PuzzleSettings) => void
}

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1597589022928-bb4002c099ec?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=800&fit=crop',
]

export function StartScreen({ onStart }: StartScreenProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('3x3')
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false)
  const [timeLimit, setTimeLimit] = useState(300) // 5 minutes default
  const [slideLimitEnabled, setSlideLimitEnabled] = useState(false)
  const [slideLimit, setSlideLimit] = useState(100)
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGES[0])
  const [customImageUrl, setCustomImageUrl] = useState('')

  const handleStart = () => {
    const settings: PuzzleSettings = {
      difficulty,
      timeLimit: timeLimitEnabled ? timeLimit : null,
      slideLimit: slideLimitEnabled ? slideLimit : null,
      imageUrl: customImageUrl || imageUrl,
    }
    onStart(settings)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            Sliding Puzzle Challenge
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground"
          >
            Test your logical thinking and strategy skills!
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Difficulty Level</CardTitle>
              <CardDescription>Choose the grid size</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={difficulty} onValueChange={(value) => setDifficulty(value as Difficulty)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3x3">3x3 (Easy)</SelectItem>
                  <SelectItem value="4x4">4x4 (Medium)</SelectItem>
                  <SelectItem value="5x5">5x5 (Hard)</SelectItem>
                  <SelectItem value="6x6">6x6 (Expert)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Puzzle Image</CardTitle>
              <CardDescription>Choose an image to solve</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {DEFAULT_IMAGES.map((url, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setImageUrl(url)
                      setCustomImageUrl('')
                    }}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      imageUrl === url && !customImageUrl
                        ? 'border-primary ring-2 ring-primary'
                        : 'border-border'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-image">Or use custom image URL</Label>
                <Input
                  id="custom-image"
                  placeholder="https://example.com/image.jpg"
                  value={customImageUrl}
                  onChange={(e) => {
                    setCustomImageUrl(e.target.value)
                    if (e.target.value) {
                      setImageUrl(e.target.value)
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time Limit</CardTitle>
              <CardDescription>Set a time limit for solving</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="time-limit"
                  checked={timeLimitEnabled}
                  onCheckedChange={setTimeLimitEnabled}
                />
                <Label htmlFor="time-limit">Enable time limit</Label>
              </div>
              {timeLimitEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <Label htmlFor="time-value">Time (seconds)</Label>
                  <Input
                    id="time-value"
                    type="number"
                    min="30"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value) || 300)}
                  />
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Slide Limit</CardTitle>
              <CardDescription>Set maximum number of moves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="slide-limit"
                  checked={slideLimitEnabled}
                  onCheckedChange={setSlideLimitEnabled}
                />
                <Label htmlFor="slide-limit">Enable slide limit</Label>
              </div>
              {slideLimitEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <Label htmlFor="slide-value">Maximum slides</Label>
                  <Input
                    id="slide-value"
                    type="number"
                    min="10"
                    value={slideLimit}
                    onChange={(e) => setSlideLimit(parseInt(e.target.value) || 100)}
                  />
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            onClick={handleStart}
            className="h-14 px-8 text-lg bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:opacity-90"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Game
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

