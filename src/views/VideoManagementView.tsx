"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  VideoIcon, 
  UploadIcon, 
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  PlayIcon,
  PauseIcon
} from 'lucide-react'
import { useStore } from '@/src/services/clientStore'
import { useToast } from '@/hooks/use-toast'

export default function VideoManagementView() {
  const store = useStore()
  const { toast } = useToast()
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('')
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Fetch venue settings on mount
  useEffect(() => {
    fetchVenueSettings()
  }, [])

  const fetchVenueSettings = async () => {
    try {
      const response = await fetch('/api/venue-settings')
      if (response.ok) {
        const data = await response.json()
        if (data.videoUrl) {
          setCurrentVideoUrl(data.videoUrl)
        }
      }
    } catch (error) {
      console.error('Error fetching venue settings:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileSelect called')
    const file = e.target.files?.[0]
    if (!file) {
      console.log('No file selected')
      return
    }

    console.log('File selected:', file.name, file.type, file.size)

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg']
    if (!validTypes.includes(file.type)) {
      console.log('Invalid file type:', file.type)
      toast({
        title: "Invalid file type",
        description: "Please select a valid video file (MP4, WebM, or OGG)",
        variant: "destructive"
      })
      return
    }

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024 // 100MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "File size exceeds 100MB limit",
        variant: "destructive"
      })
      return
    }

    // Create preview URL
    const url = URL.createObjectURL(file)
    console.log('Preview URL created:', url)
    setPreviewUrl(url)
    setUploadedFile(file)
    setUploadStatus('idle')
  }

  const handleUpload = async () => {
    if (!uploadedFile || !previewUrl) return

    setUploadStatus('uploading')

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('video', uploadedFile)
      
      const response = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentVideoUrl(data.videoUrl)
        setUploadStatus('success')
        
        toast({
          title: "Success!",
          description: "Video uploaded successfully and saved to database",
          variant: "default"
        })
        
        // Clear preview after successful upload
        setTimeout(() => {
          setPreviewUrl(null)
          setUploadedFile(null)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
          setUploadStatus('idle')
        }, 2000)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading video:', error)
      setUploadStatus('error')
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload video. Please try again.",
        variant: "destructive"
      })
      setTimeout(() => setUploadStatus('idle'), 3000)
    }
  }

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setUploadedFile(null)
    setUploadStatus('idle')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const getStatusAlert = () => {
    switch (uploadStatus) {
      case 'uploading':
        return (
          <Alert>
            <AlertCircleIcon className="h-4 w-4 animate-spin" />
            <AlertDescription>Uploading video...</AlertDescription>
          </Alert>
        )
      case 'success':
        return (
          <Alert className="border-green-500 bg-green-50 shadow-lg">
            <CheckCircleIcon className="h-5 w-5 text-green-600 animate-pulse" />
            <AlertDescription className="text-green-800 font-semibold text-base">
              Video uploaded successfully! Your video is now live on the main page.
            </AlertDescription>
          </Alert>
        )
      case 'error':
        return (
          <Alert className="border-red-200 bg-red-50">
            <XCircleIcon className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Please select a valid video file (MP4, WebM, or OGG)
            </AlertDescription>
          </Alert>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Video */}
      <Card>
        <CardHeader>
          <CardTitle>Current Homepage Video</CardTitle>
          <CardDescription>
            This video is displayed on the main booking page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentVideoUrl ? (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  key={currentVideoUrl}
                  ref={videoRef}
                  src={currentVideoUrl}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-6 w-6" />
                    ) : (
                      <PlayIcon className="h-6 w-6" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <VideoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No video uploaded</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload New Video */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Video</CardTitle>
          <CardDescription>
            Replace the current homepage video with a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getStatusAlert()}

            <div className="space-y-2">
              <Label>Select Video File</Label>
              
              {/* Simplest possible file input */}
              <input
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              />
              
              <p className="text-xs text-muted-foreground">
                Supported formats: MP4, WebM, OGG (Max 100MB)
              </p>
            </div>

            {previewUrl && (
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={previewUrl}
                    className="w-full h-full object-cover"
                    controls
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleUpload} 
                    disabled={uploadStatus === 'uploading'}
                    className="flex-1"
                  >
                    <UploadIcon className="h-4 w-4 mr-2" />
                    {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Video'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={uploadStatus === 'uploading'}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Video Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Recommended resolution: 1920x1080 (16:9 aspect ratio)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Keep file size under 100MB for optimal loading times</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Use high-quality footage that showcases your venue</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Ensure good lighting and stable camera work</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Consider adding soft background music (video will autoplay muted)</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}