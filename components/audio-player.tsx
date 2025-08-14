"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Download, SkipBack, SkipForward, Volume2 } from "lucide-react"

interface AudioPlayerProps {
  audioUrl?: string
  text?: string
  voice?: string
  emotion?: string
  ambience?: string
  ambienceVolume?: number
}

export function AudioPlayer({ audioUrl, text, voice, emotion, ambience, ambienceVolume = 50 }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState([1])
  const [volume, setVolume] = useState([1])
  const [isSpeechSupported, setIsSpeechSupported] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const ambienceRef = useRef<HTMLAudioElement>(null)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)
  const ambienceNodesRef = useRef<Array<{ node: any, context: AudioContext }> | null>(null)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isAmbiencePlaying, setIsAmbiencePlaying] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)

  // Ambience sound URLs (using free online sources)
  const ambienceUrls = {
    rain: "https://www.soundjay.com/misc/sounds/rain-01.wav",
    fireplace: "https://www.soundjay.com/misc/sounds/fireplace.wav",
    forest: "https://www.soundjay.com/misc/sounds/forest.wav",
    scifi: "https://www.soundjay.com/misc/sounds/scifi.wav"
  }

  // Check if speech synthesis is supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSpeechSupported(true)

      // Load available voices
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices()
        setAvailableVoices(voices)
      }

      loadVoices()
      speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  // Handle ambience playback
  useEffect(() => {
    // Always stop current ambience first
    stopAllAmbience()

    // Don't start new ambience if not playing or no ambience selected
    if (!isPlaying || !ambience || ambience === 'none') {
      return
    }

    const ambienceAudio = ambienceRef.current
    const ambienceUrl = ambienceUrls[ambience as keyof typeof ambienceUrls]

    if (ambienceUrl && ambienceAudio) {
      // Try to use audio file first
      ambienceAudio.src = ambienceUrl
      ambienceAudio.loop = true
      ambienceAudio.volume = (ambienceVolume / 100) * 0.3 // Keep ambience quieter

      ambienceAudio.play().then(() => {
        setIsAmbiencePlaying(true)
      }).catch(() => {
        console.log('Ambience playback failed - using generated sounds instead')
        playGeneratedAmbience()
        setIsAmbiencePlaying(true)
      })
    } else {
      // Use generated ambience
      playGeneratedAmbience()
      setIsAmbiencePlaying(true)
    }
  }, [ambience, ambienceVolume, isPlaying])

  // Generate more natural ambience using Web Audio API
  const playGeneratedAmbience = () => {
    if (typeof window === 'undefined' || !('AudioContext' in window)) return

    try {
      const audioContext = new AudioContext()
      let ambienceNodes = []

      // Configure based on ambience type with more natural sounds
      switch (ambience) {
        case 'rain':
          // Create white noise for more natural rain sound
          const bufferSize = audioContext.sampleRate * 2
          const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
          const output = noiseBuffer.getChannelData(0)

          // Generate white noise
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1
          }

          const whiteNoise = audioContext.createBufferSource()
          whiteNoise.buffer = noiseBuffer
          whiteNoise.loop = true

          // Filter for rain-like sound
          const rainFilter = audioContext.createBiquadFilter()
          rainFilter.type = 'lowpass'
          rainFilter.frequency.setValueAtTime(1000, audioContext.currentTime)

          const rainGain = audioContext.createGain()
          rainGain.gain.setValueAtTime(0.1 * (ambienceVolume / 100), audioContext.currentTime)

          whiteNoise.connect(rainFilter)
          rainFilter.connect(rainGain)
          rainGain.connect(audioContext.destination)

          whiteNoise.start()
          ambienceNodes.push({ node: whiteNoise, context: audioContext })
          break

        case 'fireplace':
          // Create crackling fire sound with multiple oscillators
          for (let i = 0; i < 3; i++) {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.type = 'sawtooth'
            oscillator.frequency.setValueAtTime(50 + Math.random() * 100, audioContext.currentTime)
            gainNode.gain.setValueAtTime(0.02 * (ambienceVolume / 100), audioContext.currentTime)

            // Add random variations
            oscillator.frequency.setValueAtTime(
              50 + Math.random() * 100,
              audioContext.currentTime + Math.random() * 2
            )

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            oscillator.start()

            ambienceNodes.push({ node: oscillator, context: audioContext })
          }
          break

        case 'forest':
          // Create layered forest sounds
          const birdOsc = audioContext.createOscillator()
          const windOsc = audioContext.createOscillator()
          const birdGain = audioContext.createGain()
          const windGain = audioContext.createGain()

          birdOsc.type = 'sine'
          birdOsc.frequency.setValueAtTime(800, audioContext.currentTime)
          birdGain.gain.setValueAtTime(0.02 * (ambienceVolume / 100), audioContext.currentTime)

          windOsc.type = 'sawtooth'
          windOsc.frequency.setValueAtTime(200, audioContext.currentTime)
          windGain.gain.setValueAtTime(0.01 * (ambienceVolume / 100), audioContext.currentTime)

          birdOsc.connect(birdGain)
          windOsc.connect(windGain)
          birdGain.connect(audioContext.destination)
          windGain.connect(audioContext.destination)

          birdOsc.start()
          windOsc.start()

          ambienceNodes.push({ node: birdOsc, context: audioContext })
          ambienceNodes.push({ node: windOsc, context: audioContext })
          break

        case 'scifi':
          // Create futuristic ambient sound
          const scifiOsc = audioContext.createOscillator()
          const scifiGain = audioContext.createGain()
          const scifiFilter = audioContext.createBiquadFilter()

          scifiOsc.type = 'triangle'
          scifiOsc.frequency.setValueAtTime(150, audioContext.currentTime)
          scifiFilter.type = 'lowpass'
          scifiFilter.frequency.setValueAtTime(300, audioContext.currentTime)
          scifiGain.gain.setValueAtTime(0.05 * (ambienceVolume / 100), audioContext.currentTime)

          scifiOsc.connect(scifiFilter)
          scifiFilter.connect(scifiGain)
          scifiGain.connect(audioContext.destination)
          scifiOsc.start()

          ambienceNodes.push({ node: scifiOsc, context: audioContext })
          break
      }

      // Store references for cleanup
      ambienceNodesRef.current = ambienceNodes
    } catch (error) {
      console.log('Generated ambience failed:', error)
    }
  }

  // Cleanup function for ambience
  const stopGeneratedAmbience = () => {
    if (ambienceNodesRef.current) {
      ambienceNodesRef.current.forEach(({ node, context }) => {
        try {
          // Stop the audio node
          if (node && typeof node.stop === 'function') {
            node.stop()
          }
        } catch (error) {
          console.log('Error stopping ambience node:', error)
        }
      })

      // Close audio contexts separately and safely
      const contexts = [...new Set(ambienceNodesRef.current.map(({ context }) => context))]
      contexts.forEach(context => {
        try {
          if (context && context.state !== 'closed' && typeof context.close === 'function') {
            context.close()
          }
        } catch (error) {
          console.log('Error closing audio context:', error)
        }
      })

      ambienceNodesRef.current = null
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", () => setIsPlaying(false))

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", () => setIsPlaying(false))
    }
  }, [audioUrl])

  const togglePlayPause = () => {
    // If we have text and speech synthesis is supported, use TTS
    if (text && isSpeechSupported) {
      if (isPlaying) {
        speechSynthesis.cancel()
        stopAllAmbience()
        setIsPlaying(false)
        setIsAmbiencePlaying(false)
      } else {
        playTextToSpeech()
      }
      return
    }

    // Otherwise use regular audio player
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      stopAllAmbience()
      setIsAmbiencePlaying(false)
    } else {
      audio.play().catch(error => {
        console.error('Audio playback failed:', error)
        // If audio fails, try text-to-speech as fallback
        if (text && isSpeechSupported) {
          playTextToSpeech()
        }
      })
    }
    setIsPlaying(!isPlaying)
  }

  // Function to stop all ambience sources
  const stopAllAmbience = () => {
    // Stop HTML audio ambience
    const ambienceAudio = ambienceRef.current
    if (ambienceAudio) {
      ambienceAudio.pause()
      ambienceAudio.currentTime = 0
    }

    // Stop generated ambience
    stopGeneratedAmbience()
  }

  const playTextToSpeech = () => {
    if (!text || !isSpeechSupported) return

    // Cancel any ongoing speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    speechRef.current = utterance

    // Configure voice based on selection
    const selectedVoice = getSelectedVoice()
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    // Configure speech parameters based on emotion
    configureSpeechEmotion(utterance)

    // Set volume and rate
    utterance.volume = volume[0]
    utterance.rate = playbackSpeed[0]

    // Event handlers
    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => {
      setIsPlaying(false)
      setIsAmbiencePlaying(false)
      stopAllAmbience()
    }
    utterance.onerror = () => {
      setIsPlaying(false)
      setIsAmbiencePlaying(false)
      stopAllAmbience()
    }

    speechSynthesis.speak(utterance)
  }

  const getSelectedVoice = () => {
    if (!voice || availableVoices.length === 0) return null

    // Try to find a voice that matches the selection
    let selectedVoice = null

    if (voice === 'female') {
      selectedVoice = availableVoices.find(v =>
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('woman') ||
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('hazel')
      )
    } else if (voice === 'male') {
      selectedVoice = availableVoices.find(v =>
        v.name.toLowerCase().includes('male') ||
        v.name.toLowerCase().includes('man') ||
        v.name.toLowerCase().includes('david') ||
        v.name.toLowerCase().includes('mark')
      )
    }

    // Fallback to first available voice
    return selectedVoice || availableVoices[0]
  }

  const configureSpeechEmotion = (utterance: SpeechSynthesisUtterance) => {
    switch (emotion) {
      case 'dramatic':
        utterance.rate = 0.9
        utterance.pitch = 1.2
        break
      case 'energetic':
        utterance.rate = 1.3
        utterance.pitch = 1.1
        break
      case 'sad':
        utterance.rate = 0.7
        utterance.pitch = 0.8
        break
      case 'happy':
        utterance.rate = 1.1
        utterance.pitch = 1.3
        break
      case 'calm':
      default:
        utterance.rate = 1.0
        utterance.pitch = 1.0
        break
    }
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleSpeedChange = (value: number[]) => {
    setPlaybackSpeed(value)

    const audio = audioRef.current
    if (audio) {
      audio.playbackRate = value[0]
    }

    // If speech is currently playing, update its rate
    if (speechRef.current && isPlaying) {
      speechSynthesis.cancel()
      playTextToSpeech()
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value)

    const audio = audioRef.current
    if (audio) {
      audio.volume = value[0]
    }

    // If speech is currently playing, update its volume
    if (speechRef.current && isPlaying) {
      speechSynthesis.cancel()
      playTextToSpeech()
    }
  }

  const skipTime = (seconds: number) => {
    setIsSkipping(true)

    const audio = audioRef.current

    // For regular audio files
    if (audio && audioUrl) {
      audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds))
      setTimeout(() => setIsSkipping(false), 300)
      return
    }

    // For text-to-speech, we need to handle differently
    if (text && speechSynthesis) {
      // Cancel current speech
      speechSynthesis.cancel()

      // Calculate approximate position in text based on time
      const wordsPerMinute = 150 // Average speaking rate
      const wordsPerSecond = wordsPerMinute / 60
      const currentWords = Math.floor(currentTime * wordsPerSecond)
      const skipWords = Math.floor(seconds * wordsPerSecond)
      const newWordPosition = Math.max(0, currentWords + skipWords)

      // Split text into words and start from new position
      const words = text.split(' ')
      const newStartPosition = Math.min(newWordPosition, words.length - 1)
      const remainingText = words.slice(newStartPosition).join(' ')

      if (remainingText.trim()) {
        // Update current time estimate
        setCurrentTime(Math.max(0, currentTime + seconds))

        // Start speech from new position
        const utterance = new SpeechSynthesisUtterance(remainingText)

        // Apply voice settings
        if (availableVoices.length > 0) {
          const selectedVoice = availableVoices.find(v => v.name.includes(voice || '')) || availableVoices[0]
          utterance.voice = selectedVoice
        }

        utterance.rate = playbackSpeed[0]
        utterance.volume = volume[0]

        utterance.onend = () => {
          setIsPlaying(false)
          setCurrentTime(0)
          setIsSkipping(false)
        }

        utterance.onstart = () => {
          setIsSkipping(false)
        }

        speechSynthesis.speak(utterance)
        speechRef.current = utterance
      } else {
        setIsSkipping(false)
      }
    } else {
      setIsSkipping(false)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      if (audioUrl) {
        // Download regular audio file
        const link = document.createElement("a")
        link.href = audioUrl
        link.download = "audiobook.mp3"
        link.click()
        setTimeout(() => setIsDownloading(false), 1000)
      } else if (text) {
        // For text-to-speech, create a downloadable audio file
        await downloadTextToSpeech()
      }
    } catch (error) {
      console.error('Download failed:', error)
      alert("Download failed. Your browser may not support audio recording from text-to-speech.")
    } finally {
      setIsDownloading(false)
    }
  }

  const downloadTextToSpeech = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!text || !speechSynthesis) {
        reject(new Error('Text or speech synthesis not available'))
        return
      }

      // Try advanced recording method first
      try {
        downloadWithRecording(resolve, reject)
      } catch (error) {
        // Fallback to simple text file download
        downloadAsTextFile(resolve)
      }
    })
  }

  const downloadWithRecording = (resolve: () => void, reject: (error: Error) => void) => {
    // Check if MediaRecorder is supported
    if (!window.MediaRecorder) {
      throw new Error('MediaRecorder not supported')
    }

    // Create audio context for recording
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const destination = audioContext.createMediaStreamDestination()

    // Create media recorder
    const mediaRecorder = new MediaRecorder(destination.stream)
    const audioChunks: Blob[] = []

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data)
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
      const audioUrl = URL.createObjectURL(audioBlob)

      // Create download link
      const link = document.createElement('a')
      link.href = audioUrl
      link.download = `audiobook-${Date.now()}.wav`
      link.click()

      // Cleanup
      URL.revokeObjectURL(audioUrl)
      audioContext.close()
      resolve()
    }

    mediaRecorder.onerror = (event) => {
      reject(new Error('Recording failed'))
    }

    // Start recording
    mediaRecorder.start()

    // Create and configure speech utterance
    const utterance = new SpeechSynthesisUtterance(text)

    if (availableVoices.length > 0) {
      const selectedVoice = availableVoices.find(v => v.name.includes(voice || '')) || availableVoices[0]
      utterance.voice = selectedVoice
    }

    utterance.rate = playbackSpeed[0]
    utterance.volume = volume[0]

    utterance.onend = () => {
      // Stop recording after speech ends
      setTimeout(() => {
        mediaRecorder.stop()
      }, 500) // Small delay to ensure all audio is captured
    }

    utterance.onerror = () => {
      mediaRecorder.stop()
      reject(new Error('Speech synthesis failed'))
    }

    // Speak the text
    speechSynthesis.speak(utterance)
  }

  const downloadAsTextFile = (resolve: () => void) => {
    // Fallback: download as text file with instructions
    const content = `EchoVerse Audiobook Text
========================

Title: ${text.substring(0, 50)}...
Voice: ${voice || 'default'}
Emotion: ${emotion || 'calm'}
Speed: ${playbackSpeed[0]}x

Text Content:
${text}

Instructions:
This text can be used with any text-to-speech software or service to create an audio file.
Recommended settings: Voice: ${voice || 'default'}, Speed: ${playbackSpeed[0]}x
`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `audiobook-text-${Date.now()}.txt`
    link.click()

    URL.revokeObjectURL(url)
    resolve()
  }

  // Cleanup speech synthesis and ambience on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel()
      }
      stopAllAmbience()
    }
  }, [])

  // Also cleanup when text or ambience changes
  useEffect(() => {
    return () => {
      if (!isPlaying) {
        stopAllAmbience()
      }
    }
  }, [text, ambience])

  return (
    <div className="bg-slate-700/50 rounded-lg p-6 border border-purple-500/20">
      {audioUrl && <audio ref={audioRef} src={audioUrl} />}
      <audio ref={ambienceRef} style={{ display: 'none' }} />

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-purple-400" />
          {text ? "Text-to-Speech Player" : "Audio Player"}
        </h3>
        <div className="flex flex-wrap gap-4 text-sm">
          {text && !audioUrl && (
            <p className="text-purple-200">
              Using browser text-to-speech • Voice: {voice || 'default'} • Emotion: {emotion || 'calm'}
            </p>
          )}
          {ambience && ambience !== 'none' && (
            <p className="text-amber-300 flex items-center gap-1">
              🎵 Background: {ambience} ({ambienceVolume}% volume)
              {isAmbiencePlaying && <span className="animate-pulse">♪</span>}
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar - only show for regular audio */}
      {audioUrl && (
        <div className="mb-4">
          <Slider value={[currentTime]} onValueChange={handleSeek} max={duration || 100} step={1} className="w-full" />
          <div className="flex justify-between text-sm text-purple-200 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skipTime(-10)}
            disabled={isSkipping}
            className="text-white hover:bg-purple-600/20 disabled:opacity-50"
            title="Skip backward 10 seconds"
          >
            {isSkipping ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <SkipBack className="h-4 w-4" />
            )}
          </Button>

          <Button
            onClick={togglePlayPause}
            disabled={isSkipping}
            className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white disabled:opacity-50"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => skipTime(10)}
            disabled={isSkipping}
            className="text-white hover:bg-purple-600/20 disabled:opacity-50"
            title="Skip forward 10 seconds"
          >
            {isSkipping ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <SkipForward className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {/* Speed Control */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-purple-200">Speed:</span>
            <div className="w-20">
              <Slider value={playbackSpeed} onValueChange={handleSpeedChange} min={0.5} max={2} step={0.25} />
            </div>
            <span className="text-sm text-purple-200 w-8">{playbackSpeed[0]}x</span>
          </div>

          {/* Download Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="text-white hover:bg-purple-600/20 disabled:opacity-50"
            title={text ? "Download as audio file (TTS)" : "Download audio file"}
          >
            {isDownloading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {isDownloading && (
        <div className="mt-2 text-center">
          <p className="text-amber-300 text-sm">
            {text ? "🎤 Recording text-to-speech audio..." : "📥 Downloading audio file..."}
          </p>
        </div>
      )}

      {isSkipping && (
        <div className="mt-2 text-center">
          <p className="text-blue-300 text-sm">
            ⏭️ {text ? "Repositioning in text..." : "Seeking in audio..."}
          </p>
        </div>
      )}
    </div>
  )
}
