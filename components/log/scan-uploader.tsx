'use client'

import { useState, useRef } from 'react'
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface ScanUploaderProps {
  onFileSelect: (file: File) => void
}

export function ScanUploader({ onFileSelect }: ScanUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const validateAndSetFile = (selectedFile: File) => {
    setError(null)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a JPG, PNG, or WEBP image.')
      return
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.')
      return
    }

    setFile(selectedFile)
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreview(objectUrl)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (file) {
      onFileSelect(file)
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      {!file ? (
        <div
          className={cn(
            'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-12 text-center transition-colors',
            dragActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleChange}
          />
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <UploadCloud className="size-8 text-primary" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">Upload Document</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Drag and drop your receipt, utility bill, or invoice here, or click to browse.
          </p>
          <p className="text-xs text-muted-foreground">
            Supports JPG, PNG, WEBP up to 10MB
          </p>
          {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="relative aspect-video w-full bg-muted/30 flex items-center justify-center">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <Image src={preview} alt="Preview" fill className="object-contain" />
            ) : (
              <ImageIcon className="size-12 text-muted-foreground" />
            )}
            <button
              onClick={clearFile}
              className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex flex-col truncate">
              <span className="truncate text-sm font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <Button onClick={handleUpload}>
              Scan Document
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
