"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Plus, 
  BookOpen, 
  Heart, 
  Moon, 
  Plane, 
  GraduationCap, 
  Music,
  Trash2,
  Play,
  Clock
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

interface Playlist {
  id: string
  name: string
  description: string
  icon: string
  stories: Story[]
  createdAt: Date
}

interface PlaylistManagerProps {
  stories: Story[]
  onPlayStory: (story: Story) => void
}

const defaultPlaylists: Playlist[] = [
  {
    id: "bedtime",
    name: "Bedtime Stories",
    description: "Calm and soothing stories for peaceful sleep",
    icon: "moon",
    stories: [],
    createdAt: new Date()
  },
  {
    id: "travel",
    name: "Travel Companions",
    description: "Perfect stories for your journeys",
    icon: "plane",
    stories: [],
    createdAt: new Date()
  },
  {
    id: "study",
    name: "Study Break",
    description: "Short stories for study breaks",
    icon: "graduation-cap",
    stories: [],
    createdAt: new Date()
  }
]

const playlistIcons = {
  moon: Moon,
  plane: Plane,
  "graduation-cap": GraduationCap,
  heart: Heart,
  music: Music,
  book: BookOpen
}

export function PlaylistManager({ stories, onPlayStory }: PlaylistManagerProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>(defaultPlaylists)
  const [savedStories, setSavedStories] = useState<Story[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("")
  const [newPlaylistIcon, setNewPlaylistIcon] = useState("book")

  // Load saved data from localStorage
  useEffect(() => {
    const savedPlaylistsData = localStorage.getItem("echoverse-playlists")
    const savedStoriesData = localStorage.getItem("echoverse-saved-stories")
    
    if (savedPlaylistsData) {
      try {
        const parsedPlaylists = JSON.parse(savedPlaylistsData)
        setPlaylists(parsedPlaylists)
      } catch (error) {
        console.error("Error loading playlists:", error)
      }
    }
    
    if (savedStoriesData) {
      try {
        const parsedStories = JSON.parse(savedStoriesData)
        setSavedStories(parsedStories)
      } catch (error) {
        console.error("Error loading saved stories:", error)
      }
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("echoverse-playlists", JSON.stringify(playlists))
  }, [playlists])

  useEffect(() => {
    localStorage.setItem("echoverse-saved-stories", JSON.stringify(savedStories))
  }, [savedStories])

  const saveStory = (story: Story) => {
    if (!savedStories.find(s => s.id === story.id)) {
      setSavedStories([...savedStories, story])
    }
  }

  const unsaveStory = (storyId: number) => {
    setSavedStories(savedStories.filter(s => s.id !== storyId))
    // Also remove from all playlists
    setPlaylists(playlists.map(playlist => ({
      ...playlist,
      stories: playlist.stories.filter(s => s.id !== storyId)
    })))
  }

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName,
      description: newPlaylistDescription,
      icon: newPlaylistIcon,
      stories: [],
      createdAt: new Date()
    }

    setPlaylists([...playlists, newPlaylist])
    setNewPlaylistName("")
    setNewPlaylistDescription("")
    setNewPlaylistIcon("book")
    setIsCreateDialogOpen(false)
  }

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter(p => p.id !== playlistId))
  }

  const addStoryToPlaylist = (story: Story, playlistId: string) => {
    setPlaylists(playlists.map(playlist => {
      if (playlist.id === playlistId) {
        if (!playlist.stories.find(s => s.id === story.id)) {
          return {
            ...playlist,
            stories: [...playlist.stories, story]
          }
        }
      }
      return playlist
    }))
  }

  const removeStoryFromPlaylist = (storyId: number, playlistId: string) => {
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

  const isStorySaved = (storyId: number) => {
    return savedStories.some(s => s.id === storyId)
  }

  const getPlaylistIcon = (iconName: string) => {
    const IconComponent = playlistIcons[iconName as keyof typeof playlistIcons] || BookOpen
    return IconComponent
  }

  return (
    <div className="space-y-6">
      {/* Saved Stories Section */}
      <section className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-400" />
            Saved Stories ({savedStories.length})
          </h2>
        </div>
        
        {savedStories.length === 0 ? (
          <p className="text-purple-200 text-center py-8">
            No saved stories yet. Save stories to access them quickly!
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedStories.map((story) => (
              <Card key={story.id} className="bg-slate-700/50 border-purple-500/20 hover:bg-slate-700/70 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm line-clamp-1">{story.title}</CardTitle>
                  <CardDescription className="text-purple-300 text-xs">by {story.author}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-purple-400" />
                      <span className="text-purple-200 text-xs">{story.duration}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onPlayStory(story)}
                        className="h-8 w-8 p-0 text-green-400 hover:text-green-300"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => unsaveStory(story.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Playlists Section */}
      <section className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Music className="h-6 w-6 text-purple-400" />
            My Playlists ({playlists.length})
          </h2>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Playlist
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-purple-500/20">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Playlist</DialogTitle>
                <DialogDescription className="text-purple-200">
                  Organize your favorite stories into custom playlists
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="playlist-name" className="text-white">Playlist Name</Label>
                  <Input
                    id="playlist-name"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="e.g., My Favorites"
                    className="bg-slate-700 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="playlist-description" className="text-white">Description</Label>
                  <Input
                    id="playlist-description"
                    value={newPlaylistDescription}
                    onChange={(e) => setNewPlaylistDescription(e.target.value)}
                    placeholder="Brief description of your playlist"
                    className="bg-slate-700 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="playlist-icon" className="text-white">Icon</Label>
                  <Select value={newPlaylistIcon} onValueChange={setNewPlaylistIcon}>
                    <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-purple-500/30">
                      <SelectItem value="book">📚 Book</SelectItem>
                      <SelectItem value="heart">❤️ Heart</SelectItem>
                      <SelectItem value="moon">🌙 Moon</SelectItem>
                      <SelectItem value="plane">✈️ Plane</SelectItem>
                      <SelectItem value="graduation-cap">🎓 Study</SelectItem>
                      <SelectItem value="music">🎵 Music</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createPlaylist} className="w-full bg-purple-600 hover:bg-purple-700">
                  Create Playlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => {
            const IconComponent = getPlaylistIcon(playlist.icon)
            return (
              <Card key={playlist.id} className="bg-slate-700/50 border-purple-500/20 hover:bg-slate-700/70 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-purple-400" />
                      <CardTitle className="text-white text-lg">{playlist.name}</CardTitle>
                    </div>
                    {!["bedtime", "travel", "study"].includes(playlist.id) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deletePlaylist(playlist.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <CardDescription className="text-purple-300">{playlist.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-200">{playlist.stories.length} stories</span>
                      <span className="text-purple-400">
                        {playlist.stories.reduce((total, story) => {
                          const minutes = parseInt(story.duration.split(' ')[0])
                          return total + minutes
                        }, 0)} min total
                      </span>
                    </div>
                    
                    {playlist.stories.length > 0 && (
                      <div className="flex -space-x-1">
                        {playlist.stories.slice(0, 3).map((story, index) => (
                          <Avatar key={story.id} className="h-6 w-6 border border-slate-600">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${story.author}`} />
                            <AvatarFallback className="bg-purple-600 text-white text-xs">
                              {story.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {playlist.stories.length > 3 && (
                          <div className="h-6 w-6 rounded-full bg-slate-600 border border-slate-500 flex items-center justify-center text-xs text-purple-200">
                            +{playlist.stories.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
