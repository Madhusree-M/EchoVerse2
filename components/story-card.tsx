"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Play, Clock, User, Heart, BookOpen, MoreVertical, Plus } from "lucide-react"
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
        <Image
          src={story.image || "/placeholder.svg"}
          alt={story.title}
          width={300}
          height={200}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white text-sm bg-black/50 rounded-full px-2 py-1">
          <Clock className="h-3 w-3" />
          {story.duration}
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg line-clamp-1">{story.title}</CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${story.author}`} alt={story.author} />
            <AvatarFallback className="bg-amber-500 text-white text-xs">
              {story.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
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
