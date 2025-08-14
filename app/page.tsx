"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { AudioPlayer } from "@/components/audio-player"
import { StoryCard } from "@/components/story-card"
import { StoryModal } from "@/components/story-modal"
import { ReadingMode } from "@/components/reading-mode"
import { PlaylistManager } from "@/components/playlist-manager"
import { ImageGenerator } from "@/components/image-generator"
import { StoryAvatar } from "@/components/story-avatar"
import { TextComparison } from "@/components/text-comparison"
import { rewriteTextWithTone, type ToneType, type RewriteResult } from "@/lib/text-rewriter"
import { FileUpload } from "@/components/file-upload"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Play, Mic, Volume2, User, BookOpen, Music, Image as ImageIcon } from "lucide-react"

const publicDomainStories = [
  {
    id: 1,
    title: "The Tell-Tale Heart",
    author: "Edgar Allan Poe",
    description: "A haunting tale of guilt and madness",
    duration: "12 min",
    image: "/tell-tale-heart.svg",
    text: "True! nervous, very, very dreadfully nervous I had been and am; but why will you say that I am mad? The disease had sharpened my senses, not destroyed, not dulled them. Above all was the sense of hearing acute. I heard all things in the heaven and in the earth. I heard many things in hell. How then am I mad? Hearken! and observe how healthily, how calmly, I can tell you the whole story. It is impossible to say how first the idea entered my brain, but, once conceived, it haunted me day and night. Object there was none. Passion there was none. I loved the old man. He had never wronged me. He had never given me insult. For his gold I had no desire. I think it was his eye! Yes, it was this! One of his eyes resembled that of a vulture—a pale blue eye with a film over it. Whenever it fell upon me my blood ran cold, and so by degrees, very gradually, I made up my mind to take the life of the old man, and thus rid myself of the eye for ever."
  },
  {
    id: 2,
    title: "The Gift of the Magi",
    author: "O. Henry",
    description: "A heartwarming Christmas story of love and sacrifice",
    duration: "8 min",
    image: "/gift-of-magi.svg",
    text: "One dollar and eighty-seven cents. That was all. And sixty cents of it was in pennies. Pennies saved one and two at a time by bulldozing the grocer and the vegetable man and the butcher until one's cheeks burned with the silent imputation of parsimony that such close dealing implied. Three times Della counted it. One dollar and eighty-seven cents. And the next day would be Christmas. There was clearly nothing to do but flop down on the shabby little couch and howl. So Della did it. Which instigates the moral reflection that life is made up of sobs, sniffles, and smiles, with sniffles predominating. While the mistress of the home is gradually subsiding from the first stage to the second, take a look at the home. A furnished flat at $8 per week. It did not exactly beggar description, but it certainly had that word on the lookout for the mendicancy squad."
  },
  {
    id: 3,
    title: "The Yellow Wallpaper",
    author: "Charlotte Perkins Gilman",
    description: "A psychological thriller about confinement",
    duration: "15 min",
    image: "/yellow-wallpaper.svg",
    text: "It is very seldom that mere ordinary people like John and myself secure ancestral halls for the summer. A colonial mansion, a hereditary estate, I would say a haunted house, and reach the height of romantic felicity—but that would be asking too much of fate! Still I will proudly declare that there is something queer about it. Else, why should it be let so cheaply? And why have stood so long untenanted? John laughs at me, of course, but one expects that in marriage. John is practical in the extreme. He has no patience with faith, an intense horror of superstition, and he scoffs openly at any talk of things not to be felt and seen and put down in figures. John is a physician, and perhaps—I would not say it to a living soul, of course, but this is dead paper and a great relief to my mind—perhaps that is one reason I do not get well faster."
  },
  {
    id: 4,
    title: "A Good Man Is Hard to Find",
    author: "Flannery O'Connor",
    description: "A Southern Gothic tale of family and fate",
    duration: "18 min",
    image: "/good-man-hard-to-find.svg",
    text: "The grandmother didn't want to go to Florida. She wanted to visit some of her connections in east Tennessee and she was seizing at every chance to change Bailey's mind. Bailey was the son she lived with, her only boy. He was sitting on the edge of his chair at the table, bent over the orange sports section of the Journal. 'Now look here, Bailey,' she said, 'see here, read this,' and she stood with one hand on her thin hip and the other rattling the newspaper at his bald head. 'Here this fellow that calls himself The Misfit is aloose from the Federal Pen and headed toward Florida and you read here what it says he did to these people. Just you read it. I wouldn't take my children in any direction with a criminal like that aloose in it. I couldn't answer to my conscience if I did.'"
  },
]

export default function EchoVerse() {
  const [text, setText] = useState("")
  const [voice, setVoice] = useState("")
  const [emotion, setEmotion] = useState("")
  const [tone, setTone] = useState<ToneType>('neutral')
  const [ambience, setAmbience] = useState("")
  const [ambienceVolume, setAmbienceVolume] = useState([50])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRewriting, setIsRewriting] = useState(false)
  const [audioUrl, setAudioUrl] = useState("")
  const [currentStory, setCurrentStory] = useState<typeof publicDomainStories[0] | null>(null)
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false)
  const [isReadingModeOpen, setIsReadingModeOpen] = useState(false)
  const [readingModeStory, setReadingModeStory] = useState<typeof publicDomainStories[0] | null>(null)
  const [savedStories, setSavedStories] = useState<typeof publicDomainStories>([])
  const [activeTab, setActiveTab] = useState<'generator' | 'library' | 'playlists'>('generator')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [rewriteResult, setRewriteResult] = useState<RewriteResult | null>(null)
  const [useRewrittenText, setUseRewrittenText] = useState(false)
  const [playlists, setPlaylists] = useState<Array<{
    id: string
    name: string
    description: string
    stories: typeof publicDomainStories
    createdAt: string
  }>>([])
  const [pendingStoryForPlaylist, setPendingStoryForPlaylist] = useState<typeof publicDomainStories[0] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load playlists and saved stories from localStorage on mount
  useEffect(() => {
    const savedPlaylists = localStorage.getItem("echoverse-playlists")
    const savedStoriesData = localStorage.getItem("echoverse-saved-stories")

    // Load saved stories
    if (savedStoriesData) {
      try {
        const parsedStories = JSON.parse(savedStoriesData)
        setSavedStories(parsedStories)
      } catch (error) {
        console.error("Error loading saved stories:", error)
      }
    }

    // Load playlists
    if (savedPlaylists) {
      try {
        const parsedPlaylists = JSON.parse(savedPlaylists)
        setPlaylists(parsedPlaylists)
      } catch (error) {
        console.error("Error loading playlists:", error)
        // Initialize with default playlists if loading fails
        setPlaylists([
          {
            id: "bedtime",
            name: "Bedtime Stories",
            description: "Calm and soothing stories for peaceful sleep",
            stories: [],
            createdAt: new Date().toISOString()
          },
          {
            id: "travel",
            name: "Travel Companions",
            description: "Perfect stories for your journeys",
            stories: [],
            createdAt: new Date().toISOString()
          },
          {
            id: "study",
            name: "Study Break",
            description: "Short stories for study breaks",
            stories: [],
            createdAt: new Date().toISOString()
          }
        ])
      }
    } else {
      // Initialize with default playlists
      setPlaylists([
        {
          id: "bedtime",
          name: "Bedtime Stories",
          description: "Calm and soothing stories for peaceful sleep",
          stories: [],
          createdAt: new Date().toISOString()
        },
        {
          id: "travel",
          name: "Travel Companions",
          description: "Perfect stories for your journeys",
          stories: [],
          createdAt: new Date().toISOString()
        },
        {
          id: "study",
          name: "Study Break",
          description: "Short stories for study breaks",
          stories: [],
          createdAt: new Date().toISOString()
        }
      ])
    }
  }, [])

  // Save playlists to localStorage whenever they change
  useEffect(() => {
    if (playlists.length > 0) {
      localStorage.setItem("echoverse-playlists", JSON.stringify(playlists))
    }
  }, [playlists])

  // Save saved stories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("echoverse-saved-stories", JSON.stringify(savedStories))
  }, [savedStories])

  // Save saved stories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("echoverse-saved-stories", JSON.stringify(savedStories))
  }, [savedStories])

  const handlePlayStory = (story: typeof publicDomainStories[0]) => {
    setCurrentStory(story)
    setIsStoryModalOpen(true)
  }

  const handleCloseStoryModal = () => {
    setIsStoryModalOpen(false)
    setCurrentStory(null)
  }

  const handleReadingMode = (story: typeof publicDomainStories[0]) => {
    setReadingModeStory(story)
    setIsReadingModeOpen(true)
  }

  const handleCloseReadingMode = () => {
    setIsReadingModeOpen(false)
    setReadingModeStory(null)
  }

  const handleSaveStory = (story: typeof publicDomainStories[0]) => {
    if (!savedStories.find(s => s.id === story.id)) {
      setSavedStories([...savedStories, story])
    }
  }

  const handleUnsaveStory = (storyId: number) => {
    setSavedStories(savedStories.filter(s => s.id !== storyId))
    // Also remove from all playlists
    setPlaylists(playlists.map(playlist => ({
      ...playlist,
      stories: playlist.stories.filter(s => s.id !== storyId)
    })))
  }

  const handleAddToPlaylist = (story: typeof publicDomainStories[0]) => {
    setPendingStoryForPlaylist(story)
    // Switch to playlists tab to show the add to playlist interface
    setActiveTab('playlists')
  }

  const handleCreatePlaylist = (name: string, description: string) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      description,
      stories: [],
      createdAt: new Date().toISOString()
    }
    setPlaylists([...playlists, newPlaylist])
    return newPlaylist.id
  }

  const handleAddStoryToPlaylist = (playlistId: string, story: typeof publicDomainStories[0]) => {
    setPlaylists(playlists.map(playlist => {
      if (playlist.id === playlistId) {
        // Check if story is already in playlist
        if (!playlist.stories.find(s => s.id === story.id)) {
          return {
            ...playlist,
            stories: [...playlist.stories, story]
          }
        }
      }
      return playlist
    }))
    // Clear pending story after adding
    setPendingStoryForPlaylist(null)
  }

  const handleRemoveStoryFromPlaylist = (playlistId: string, storyId: number) => {
    setPlaylists(playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          stories: playlist.stories.filter(s => s.id !== storyId)
        }
      }
      return playlist
    }))
  }

  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter(p => p.id !== playlistId))
  }

  const handlePlayPlaylist = (playlist: typeof playlists[0]) => {
    if (playlist.stories.length > 0) {
      // Play the first story in the playlist
      handlePlayStory(playlist.stories[0])
    }
  }

  const isStorySaved = (storyId: number) => {
    return savedStories.some(s => s.id === storyId)
  }

  const handleImageGenerated = (imageUrl: string) => {
    setGeneratedImage(imageUrl)
  }

  const handleRewriteText = async () => {
    if (!text.trim()) return

    setIsRewriting(true)
    try {
      const result = await rewriteTextWithTone(text, tone)
      setRewriteResult(result)
      setUseRewrittenText(true)
    } catch (error) {
      console.error('Text rewriting failed:', error)
      alert('Failed to rewrite text. Please try again.')
    } finally {
      setIsRewriting(false)
    }
  }

  const handleGenerate = async () => {
    if (!text.trim() || !voice || !emotion) return

    setIsGenerating(true)

    // Auto-generate image when generating audiobook
    const textToUse = useRewrittenText && rewriteResult ? rewriteResult.rewrittenText : text
    if (textToUse.trim().length > 50) { // Only for substantial text
      generateImageForText()
    }

    // Simulate processing time
    setTimeout(() => {
      setAudioUrl("generated") // Flag to show audio player with text-to-speech
      setIsGenerating(false)
    }, 2000)
  }

  const generateImageForText = async () => {
    setIsGeneratingImage(true)

    try {
      // Quick analysis for custom text
      const style = determineStyleFromText(text)
      const prompt = `Book cover illustration for custom story, ${style} style, featuring themes from the text, professional book cover design`

      // Try AI generation
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=600&seed=${Date.now()}`

      const response = await fetch(pollinationsUrl, { method: 'HEAD' })
      if (response.ok) {
        setGeneratedImage(pollinationsUrl)
      } else {
        // Fallback to procedural
        const fallbackUrl = generateProceduralImageFromText()
        setGeneratedImage(fallbackUrl)
      }
    } catch (error) {
      // Fallback to procedural
      const fallbackUrl = generateProceduralImageFromText()
      setGeneratedImage(fallbackUrl)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const determineStyleFromText = (text: string) => {
    const words = text.toLowerCase()

    if (words.includes('horror') || words.includes('fear') || words.includes('scary')) {
      return 'gothic, dark, mysterious, horror'
    }
    if (words.includes('love') || words.includes('romance') || words.includes('heart')) {
      return 'romantic, soft, elegant, watercolor'
    }
    if (words.includes('adventure') || words.includes('journey') || words.includes('quest')) {
      return 'epic, adventurous, dynamic'
    }
    if (words.includes('fantasy') || words.includes('magic') || words.includes('wizard')) {
      return 'fantasy, magical, mystical'
    }
    if (words.includes('science') || words.includes('future') || words.includes('space')) {
      return 'sci-fi, futuristic, technological'
    }
    return 'artistic, literary, classic'
  }

  const generateProceduralImageFromText = (): string => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ""

    canvas.width = 400
    canvas.height = 600

    // Create gradient based on text content
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    const words = text.toLowerCase()

    if (words.includes('horror') || words.includes('fear')) {
      gradient.addColorStop(0, '#1a0000')
      gradient.addColorStop(1, '#000000')
    } else if (words.includes('love') || words.includes('romance')) {
      gradient.addColorStop(0, '#4a1a4a')
      gradient.addColorStop(1, '#6a2c70')
    } else if (words.includes('adventure')) {
      gradient.addColorStop(0, '#1a4a1a')
      gradient.addColorStop(1, '#0f2f0f')
    } else if (words.includes('fantasy')) {
      gradient.addColorStop(0, '#2a1a4a')
      gradient.addColorStop(1, '#1a0f3a')
    } else {
      gradient.addColorStop(0, '#1a1a2e')
      gradient.addColorStop(1, '#16213e')
    }

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 28px serif'
    ctx.textAlign = 'center'
    ctx.fillText('Your Story', canvas.width / 2, 100)

    // Add author
    ctx.font = '18px serif'
    ctx.fillStyle = '#cccccc'
    ctx.fillText('by You', canvas.width / 2, canvas.height - 50)

    // Add decorative element based on content
    if (words.includes('heart')) {
      // Draw heart
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2, canvas.height / 2 + 20)
      ctx.bezierCurveTo(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 30, canvas.height / 2 - 20, canvas.width / 2 - 30, canvas.height / 2 - 10)
      ctx.bezierCurveTo(canvas.width / 2 - 30, canvas.height / 2 - 30, canvas.width / 2, canvas.height / 2 - 30, canvas.width / 2, canvas.height / 2)
      ctx.bezierCurveTo(canvas.width / 2, canvas.height / 2 - 30, canvas.width / 2 + 30, canvas.height / 2 - 30, canvas.width / 2 + 30, canvas.height / 2 - 10)
      ctx.bezierCurveTo(canvas.width / 2 + 30, canvas.height / 2 - 20, canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2 + 20)
      ctx.fillStyle = '#ff6b6b'
      ctx.fill()
    } else if (words.includes('star') || words.includes('magic')) {
      // Draw star
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2, canvas.height / 2 - 20)
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(canvas.width / 2 + Math.cos((i * 4 * Math.PI) / 5) * 20, canvas.height / 2 + Math.sin((i * 4 * Math.PI) / 5) * 20)
      }
      ctx.closePath()
      ctx.fillStyle = '#ffd700'
      ctx.fill()
    }

    return canvas.toDataURL('image/png')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Simulate file processing
      const reader = new FileReader()
      reader.onload = (e) => {
        setText((e.target?.result as string) || "")
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="soundwave" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
              <path d="M0,10 Q25,0 50,10 T100,10" stroke="currentColor" strokeWidth="1" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#soundwave)" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* User Profile Section */}
        <section className="py-8 px-4 border-b border-purple-500/20">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback className="bg-purple-600 text-white">
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-white font-semibold">Welcome back!</h3>
                <p className="text-purple-200 text-sm">Ready to create your next audiobook?</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-200 text-sm">Recently played stories:</span>
              <div className="flex -space-x-2">
                {publicDomainStories.slice(0, 3).map((story, index) => (
                  <StoryAvatar
                    key={story.id}
                    story={story}
                    size="sm"
                    className="border-2 border-slate-800"
                  />
                ))}
                <Avatar className="h-8 w-8 border-2 border-slate-800">
                  <AvatarFallback className="bg-purple-600 text-white text-xs">
                    +{publicDomainStories.length - 3}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="text-center py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 via-amber-300 to-purple-400 bg-clip-text text-transparent">
              EchoVerse
            </h1>
            <p className="text-xl md:text-2xl text-purple-200 mb-8 font-light">
              Every story, in every voice, for every listener
            </p>

            {/* Navigation Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-slate-800/50 rounded-lg p-1 border border-purple-500/20">
                <Button
                  variant={activeTab === 'generator' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('generator')}
                  className={`px-6 py-2 ${activeTab === 'generator' ? 'bg-purple-600 text-white' : 'text-purple-200 hover:text-white'}`}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Generator
                </Button>
                <Button
                  variant={activeTab === 'library' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('library')}
                  className={`px-6 py-2 ${activeTab === 'library' ? 'bg-purple-600 text-white' : 'text-purple-200 hover:text-white'}`}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Library
                </Button>
                <Button
                  variant={activeTab === 'playlists' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('playlists')}
                  className={`px-6 py-2 ${activeTab === 'playlists' ? 'bg-purple-600 text-white' : 'text-purple-200 hover:text-white'}`}
                >
                  <Music className="mr-2 h-4 w-4" />
                  Playlists
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Generator Section */}
        {activeTab === 'generator' && (
          <section id="generator" className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Mic className="h-6 w-6 text-amber-400" />
                  Create Your Audiobook
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Transform any text into an immersive audio experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Text Input */}
                <div className="space-y-2">
                  <Label htmlFor="text" className="text-white">
                    Your Story
                  </Label>
                  <Textarea
                    id="text"
                    placeholder="Paste your text here or upload a file..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-32 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300 focus:border-amber-400"
                  />
                </div>

                {/* File Upload */}
                <FileUpload onFileSelect={handleFileUpload} />

                {/* Voice Settings Grid */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Voice</Label>
                    <Select value={voice} onValueChange={setVoice}>
                      <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                        <SelectValue placeholder="Choose voice" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-500/30">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Tone (IBM Watsonx Granite LLM)</Label>
                    <Select value={tone} onValueChange={(value: ToneType) => setTone(value)}>
                      <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                        <SelectValue placeholder="Choose tone for rewriting" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-500/30">
                        <SelectItem value="neutral">⚖️ Neutral - Clear and balanced</SelectItem>
                        <SelectItem value="suspenseful">🔍 Suspenseful - Dramatic and mysterious</SelectItem>
                        <SelectItem value="inspiring">✨ Inspiring - Uplifting and motivational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Voice Emotion</Label>
                    <Select value={emotion} onValueChange={setEmotion}>
                      <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                        <SelectValue placeholder="Choose voice emotion" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-500/30">
                        <SelectItem value="calm">Calm</SelectItem>
                        <SelectItem value="dramatic">Dramatic</SelectItem>
                        <SelectItem value="energetic">Energetic</SelectItem>
                        <SelectItem value="sad">Sad</SelectItem>
                        <SelectItem value="happy">Happy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Background Ambience</Label>
                    <Select value={ambience} onValueChange={setAmbience}>
                      <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                        <SelectValue placeholder="Choose ambience" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-500/30">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="rain">Rain</SelectItem>
                        <SelectItem value="fireplace">Fireplace</SelectItem>
                        <SelectItem value="forest">Forest</SelectItem>
                        <SelectItem value="scifi">Sci-Fi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Ambience Volume */}
                {ambience && ambience !== "none" && (
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Ambience Volume: {ambienceVolume[0]}%
                    </Label>
                    <Slider
                      value={ambienceVolume}
                      onValueChange={setAmbienceVolume}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Rewrite Button */}
                <Button
                  onClick={handleRewriteText}
                  disabled={!text.trim() || isRewriting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 text-white py-3 text-lg font-semibold disabled:opacity-50 mb-4"
                >
                  {isRewriting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Rewriting with AI...
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-5 w-5" />
                      Rewrite Text with {tone.charAt(0).toUpperCase() + tone.slice(1)} Tone
                    </>
                  )}
                </Button>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!text.trim() || !voice || !emotion || isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white py-3 text-lg font-semibold disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating Audio...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Generate Audiobook
                    </>
                  )}
                </Button>

                {/* Text Comparison */}
                {(rewriteResult || isRewriting) && (
                  <div className="mt-6">
                    <TextComparison
                      rewriteResult={rewriteResult}
                      isLoading={isRewriting}
                    />
                  </div>
                )}

                {/* Use Rewritten Text Toggle */}
                {rewriteResult && (
                  <div className="mt-4 flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-purple-500/20">
                    <input
                      type="checkbox"
                      id="useRewritten"
                      checked={useRewrittenText}
                      onChange={(e) => setUseRewrittenText(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-slate-700 border-purple-500 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="useRewritten" className="text-white text-sm">
                      Use rewritten text for audiobook generation
                    </label>
                  </div>
                )}

                {/* Generated Image Display */}
                {(generatedImage || isGeneratingImage) && (
                  <div className="mt-6">
                    <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/20">
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-purple-400" />
                        {isGeneratingImage ? "Generating Story Image..." : "Generated Story Image"}
                      </h3>
                      {isGeneratingImage ? (
                        <div className="w-full max-w-md mx-auto h-64 bg-slate-600/50 rounded-lg border border-purple-500/30 flex items-center justify-center">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                            <p className="text-purple-300">Creating your story image...</p>
                          </div>
                        </div>
                      ) : generatedImage && (
                        <img
                          src={generatedImage}
                          alt="Generated story illustration"
                          className="w-full max-w-md mx-auto rounded-lg border border-purple-500/30"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Audio Player */}
                {audioUrl && (
                  <div className="mt-6">
                    <AudioPlayer
                      text={useRewrittenText && rewriteResult ? rewriteResult.rewrittenText : text}
                      voice={voice}
                      emotion={emotion}
                      ambience={ambience}
                      ambienceVolume={ambienceVolume[0]}
                    />
                  </div>
                )}


              </CardContent>
            </Card>
          </div>
        </section>
        )}

        {/* Library Section */}
        {activeTab === 'library' && (
          <section className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-white text-center mb-12">Featured Public Domain Stories</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {publicDomainStories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onPlay={handlePlayStory}
                    onSave={handleSaveStory}
                    onReadingMode={handleReadingMode}
                    onAddToPlaylist={handleAddToPlaylist}
                    isSaved={isStorySaved(story.id)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Playlists Section */}
        {activeTab === 'playlists' && (
          <section className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <PlaylistManager
                stories={publicDomainStories}
                playlists={playlists}
                savedStories={savedStories}
                pendingStory={pendingStoryForPlaylist}
                onPlayStory={handlePlayStory}
                onPlayPlaylist={handlePlayPlaylist}
                onSaveStory={handleSaveStory}
                onUnsaveStory={handleUnsaveStory}
                onCreatePlaylist={handleCreatePlaylist}
                onAddStoryToPlaylist={handleAddStoryToPlaylist}
                onRemoveStoryFromPlaylist={handleRemoveStoryFromPlaylist}
                onDeletePlaylist={handleDeletePlaylist}
                onClearPendingStory={() => setPendingStoryForPlaylist(null)}
              />
            </div>
          </section>
        )}

        {/* Story Modal */}
        <StoryModal
          story={currentStory}
          isOpen={isStoryModalOpen}
          onClose={handleCloseStoryModal}
        />

        {/* Reading Mode */}
        <ReadingMode
          story={readingModeStory}
          isOpen={isReadingModeOpen}
          onClose={handleCloseReadingMode}
        />
      </div>
    </div>
  )
}
