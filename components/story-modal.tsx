"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AudioPlayer } from "@/components/audio-player"
import { ImageGenerator } from "@/components/image-generator"
import { X, Play, Pause, Volume2, Image as ImageIcon } from "lucide-react"

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
  const [activeTab, setActiveTab] = useState<'story' | 'images'>('story')
  const [storyImage, setStoryImage] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  // Auto-generate image when story modal opens
  useEffect(() => {
    if (isOpen && story && !storyImage && !isGeneratingImage) {
      generateStoryImage()
    }
  }, [isOpen, story, storyImage, isGeneratingImage])

  // Auto-generate image based on story content
  const generateStoryImage = async () => {
    if (!story) return

    setIsGeneratingImage(true)

    try {
      // Extract key elements from story
      const elements = extractStoryElements(story.text, story.title)
      const style = determineArtStyle(story.text, story.author)
      const prompt = generatePrompt(story.title, story.author, elements, style)

      // Try AI generation first, fallback to procedural
      const imageUrl = await generateAIImage(prompt, style)
      setStoryImage(imageUrl)
    } catch (error) {
      console.error('Auto image generation failed:', error)
      // Generate procedural fallback
      const fallbackUrl = generateProceduralImage(story.title, story.author, story.text)
      setStoryImage(fallbackUrl)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // Extract story elements for image generation
  const extractStoryElements = (text: string, title: string) => {
    const words = text.toLowerCase()
    const elements = []

    // Character detection
    if (words.includes('old man') || words.includes('elderly')) elements.push('elderly character')
    if (words.includes('woman') || words.includes('lady')) elements.push('woman')
    if (words.includes('child') || words.includes('boy') || words.includes('girl')) elements.push('child')

    // Setting detection
    if (words.includes('house') || words.includes('home') || words.includes('room')) elements.push('interior scene')
    if (words.includes('forest') || words.includes('trees') || words.includes('woods')) elements.push('forest')
    if (words.includes('city') || words.includes('street') || words.includes('town')) elements.push('urban setting')
    if (words.includes('night') || words.includes('dark') || words.includes('shadow')) elements.push('nighttime')
    if (words.includes('winter') || words.includes('snow') || words.includes('cold')) elements.push('winter scene')

    // Mood detection
    if (words.includes('horror') || words.includes('fear') || words.includes('terror') || words.includes('mad')) elements.push('horror atmosphere')
    if (words.includes('love') || words.includes('romance') || words.includes('heart')) elements.push('romantic mood')
    if (words.includes('mystery') || words.includes('secret') || words.includes('hidden')) elements.push('mysterious atmosphere')
    if (words.includes('christmas') || words.includes('holiday') || words.includes('gift')) elements.push('holiday theme')

    // Object detection
    if (words.includes('eye') || words.includes('eyes')) elements.push('prominent eyes')
    if (words.includes('fire') || words.includes('flame') || words.includes('fireplace')) elements.push('fire')
    if (words.includes('book') || words.includes('letter') || words.includes('writing')) elements.push('books')

    return elements.slice(0, 4) // Top 4 elements
  }

  // Determine appropriate art style based on content
  const determineArtStyle = (text: string, author: string) => {
    const words = text.toLowerCase()

    // Classic authors get vintage style
    if (author.includes('Poe') || author.includes('Dickens') || author.includes('Austen')) {
      return 'vintage'
    }

    // Horror content gets gothic style
    if (words.includes('horror') || words.includes('fear') || words.includes('terror') || words.includes('mad')) {
      return 'gothic'
    }

    // Romance gets watercolor
    if (words.includes('love') || words.includes('romance') || words.includes('heart')) {
      return 'watercolor'
    }

    // Christmas/holiday gets artistic
    if (words.includes('christmas') || words.includes('holiday') || words.includes('gift')) {
      return 'artistic'
    }

    // Default to realistic
    return 'realistic'
  }

  // Generate AI prompt
  const generatePrompt = (title: string, author: string, elements: string[], style: string) => {
    const basePrompt = `Book cover illustration for "${title}" by ${author}`
    const elementsText = elements.length > 0 ? `, featuring ${elements.join(', ')}` : ""

    let stylePrompt = ""
    switch (style) {
      case 'gothic':
        stylePrompt = "gothic style, dark atmosphere, dramatic lighting, mysterious"
        break
      case 'vintage':
        stylePrompt = "vintage book cover, classic literature style, aged paper texture"
        break
      case 'watercolor':
        stylePrompt = "watercolor painting, soft colors, romantic, artistic"
        break
      case 'artistic':
        stylePrompt = "artistic painting, brushstrokes, fine art, colorful"
        break
      default:
        stylePrompt = "photorealistic, detailed, high quality, professional"
    }

    return `${basePrompt}${elementsText}, ${stylePrompt}, book cover design`
  }

  // AI image generation
  const generateAIImage = async (prompt: string, style: string): Promise<string> => {
    try {
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=600&seed=${Date.now()}`

      // Test if service is available
      const response = await fetch(pollinationsUrl, { method: 'HEAD' })
      if (response.ok) {
        return pollinationsUrl
      }
    } catch (error) {
      console.log('AI service unavailable')
    }

    throw new Error('AI generation failed')
  }

  // Procedural image generation fallback
  const generateProceduralImage = (title: string, author: string, text: string): string => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ""

    canvas.width = 400
    canvas.height = 600

    // Create gradient based on story content
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    const words = text.toLowerCase()

    let colors = ['#1a1a2e', '#16213e'] // Default

    if (words.includes('christmas') || words.includes('gift')) {
      colors = ['#0f4c3a', '#2d5a27', '#8b0000'] // Christmas
    } else if (words.includes('horror') || words.includes('fear') || words.includes('mad')) {
      colors = ['#000000', '#1a0000', '#330000'] // Horror
    } else if (words.includes('love') || words.includes('romance')) {
      colors = ['#4a1a4a', '#6a2c70', '#b83dba'] // Romance
    }

    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color)
    })

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px serif'
    ctx.textAlign = 'center'

    // Wrap title
    const words_title = title.split(' ')
    const lines = []
    let currentLine = words_title[0]

    for (let i = 1; i < words_title.length; i++) {
      const testLine = currentLine + ' ' + words_title[i]
      const metrics = ctx.measureText(testLine)
      if (metrics.width > canvas.width - 40) {
        lines.push(currentLine)
        currentLine = words_title[i]
      } else {
        currentLine = testLine
      }
    }
    lines.push(currentLine)

    // Draw title
    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, 100 + (index * 30))
    })

    // Add author
    ctx.font = '16px serif'
    ctx.fillStyle = '#cccccc'
    ctx.fillText(`by ${author}`, canvas.width / 2, canvas.height - 50)

    // Add decorative elements based on content
    if (words.includes('eye') || words.includes('eyes')) {
      // Draw eye
      ctx.beginPath()
      ctx.ellipse(canvas.width / 2, canvas.height / 2, 60, 30, 0, 0, 2 * Math.PI)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, 20, 0, 2 * Math.PI)
      ctx.fillStyle = '#000000'
      ctx.fill()
    } else if (words.includes('heart')) {
      // Draw heart
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2, canvas.height / 2 + 20)
      ctx.bezierCurveTo(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 30, canvas.height / 2 - 20, canvas.width / 2 - 30, canvas.height / 2 - 10)
      ctx.bezierCurveTo(canvas.width / 2 - 30, canvas.height / 2 - 30, canvas.width / 2, canvas.height / 2 - 30, canvas.width / 2, canvas.height / 2)
      ctx.bezierCurveTo(canvas.width / 2, canvas.height / 2 - 30, canvas.width / 2 + 30, canvas.height / 2 - 30, canvas.width / 2 + 30, canvas.height / 2 - 10)
      ctx.bezierCurveTo(canvas.width / 2 + 30, canvas.height / 2 - 20, canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2 + 20)
      ctx.fillStyle = '#ff6b6b'
      ctx.fill()
    }

    return canvas.toDataURL('image/png')
  }

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
    setActiveTab('story')
    setStoryImage(null)
    onClose()
  }

  const handleImageGenerated = (imageUrl: string) => {
    setStoryImage(imageUrl)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
          <div className="flex items-center gap-4">
            {isGeneratingImage ? (
              <div className="w-16 h-24 bg-slate-700/50 rounded border border-purple-500/30 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
              </div>
            ) : storyImage ? (
              <img
                src={storyImage}
                alt={story.title}
                className="w-16 h-24 object-cover rounded border border-purple-500/30"
              />
            ) : (
              <div className="w-16 h-24 bg-slate-700/50 rounded border border-purple-500/30 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-purple-400" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">{story.title}</h2>
              <p className="text-purple-300">by {story.author}</p>
              {isGeneratingImage && (
                <p className="text-amber-400 text-sm">🎨 Generating story image...</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Tab Navigation */}
            <div className="flex bg-slate-700/50 rounded-lg p-1">
              <Button
                variant={activeTab === 'story' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('story')}
                className={`px-3 py-1 text-xs ${
                  activeTab === 'story'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                Story
              </Button>
              <Button
                variant={activeTab === 'images' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('images')}
                className={`px-3 py-1 text-xs ${
                  activeTab === 'images'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                <ImageIcon className="h-3 w-3 mr-1" />
                Images
              </Button>
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
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'story' && (
            <>
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
            </>
          )}

          {activeTab === 'images' && (
            <ImageGenerator
              storyTitle={story.title}
              storyText={story.text}
              author={story.author}
              onImageGenerated={handleImageGenerated}
            />
          )}
        </div>
      </div>
    </div>
  )
}
