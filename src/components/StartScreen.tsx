import { useState, useEffect } from 'react'
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
import { getTimeLimit } from '@/lib/puzzle'
import { cropImageToSquare } from '@/lib/utils'
import { Play, Upload, Trash2 } from 'lucide-react'

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
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(true)
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGES[0])
  const [customImageUrl, setCustomImageUrl] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [croppedCustomUrl, setCroppedCustomUrl] = useState<string | null>(null)
  const [customUrlError, setCustomUrlError] = useState<string | null>(null)
  const [isCroppingCustomUrl, setIsCroppingCustomUrl] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        setUploadedImage(dataUrl)
        setImageUrl(dataUrl)
        setCustomImageUrl('')
        setCroppedCustomUrl(null)
        setCustomUrlError(null)
      }
      reader.readAsDataURL(file)
    }
    // Reset the input value so the same file can be selected again
    event.target.value = ''
  }

  const handleDeleteUploadedImage = () => {
    setUploadedImage(null)
    if (customImageUrl) {
      setImageUrl(customImageUrl)
    } else {
      setImageUrl(DEFAULT_IMAGES[0])
    }
  }

  // Crop custom URL image to square when it changes
  useEffect(() => {
    if (!customImageUrl || uploadedImage) {
      setCroppedCustomUrl(null)
      setCustomUrlError(null)
      setIsCroppingCustomUrl(false)
      return
    }

    setIsCroppingCustomUrl(true)
    setCustomUrlError(null)
    
    cropImageToSquare(customImageUrl)
      .then((croppedUrl) => {
        setCroppedCustomUrl(croppedUrl)
        setIsCroppingCustomUrl(false)
        setCustomUrlError(null)
      })
      .catch((error) => {
        setIsCroppingCustomUrl(false)
        const errorMessage = error instanceof Error ? error.message : 'Failed to load image'
        
        if (errorMessage.includes('CORS')) {
          setCustomUrlError('CORS error: Cannot process image from this origin. The image server may not allow cross-origin access. Please try uploading the image instead or use a different URL.')
        } else {
          setCustomUrlError(`${errorMessage}. Please check the URL or try uploading the image instead.`)
        }
        setCroppedCustomUrl(null)
      })
  }, [customImageUrl, uploadedImage])

  const handleStart = () => {
    const settings: PuzzleSettings = {
      difficulty,
      timeLimit: timeLimitEnabled ? getTimeLimit(difficulty) : null,
      slideLimit: null,
      imageUrl: uploadedImage || croppedCustomUrl || customImageUrl || imageUrl,
    }
    onStart(settings)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    return mins === 1 ? '1 minute' : `${mins} minutes`
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
            className="text-[48px] font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"
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
              <div className="pt-2 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="time-limit" className="text-sm text-muted-foreground">Enable Time Limit</Label>
                  <Switch
                    id="time-limit"
                    checked={timeLimitEnabled}
                    onCheckedChange={setTimeLimitEnabled}
                  />
                </div>
                {timeLimitEnabled && (
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Time Limit</Label>
                    <span className="text-sm font-semibold">{formatTime(getTimeLimit(difficulty))}</span>
                  </div>
                )}
              </div>
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
                      setUploadedImage(null)
                      setCroppedCustomUrl(null)
                      setCustomUrlError(null)
                    }}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      imageUrl === url && !customImageUrl && !uploadedImage
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
                <div className="flex gap-2">
                  <Input
                    id="custom-image"
                    placeholder="https://example.com/image.jpg"
                    value={customImageUrl}
                    onChange={(e) => {
                      const url = e.target.value
                      setCustomImageUrl(url)
                      if (url) {
                        setImageUrl(url)
                        setUploadedImage(null)
                      } else {
                        setImageUrl(DEFAULT_IMAGES[0])
                        setCroppedCustomUrl(null)
                        setCustomUrlError(null)
                      }
                    }}
                    className="flex-1"
                  />
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="shrink-0"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {(uploadedImage || croppedCustomUrl) && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">
                        {uploadedImage ? 'Uploaded image preview:' : 'Custom URL image preview (cropped to square):'}
                      </p>
                      {uploadedImage && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleDeleteUploadedImage}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary ring-2 ring-primary max-w-xs relative">
                      {uploadedImage ? (
                        <img
                          src={uploadedImage}
                          alt="Uploaded preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        croppedCustomUrl && (
                          <img
                            src={croppedCustomUrl}
                            alt="Custom URL preview (cropped)"
                            className="w-full h-full object-cover"
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
                {isCroppingCustomUrl && (
                  <p className="text-sm text-muted-foreground mt-2">Processing image...</p>
                )}
                {customImageUrl && customUrlError && (
                  <div className="mt-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive font-medium">Error loading image</p>
                    <p className="text-sm text-destructive/80 mt-1">{customUrlError}</p>
                  </div>
                )}
              </div>
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
            className="px-8 text-lg bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:opacity-90"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Game
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

