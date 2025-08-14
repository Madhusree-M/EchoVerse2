"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { BookOpen, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Story {
  id: number
  title: string
  author: string
  text: string
  image?: string
}

interface StoryAvatarProps {
  story: Story
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  showTitle?: boolean
}

export function StoryAvatar({ 
  story, 
  size = "md", 
  className,
  showTitle = false 
}: StoryAvatarProps) {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16",
    xl: "h-20 w-20"
  }

  // Auto-generate avatar image when component mounts
  useEffect(() => {
    generateStoryAvatar()
  }, [story.id])

  const generateStoryAvatar = async () => {
    setIsGenerating(true)

    try {
      // First, try to use the default image if available
      if (story.image) {
        setGeneratedImage(story.image)
        setIsGenerating(false)
        return
      }

      // If no default image, generate procedural avatar as fallback
      const proceduralUrl = generateProceduralAvatar()
      setGeneratedImage(proceduralUrl)

      // Then try to enhance with AI generation
      const style = determineAvatarStyle(story.text, story.author)
      const prompt = `Book cover avatar for "${story.title}" by ${story.author}, ${style}, circular avatar, profile picture style, book cover design`

      // Try AI generation as enhancement
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=200&height=200&seed=${story.id}&nologo=true`

      // Test AI service with a timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

      try {
        const response = await fetch(pollinationsUrl, {
          method: 'HEAD',
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        if (response.ok) {
          // AI service is available, use AI generated image
          setGeneratedImage(pollinationsUrl)
        }
        // If not ok, keep the procedural image
      } catch (fetchError) {
        clearTimeout(timeoutId)
        // Keep the procedural image if AI fails
        console.log('AI generation failed, using procedural avatar')
      }
    } catch (error) {
      // Ensure we always have a procedural fallback
      const fallbackUrl = generateProceduralAvatar()
      setGeneratedImage(fallbackUrl)
    } finally {
      setIsGenerating(false)
    }
  }

  const determineAvatarStyle = (text: string, author: string) => {
    const words = text.toLowerCase()
    
    if (author.includes('Poe') || words.includes('horror') || words.includes('fear')) {
      return 'gothic, dark, mysterious, vintage book cover'
    }
    if (words.includes('christmas') || words.includes('gift')) {
      return 'festive, warm, holiday themed, cozy'
    }
    if (words.includes('love') || words.includes('romance')) {
      return 'romantic, elegant, soft colors, beautiful'
    }
    if (words.includes('adventure') || words.includes('journey')) {
      return 'adventurous, epic, dynamic, exciting'
    }
    return 'classic literature, vintage, elegant, professional'
  }

  const generateProceduralAvatar = (): string => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.log('Canvas context not available')
        return ""
      }

      canvas.width = 200
      canvas.height = 200

      // Create circular gradient based on story theme
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = canvas.width / 2

      const gradient = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, radius)
      const words = story.text.toLowerCase()

      // Choose colors based on story content with more vibrant options
      if (words.includes('horror') || words.includes('fear') || words.includes('mad') || story.author.includes('Poe')) {
        gradient.addColorStop(0, '#8b0000') // Dark red
        gradient.addColorStop(0.7, '#4a0000')
        gradient.addColorStop(1, '#000000')
      } else if (words.includes('christmas') || words.includes('gift') || words.includes('holiday')) {
        gradient.addColorStop(0, '#228b22') // Forest green
        gradient.addColorStop(0.7, '#006400')
        gradient.addColorStop(1, '#8b0000') // Christmas red
      } else if (words.includes('love') || words.includes('romance') || words.includes('heart')) {
        gradient.addColorStop(0, '#ff69b4') // Hot pink
        gradient.addColorStop(0.7, '#8b008b')
        gradient.addColorStop(1, '#4b0082') // Indigo
      } else if (words.includes('adventure') || words.includes('journey') || words.includes('quest')) {
        gradient.addColorStop(0, '#32cd32') // Lime green
        gradient.addColorStop(0.7, '#228b22')
        gradient.addColorStop(1, '#006400')
      } else if (words.includes('mystery') || words.includes('secret')) {
        gradient.addColorStop(0, '#4169e1') // Royal blue
        gradient.addColorStop(0.7, '#191970')
        gradient.addColorStop(1, '#000080')
      } else {
        // Default classic literature style
        gradient.addColorStop(0, '#9370db') // Medium purple
        gradient.addColorStop(0.7, '#663399')
        gradient.addColorStop(1, '#2e1065')
      }

      // Fill circle
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.fill()

      // Add story initial or symbol
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = '#000000'
      ctx.shadowBlur = 2
      ctx.font = 'bold 64px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Use first letter of title or a thematic symbol
      let displayText = story.title.charAt(0).toUpperCase()

      // Add thematic symbols based on content
      if (words.includes('heart') || words.includes('love')) {
        displayText = '♥'
        ctx.font = 'bold 48px serif'
      } else if (words.includes('eye') || words.includes('eyes')) {
        displayText = '👁'
        ctx.font = 'bold 48px serif'
      } else if (words.includes('christmas') || words.includes('gift')) {
        displayText = '🎄'
        ctx.font = 'bold 48px serif'
      } else if (words.includes('star') || words.includes('magic')) {
        displayText = '⭐'
        ctx.font = 'bold 48px serif'
      } else if (words.includes('book') || words.includes('story')) {
        displayText = '📖'
        ctx.font = 'bold 48px serif'
      }

      ctx.fillText(displayText, centerX, centerY)

      // Add subtle border with glow effect
      ctx.shadowColor = 'transparent'
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius - 2, 0, 2 * Math.PI)
      ctx.stroke()

      // Add inner highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius - 10, 0, 2 * Math.PI)
      ctx.stroke()

      const dataUrl = canvas.toDataURL('image/png')
      console.log('Generated procedural avatar for:', story.title)
      return dataUrl
    } catch (error) {
      console.error('Error generating procedural avatar:', error)
      return ""
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar className={cn(sizeClasses[size], "border-2 border-purple-500/30")}>
        {isGenerating ? (
          <AvatarFallback className="bg-slate-600">
            <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
          </AvatarFallback>
        ) : generatedImage ? (
          <AvatarImage 
            src={generatedImage} 
            alt={`${story.title} avatar`}
            className="object-cover"
          />
        ) : (
          <AvatarFallback className="bg-purple-600 text-white">
            <BookOpen className="h-4 w-4" />
          </AvatarFallback>
        )}
      </Avatar>
      
      {showTitle && (
        <div className="min-w-0 flex-1">
          <p className="text-white font-medium text-sm truncate">{story.title}</p>
          <p className="text-purple-300 text-xs truncate">by {story.author}</p>
        </div>
      )}
    </div>
  )
}
