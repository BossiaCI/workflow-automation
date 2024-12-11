import { useState } from 'react'
import { UploadDropzone } from '@/lib/uploadthing'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface MediaUploaderProps {
  onUploadComplete: (urls: string[]) => void
  maxFiles?: number
}

export function MediaUploader({ onUploadComplete, maxFiles = 4 }: MediaUploaderProps) {
  const [files, setFiles] = useState<{ url: string; name: string }[]>([])

  const handleUploadComplete = (res: { url: string; name: string }[]) => {
    setFiles(prev => [...prev, ...res])
    onUploadComplete(res.map(file => file.url))
  }

  const handleRemove = (url: string) => {
    setFiles(prev => prev.filter(file => file.url !== url))
  }

  return (
    <div className="space-y-4">
      {files.length < maxFiles && (
        <UploadDropzone
          endpoint="mediaUploader"
          onClientUploadComplete={handleUploadComplete}
          onUploadError={(error: Error) => {
            console.error('Upload error:', error)
          }}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        {files.map((file) => (
          <div key={file.url} className="relative group">
            <img
              src={file.url}
              alt={file.name}
              className="w-full h-40 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemove(file.url)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}