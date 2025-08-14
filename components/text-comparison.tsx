"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download, Eye, EyeOff, FileText, Mic } from "lucide-react"
import { RewriteResult, ToneType } from "@/lib/text-rewriter"

interface TextComparisonProps {
  rewriteResult: RewriteResult | null
  isLoading?: boolean
}

export function TextComparison({ rewriteResult, isLoading }: TextComparisonProps) {
  const [activeView, setActiveView] = useState<'split' | 'original' | 'rewritten'>('split')

  if (isLoading) {
    return (
      <Card className="bg-slate-700/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mic className="h-5 w-5 text-purple-400 animate-pulse" />
            Rewriting Text with AI...
          </CardTitle>
          <CardDescription className="text-purple-300">
            Using IBM Watsonx Granite LLM for tone-specific rewriting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-600 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-slate-600 rounded w-5/6"></div>
            </div>
            <div className="text-center text-purple-300 text-sm">
              Applying prompt chaining for faithful tone transformation...
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!rewriteResult) {
    return null
  }

  const getToneBadgeColor = (tone: ToneType) => {
    switch (tone) {
      case 'neutral': return 'bg-blue-600'
      case 'suspenseful': return 'bg-red-600'
      case 'inspiring': return 'bg-green-600'
      default: return 'bg-gray-600'
    }
  }

  const getToneIcon = (tone: ToneType) => {
    switch (tone) {
      case 'neutral': return '⚖️'
      case 'suspenseful': return '🔍'
      case 'inspiring': return '✨'
      default: return '📝'
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
    console.log(`${type} text copied to clipboard`)
  }

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="bg-slate-700/50 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Mic className="h-5 w-5 text-purple-400" />
              AI Text Rewriting Complete
            </CardTitle>
            <CardDescription className="text-purple-300">
              Rewritten with {getToneIcon(rewriteResult.tone)} {rewriteResult.tone} tone using IBM Watsonx Granite LLM
            </CardDescription>
          </div>
          <Badge className={`${getToneBadgeColor(rewriteResult.tone)} text-white`}>
            {rewriteResult.tone.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* View Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={activeView === 'split' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('split')}
            className="text-white"
          >
            <Eye className="h-4 w-4 mr-1" />
            Split View
          </Button>
          <Button
            variant={activeView === 'original' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('original')}
            className="text-white"
          >
            <FileText className="h-4 w-4 mr-1" />
            Original
          </Button>
          <Button
            variant={activeView === 'rewritten' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('rewritten')}
            className="text-white"
          >
            <Mic className="h-4 w-4 mr-1" />
            Rewritten
          </Button>
        </div>

        {/* Content Display */}
        {activeView === 'split' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">Original Text</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(rewriteResult.originalText, 'Original')}
                    className="text-purple-300 hover:text-white"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadText(rewriteResult.originalText, 'original-text.txt')}
                    className="text-purple-300 hover:text-white"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded p-3 text-purple-200 text-sm max-h-64 overflow-y-auto">
                {rewriteResult.originalText}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">
                  {getToneIcon(rewriteResult.tone)} {rewriteResult.tone.charAt(0).toUpperCase() + rewriteResult.tone.slice(1)} Version
                </h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(rewriteResult.rewrittenText, 'Rewritten')}
                    className="text-purple-300 hover:text-white"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadText(rewriteResult.rewrittenText, `${rewriteResult.tone}-text.txt`)}
                    className="text-purple-300 hover:text-white"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded p-3 text-purple-200 text-sm max-h-64 overflow-y-auto border-l-4 border-purple-500">
                {rewriteResult.rewrittenText}
              </div>
            </div>
          </div>
        )}

        {activeView === 'original' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Original Text</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(rewriteResult.originalText, 'Original')}
                  className="text-purple-300 hover:text-white"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadText(rewriteResult.originalText, 'original-text.txt')}
                  className="text-purple-300 hover:text-white"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded p-4 text-purple-200">
              {rewriteResult.originalText}
            </div>
          </div>
        )}

        {activeView === 'rewritten' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">
                {getToneIcon(rewriteResult.tone)} {rewriteResult.tone.charAt(0).toUpperCase() + rewriteResult.tone.slice(1)} Version
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(rewriteResult.rewrittenText, 'Rewritten')}
                  className="text-purple-300 hover:text-white"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadText(rewriteResult.rewrittenText, `${rewriteResult.tone}-text.txt`)}
                  className="text-purple-300 hover:text-white"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded p-4 text-purple-200 border-l-4 border-purple-500">
              {rewriteResult.rewrittenText}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-4 pt-4 border-t border-slate-600">
          <div className="flex items-center justify-between text-xs text-purple-300">
            <span>Processed: {new Date(rewriteResult.timestamp).toLocaleString()}</span>
            <span>Words: {rewriteResult.originalText.split(' ').length} → {rewriteResult.rewrittenText.split(' ').length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
