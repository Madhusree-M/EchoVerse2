"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { StoryAvatar } from "@/components/story-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Play, Clock, User, Heart, BookOpen, MoreVertical, Plus, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface Story {
  id: number
  title: string
  author: string
  description: string
  duration: string
  image: string
  text: string
}

interface StoryCardProps {
  story: Story
  onPlay?: (story: Story) => void
  onSave?: (story: Story) => void
  onReadingMode?: (story: Story) => void
  onAddToPlaylist?: (story: Story) => void
  isSaved?: boolean
}

export function StoryCard({
  story,
  onPlay,
  onSave,
  onReadingMode,
  onAddToPlaylist,
  isSaved = false
}: StoryCardProps) {
  const [storyImage, setStoryImage] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  // Auto-generate image when component mounts
  useEffect(() => {
    generateStoryImage()
  }, [story.id])

  const generateStoryImage = async () => {
    // First, check if story has a default image
    if (story.image) {
      setStoryImage(story.image)
      return
    }

    setIsGeneratingImage(true)

    try {
      // Quick analysis for card images
      const style = determineQuickStyle(story.text, story.author)
      const prompt = `Book cover for "${story.title}" by ${story.author}, ${style} style, professional book cover`

      // Try AI generation
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=300&height=400&seed=${story.id}`

      // Test if service is available
      const response = await fetch(pollinationsUrl, { method: 'HEAD' })
      if (response.ok) {
        setStoryImage(pollinationsUrl)
      } else {
        // Fallback to procedural
        const fallbackUrl = generateQuickProceduralImage()
        setStoryImage(fallbackUrl)
      }
    } catch (error) {
      // Fallback to procedural
      const fallbackUrl = generateQuickProceduralImage()
      setStoryImage(fallbackUrl)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const determineQuickStyle = (text: string, author: string) => {
    const words = text.toLowerCase()

    if (author.includes('Poe') || words.includes('horror') || words.includes('fear')) {
      return 'gothic, dark, mysterious'
    }
    if (words.includes('christmas') || words.includes('gift')) {
      return 'warm, festive, cozy'
    }
    if (words.includes('love') || words.includes('romance')) {
      return 'romantic, soft, elegant'
    }
    return 'classic literature, vintage'
  }

  const generateQuickProceduralImage = (): string => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ""

    canvas.width = 300
    canvas.height = 400

    // Simple gradient based on story
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    const words = story.text.toLowerCase()

    if (words.includes('horror') || words.includes('fear')) {
      gradient.addColorStop(0, '#1a0000')
      gradient.addColorStop(1, '#000000')
    } else if (words.includes('christmas')) {
      gradient.addColorStop(0, '#0f4c3a')
      gradient.addColorStop(1, '#8b0000')
    } else if (words.includes('love')) {
      gradient.addColorStop(0, '#4a1a4a')
      gradient.addColorStop(1, '#6a2c70')
    } else {
      gradient.addColorStop(0, '#1a1a2e')
      gradient.addColorStop(1, '#16213e')
    }

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add simple title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 18px serif'
    ctx.textAlign = 'center'
    ctx.fillText(story.title.substring(0, 20), canvas.width / 2, 60)

    // Add author
    ctx.font = '12px serif'
    ctx.fillStyle = '#cccccc'
    ctx.fillText(story.author, canvas.width / 2, canvas.height - 30)

    return canvas.toDataURL('image/png')
  }

  const handleListenNow = () => {
    if (onPlay) {
      onPlay(story)
    } else {
      console.log(`Playing: ${story.title}`)
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave(story)
    }
  }

  const handleReadingMode = () => {
    if (onReadingMode) {
      onReadingMode(story)
    }
  }

  const handleAddToPlaylist = () => {
    if (onAddToPlaylist) {
      onAddToPlaylist(story)
    }
  }

  return (
    <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 group">
      <div className="relative overflow-hidden rounded-t-lg">
        {isGeneratingImage ? (
          <div className="w-full h-48 bg-slate-600/50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
              <p className="text-purple-300 text-xs">Generating image...</p>
            </div>
          </div>
        ) : storyImage ? (
          <img
            src={storyImage}
            alt={story.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-slate-600/50 flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-purple-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white text-sm bg-black/50 rounded-full px-2 py-1">
          <Clock className="h-3 w-3" />
          {story.duration}
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg line-clamp-1">{story.title}</CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <StoryAvatar
            story={story}
            size="sm"
          />
          <CardDescription className="text-purple-300 text-sm">by {story.author}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-purple-200 text-sm mb-4 line-clamp-2">{story.description}</p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-400" />
            <span className="text-purple-200 text-sm">{story.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              size="sm"
              variant="ghost"
              className={`h-8 w-8 p-0 ${isSaved ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-red-400'}`}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-purple-500/20">
                <DropdownMenuItem onClick={handleReadingMode} className="text-white hover:bg-purple-600/20">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Reading Mode
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAddToPlaylist} className="text-white hover:bg-purple-600/20">
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Playlist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Button
          onClick={handleListenNow}
          className="w-full bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white"
        >
          <Play className="mr-2 h-4 w-4" />
          Listen Now
        </Button>
      </CardContent>
    </Card>
  )
}
