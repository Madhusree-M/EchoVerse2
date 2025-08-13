"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AudioPlayer } from "@/components/audio-player"
import { X, Play, Pause, Volume2 } from "lucide-react"

interface Story {
  id: number
  title: string
  author: string
  description: string
  duration: string
  image: string
  text: string
}

interface StoryModalProps {
  story: Story | null
  isOpen: boolean
  onClose: () => void
}

export function StoryModal({ story, isOpen, onClose }: StoryModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null)
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null)

  if (!isOpen || !story) return null

  const handlePlay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser')
      return
    }

    const synth = window.speechSynthesis
    setSpeechSynthesis(synth)

    if (isPlaying) {
      synth.cancel()
      setIsPlaying(false)
    } else {
      const newUtterance = new SpeechSynthesisUtterance(story.text)
      
      // Configure voice settings
      newUtterance.rate = 1.0
      newUtterance.pitch = 1.0
      newUtterance.volume = 1.0
      
      // Try to find a good voice
      const voices = synth.getVoices()
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Natural')
      ) || voices.find(voice => voice.lang.startsWith('en'))
      
      if (englishVoice) {
        newUtterance.voice = englishVoice
      }

      newUtterance.onstart = () => setIsPlaying(true)
      newUtterance.onend = () => setIsPlaying(false)
      newUtterance.onerror = () => setIsPlaying(false)

      setUtterance(newUtterance)
      synth.speak(newUtterance)
    }
  }

  const handleClose = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel()
    }
    setIsPlaying(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
          <div>
            <h2 className="text-2xl font-bold text-white">{story.title}</h2>
            <p className="text-purple-300">by {story.author}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:bg-purple-600/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-purple-200 mb-6">{story.description}</p>
          
          {/* Simple Audio Controls */}
          <div className="bg-slate-700/50 rounded-lg p-4 mb-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-purple-400" />
                <span className="text-white font-semibold">Audio Player</span>
              </div>
              <span className="text-purple-200 text-sm">{story.duration}</span>
            </div>
            
            <div className="flex items-center justify-center">
              <Button
                onClick={handlePlay}
                className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white px-8 py-3"
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-2 h-5 w-5" />
                    Pause Story
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Play Story
                  </>
                )}
              </Button>
            </div>
            
            {isPlaying && (
              <div className="mt-4 text-center">
                <p className="text-purple-200 text-sm">
                  🎵 Playing with text-to-speech...
                </p>
              </div>
            )}
          </div>

          {/* Story Text Preview */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">Story Preview</h3>
            <p className="text-purple-200 text-sm leading-relaxed">
              {story.text.substring(0, 300)}...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
