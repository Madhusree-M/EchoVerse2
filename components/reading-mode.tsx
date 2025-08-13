"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Settings,
  BookOpen,
  Eye,
  Type
} from "lucide-react"

interface Story {
  id: number
  title: string
  author: string
  description: string
  duration: string
  image: string
  text: string
}

interface ReadingModeProps {
  story: Story | null
  isOpen: boolean
  onClose: () => void
}

export function ReadingMode({ story, isOpen, onClose }: ReadingModeProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState([1])
  const [volume, setVolume] = useState([1])
  const [fontSize, setFontSize] = useState([16])
  const [highlightColor, setHighlightColor] = useState("purple")
  
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)
  const wordsRef = useRef<string[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Split text into words for highlighting
  useEffect(() => {
    if (story?.text) {
      wordsRef.current = story.text.split(/\s+/)
    }
  }, [story])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechRef.current) {
        speechSynthesis.cancel()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const startReading = () => {
    if (!story?.text || !('speechSynthesis' in window)) return

    // Cancel any existing speech
    speechSynthesis.cancel()
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const utterance = new SpeechSynthesisUtterance(story.text)
    speechRef.current = utterance

    // Configure speech settings
    utterance.rate = playbackSpeed[0]
    utterance.volume = volume[0]
    utterance.pitch = 1.0

    // Try to find a good voice
    const voices = speechSynthesis.getVoices()
    const englishVoice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Natural')
    ) || voices.find(voice => voice.lang.startsWith('en'))
    
    if (englishVoice) {
      utterance.voice = englishVoice
    }

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true)
      startWordHighlighting()
    }

    utterance.onend = () => {
      setIsPlaying(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    utterance.onerror = () => {
      setIsPlaying(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    speechSynthesis.speak(utterance)
  }

  const stopReading = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const startWordHighlighting = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Calculate words per minute based on speech rate
    const baseWPM = 150 // Average reading speed
    const adjustedWPM = baseWPM * playbackSpeed[0]
    const msPerWord = (60 / adjustedWPM) * 1000

    intervalRef.current = setInterval(() => {
      setCurrentWordIndex(prev => {
        const nextIndex = prev + 1
        if (nextIndex >= wordsRef.current.length) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
          return prev
        }
        return nextIndex
      })
    }, msPerWord)
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      stopReading()
    } else {
      startReading()
    }
  }

  const skipBackward = () => {
    const newIndex = Math.max(0, currentWordIndex - 10)
    setCurrentWordIndex(newIndex)
    if (isPlaying) {
      stopReading()
      setTimeout(() => {
        // Resume from new position
        const remainingText = wordsRef.current.slice(newIndex).join(' ')
        if (remainingText) {
          const utterance = new SpeechSynthesisUtterance(remainingText)
          utterance.rate = playbackSpeed[0]
          utterance.volume = volume[0]
          speechSynthesis.speak(utterance)
          startWordHighlighting()
        }
      }, 100)
    }
  }

  const skipForward = () => {
    const newIndex = Math.min(wordsRef.current.length - 1, currentWordIndex + 10)
    setCurrentWordIndex(newIndex)
    if (isPlaying) {
      stopReading()
      setTimeout(() => {
        // Resume from new position
        const remainingText = wordsRef.current.slice(newIndex).join(' ')
        if (remainingText) {
          const utterance = new SpeechSynthesisUtterance(remainingText)
          utterance.rate = playbackSpeed[0]
          utterance.volume = volume[0]
          speechSynthesis.speak(utterance)
          startWordHighlighting()
        }
      }, 100)
    }
  }

  const handleSpeedChange = (value: number[]) => {
    setPlaybackSpeed(value)
    if (isPlaying) {
      stopReading()
      setTimeout(() => startReading(), 100)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value)
  }

  const renderHighlightedText = () => {
    if (!story?.text) return null

    return (
      <div 
        className="leading-relaxed text-justify"
        style={{ fontSize: `${fontSize[0]}px` }}
      >
        {wordsRef.current.map((word, index) => (
          <span
            key={index}
            className={`${
              index === currentWordIndex 
                ? `bg-${highlightColor}-500/30 text-${highlightColor}-100 px-1 rounded transition-all duration-200` 
                : index < currentWordIndex 
                  ? 'text-purple-300' 
                  : 'text-white'
            }`}
          >
            {word}{' '}
          </span>
        ))}
      </div>
    )
  }

  if (!isOpen || !story) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden border border-purple-500/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-white">{story.title}</h2>
              <p className="text-purple-300 text-sm">by {story.author}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-purple-600/20"
          >
            ✕
          </Button>
        </div>

        {/* Reading Area */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[60vh]">
          {renderHighlightedText()}
        </div>

        {/* Controls */}
        <div className="p-6 bg-slate-800/50 border-t border-purple-500/20 space-y-4">
          {/* Audio Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={skipBackward}
              className="text-white hover:bg-purple-600/20"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={togglePlayPause}
              className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white px-6 py-3"
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-2 h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Read Aloud
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={skipForward}
              className="text-white hover:bg-purple-600/20"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Settings */}
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            {/* Speed Control */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-purple-400" />
                <span className="text-white">Speed: {playbackSpeed[0]}x</span>
              </div>
              <Slider
                value={playbackSpeed}
                onValueChange={handleSpeedChange}
                max={2}
                min={0.5}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-purple-400" />
                <span className="text-white">Volume: {Math.round(volume[0] * 100)}%</span>
              </div>
              <Slider
                value={volume}
                onValueChange={handleVolumeChange}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-purple-400" />
                <span className="text-white">Font: {fontSize[0]}px</span>
              </div>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                max={24}
                min={12}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-purple-200">
              <span>Progress: {currentWordIndex} / {wordsRef.current.length} words</span>
              <span>{Math.round((currentWordIndex / wordsRef.current.length) * 100)}% complete</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentWordIndex / wordsRef.current.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
