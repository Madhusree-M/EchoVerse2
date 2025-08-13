"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <input ref={fileInputRef} type="file" accept=".txt,.docx,.pdf" onChange={onFileSelect} className="hidden" />
      <Button
        type="button"
        variant="outline"
        onClick={handleUploadClick}
        className="w-full border-purple-500/30 text-purple-200 hover:bg-purple-600/20 hover:text-white bg-transparent"
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload File (.txt, .docx, .pdf)
      </Button>
    </div>
  )
}
