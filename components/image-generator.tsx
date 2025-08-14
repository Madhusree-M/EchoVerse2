"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Image as ImageIcon, Wand2, RefreshCw, Download } from "lucide-react"

interface ImageGeneratorProps {
  storyTitle: string
  storyText: string
  author: string
  genre?: string
  onImageGenerated?: (imageUrl: string) => void
}

interface GeneratedImage {
  url: string
  prompt: string
  style: string
  timestamp: number
}

export function ImageGenerator({ 
  storyTitle, 
  storyText, 
  author, 
  genre,
  onImageGenerated 
}: ImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [selectedStyle, setSelectedStyle] = useState("realistic")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const imageStyles = [
    { id: "realistic", name: "Realistic", description: "Photorealistic style" },
    { id: "artistic", name: "Artistic", description: "Painted artwork style" },
    { id: "vintage", name: "Vintage", description: "Classic book cover style" },
    { id: "minimalist", name: "Minimalist", description: "Simple, clean design" },
    { id: "gothic", name: "Gothic", description: "Dark, atmospheric style" },
    { id: "watercolor", name: "Watercolor", description: "Soft watercolor painting" }
  ]

  // Extract key themes and elements from story text
  const extractStoryElements = (text: string, title: string) => {
    const words = text.toLowerCase()
    const elements = []

    // Character types
    if (words.includes('old man') || words.includes('elderly')) elements.push('elderly character')
    if (words.includes('woman') || words.includes('lady')) elements.push('woman')
    if (words.includes('child') || words.includes('boy') || words.includes('girl')) elements.push('child')

    // Settings
    if (words.includes('house') || words.includes('home') || words.includes('room')) elements.push('interior scene')
    if (words.includes('forest') || words.includes('trees') || words.includes('woods')) elements.push('forest')
    if (words.includes('city') || words.includes('street') || words.includes('town')) elements.push('urban setting')
    if (words.includes('night') || words.includes('dark') || words.includes('shadow')) elements.push('nighttime')
    if (words.includes('winter') || words.includes('snow') || words.includes('cold')) elements.push('winter scene')

    // Mood/atmosphere
    if (words.includes('horror') || words.includes('fear') || words.includes('terror')) elements.push('horror atmosphere')
    if (words.includes('love') || words.includes('romance') || words.includes('heart')) elements.push('romantic mood')
    if (words.includes('mystery') || words.includes('secret') || words.includes('hidden')) elements.push('mysterious atmosphere')
    if (words.includes('christmas') || words.includes('holiday') || words.includes('gift')) elements.push('holiday theme')

    // Objects
    if (words.includes('eye') || words.includes('eyes')) elements.push('prominent eyes')
    if (words.includes('fire') || words.includes('flame') || words.includes('fireplace')) elements.push('fire')
    if (words.includes('book') || words.includes('letter') || words.includes('writing')) elements.push('books or writing')

    return elements.slice(0, 5) // Limit to top 5 elements
  }

  // Generate image prompt based on story content
  const generatePrompt = (style: string) => {
    const elements = extractStoryElements(storyText, storyTitle)
    const basePrompt = `Book cover illustration for "${storyTitle}" by ${author}`
    
    let stylePrompt = ""
    switch (style) {
      case "realistic":
        stylePrompt = "photorealistic, detailed, high quality"
        break
      case "artistic":
        stylePrompt = "artistic painting, brushstrokes, fine art"
        break
      case "vintage":
        stylePrompt = "vintage book cover, classic literature style, aged paper texture"
        break
      case "minimalist":
        stylePrompt = "minimalist design, simple composition, clean lines"
        break
      case "gothic":
        stylePrompt = "gothic style, dark atmosphere, dramatic lighting"
        break
      case "watercolor":
        stylePrompt = "watercolor painting, soft colors, artistic"
        break
    }

    const elementsText = elements.length > 0 ? `, featuring ${elements.join(', ')}` : ""
    return `${basePrompt}${elementsText}, ${stylePrompt}, professional book cover design`
  }

  // Generate procedural image using Canvas API
  const generateProceduralImage = (prompt: string, style: string): string => {
    const canvas = canvasRef.current
    if (!canvas) return ""

    const ctx = canvas.getContext('2d')
    if (!ctx) return ""

    // Set canvas size
    canvas.width = 400
    canvas.height = 600

    // Create gradient background based on story theme
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    
    // Choose colors based on story content and style
    const storyWords = storyText.toLowerCase()
    let colors = ['#1a1a2e', '#16213e'] // Default dark theme

    if (storyWords.includes('christmas') || storyWords.includes('gift')) {
      colors = ['#0f4c3a', '#2d5a27', '#8b0000'] // Christmas colors
    } else if (storyWords.includes('horror') || storyWords.includes('fear')) {
      colors = ['#000000', '#1a0000', '#330000'] // Horror colors
    } else if (storyWords.includes('love') || storyWords.includes('romance')) {
      colors = ['#4a1a4a', '#6a2c70', '#b83dba'] // Romantic colors
    } else if (storyWords.includes('mystery') || storyWords.includes('secret')) {
      colors = ['#0f0f23', '#1a1a3a', '#2e2e5a'] // Mystery colors
    }

    // Apply gradient
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color)
    })
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Wrap title text
    const words = storyTitle.split(' ')
    const lines = []
    let currentLine = words[0]
    
    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i]
      const metrics = ctx.measureText(testLine)
      if (metrics.width > canvas.width - 40) {
        lines.push(currentLine)
        currentLine = words[i]
      } else {
        currentLine = testLine
      }
    }
    lines.push(currentLine)

    // Draw title lines
    const startY = 100
    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, startY + (index * 30))
    })

    // Add author
    ctx.font = '16px serif'
    ctx.fillStyle = '#cccccc'
    ctx.fillText(`by ${author}`, canvas.width / 2, canvas.height - 50)

    // Add decorative elements based on story content
    if (storyWords.includes('eye') || storyWords.includes('eyes')) {
      // Draw an eye
      ctx.beginPath()
      ctx.ellipse(canvas.width / 2, canvas.height / 2, 60, 30, 0, 0, 2 * Math.PI)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, 20, 0, 2 * Math.PI)
      ctx.fillStyle = '#000000'
      ctx.fill()
    } else if (storyWords.includes('heart')) {
      // Draw a heart shape
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2, canvas.height / 2 + 20)
      ctx.bezierCurveTo(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 30, canvas.height / 2 - 20, canvas.width / 2 - 30, canvas.height / 2 - 10)
      ctx.bezierCurveTo(canvas.width / 2 - 30, canvas.height / 2 - 30, canvas.width / 2, canvas.height / 2 - 30, canvas.width / 2, canvas.height / 2)
      ctx.bezierCurveTo(canvas.width / 2, canvas.height / 2 - 30, canvas.width / 2 + 30, canvas.height / 2 - 30, canvas.width / 2 + 30, canvas.height / 2 - 10)
      ctx.bezierCurveTo(canvas.width / 2 + 30, canvas.height / 2 - 20, canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2 + 20)
      ctx.fillStyle = '#ff6b6b'
      ctx.fill()
    }

    // Add texture overlay
    ctx.globalAlpha = 0.1
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000'
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1)
    }
    ctx.globalAlpha = 1

    return canvas.toDataURL('image/png')
  }

  // Try to generate image using AI service (fallback to procedural)
  const generateAIImage = async (prompt: string, style: string): Promise<string> => {
    try {
      // Try Pollinations AI (free service)
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=600&seed=${Date.now()}`
      
      // Test if the service is available
      const response = await fetch(pollinationsUrl, { method: 'HEAD' })
      if (response.ok) {
        return pollinationsUrl
      }
    } catch (error) {
      console.log('AI service unavailable, using procedural generation')
    }

    // Fallback to procedural generation
    return generateProceduralImage(prompt, style)
  }

  const handleGenerateImage = async () => {
    setIsGenerating(true)
    
    try {
      const prompt = generatePrompt(selectedStyle)
      const imageUrl = await generateAIImage(prompt, selectedStyle)
      
      const newImage: GeneratedImage = {
        url: imageUrl,
        prompt,
        style: selectedStyle,
        timestamp: Date.now()
      }
      
      setGeneratedImages(prev => [newImage, ...prev.slice(0, 4)]) // Keep last 5 images
      
      if (onImageGenerated) {
        onImageGenerated(imageUrl)
      }
    } catch (error) {
      console.error('Image generation failed:', error)
      // Generate procedural fallback
      const prompt = generatePrompt(selectedStyle)
      const fallbackUrl = generateProceduralImage(prompt, selectedStyle)
      
      const newImage: GeneratedImage = {
        url: fallbackUrl,
        prompt,
        style: selectedStyle,
        timestamp: Date.now()
      }
      
      setGeneratedImages(prev => [newImage, ...prev.slice(0, 4)])
      
      if (onImageGenerated) {
        onImageGenerated(fallbackUrl)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`
    link.click()
  }

  return (
    <Card className="bg-slate-800/50 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-purple-400" />
          Story Image Generator
        </CardTitle>
        <CardDescription className="text-purple-200">
          Generate custom images for "{storyTitle}" by {author}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Style Selection */}
        <div className="space-y-2">
          <label className="text-white font-medium">Art Style:</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {imageStyles.map((style) => (
              <Button
                key={style.id}
                variant={selectedStyle === style.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStyle(style.id)}
                className={`text-xs ${
                  selectedStyle === style.id 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-700 text-purple-200 border-purple-500/30 hover:bg-purple-600/20'
                }`}
              >
                {style.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateImage}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Image...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Story Image
            </>
          )}
        </Button>

        {/* Generated Images */}
        {generatedImages.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-white font-medium">Generated Images:</h3>
            <div className="grid grid-cols-2 gap-3">
              {generatedImages.map((image, index) => (
                <div key={image.timestamp} className="relative group">
                  <img
                    src={image.url}
                    alt={`Generated image for ${storyTitle}`}
                    className="w-full h-32 object-cover rounded-lg border border-purple-500/30"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onImageGenerated?.(image.url)}
                      className="text-white hover:bg-purple-600/20"
                    >
                      Use
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadImage(image.url, storyTitle)}
                      className="text-white hover:bg-purple-600/20"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                    {image.style}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hidden canvas for procedural generation */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </CardContent>
    </Card>
  )
}
