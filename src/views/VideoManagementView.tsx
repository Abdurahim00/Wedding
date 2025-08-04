"use client"

import { useState, useRef, useEffect } from 'react'
import { uploadVideoDirectly } from '@/src/lib/supabase-client-upload'
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
import { Skeleton } from '@/components/ui/skeleton'

export default function VideoManagementView() {
  const store = useStore()
  const { toast } = useToast()
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('')
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Fetch venue settings on mount
  useEffect(() => {
    fetchVenueSettings()
  }, [])

  const fetchVenueSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/venue-settings')
      if (response.ok) {
        const data = await response.json()
        if (data.videoUrl) {
          setCurrentVideoUrl(data.videoUrl)
        }
      }
    } catch (error) {
      console.error('Error fetching venue settings:', error)
    } finally {
      setIsLoading(false)
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
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv']
    if (!validTypes.includes(file.type)) {
      console.log('Invalid file type:', file.type)
      toast({
        title: "Ogiltig filtyp",
        description: "Välj en giltig videofil (MP4, WebM, OGG, MOV eller AVI)",
        variant: "destructive"
      })
      return
    }

    // Check file size (500MB limit with direct upload)
    const maxSize = 500 * 1024 * 1024 // 500MB in bytes
    if (file.size > maxSize) {
      const fileSizeMB = Math.round(file.size / (1024 * 1024))
      toast({
        title: "Filen är för stor",
        description: `Filstorleken (${fileSizeMB}MB) överskrider gränsen på 500MB. Komprimera videon eller välj en mindre fil.`,
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

    console.log('Starting direct upload to Supabase...')
    setUploadStatus('uploading')

    try {
      // Upload directly to Supabase (bypasses Vercel size limit)
      const videoUrl = await uploadVideoDirectly(uploadedFile)
      
      console.log('Upload successful:', videoUrl)
      setCurrentVideoUrl(videoUrl)
      setUploadStatus('success')
      
      toast({
        title: "Klart!",
        description: "Videon har laddats upp och sparats i databasen",
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
    } catch (error) {
      console.error('Error uploading video:', error)
      setUploadStatus('error')
      toast({
        title: "Uppladdning misslyckades",
        description: error instanceof Error ? error.message : "Misslyckades att ladda upp video. Försök igen.",
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
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircleIcon className="h-5 w-5 animate-spin text-blue-600" />
            <AlertDescription className="text-blue-800 font-medium">
              Laddar upp video... Detta kan ta några minuter för stora filer.
            </AlertDescription>
          </Alert>
        )
      case 'success':
        return (
          <Alert className="border-green-500 bg-green-50 shadow-lg">
            <CheckCircleIcon className="h-6 w-6 text-green-600 animate-pulse" />
            <AlertDescription className="text-green-800 font-semibold text-base">
              Videon har laddats upp! Din video visas nu på huvudsidan.
            </AlertDescription>
          </Alert>
        )
      case 'error':
        return (
          <Alert className="border-red-200 bg-red-50">
            <XCircleIcon className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              Uppladdning misslyckades. Kontrollera filformat och storlek.
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
          <CardTitle>Nuvarande startsidovideo</CardTitle>
          <CardDescription>
            Denna video visas på huvudbokningssidan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="aspect-video rounded-lg overflow-hidden">
                <Skeleton className="w-full h-full" />
              </div>
            ) : currentVideoUrl ? (
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
                    className="bg-white/90 hover:bg-white h-12 w-12 sm:h-14 sm:w-14 rounded-full"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                    ) : (
                      <PlayIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <VideoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Ingen video uppladdad</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload New Video */}
      <Card>
        <CardHeader>
          <CardTitle>Ladda upp ny video</CardTitle>
          <CardDescription>
            Ersätt den nuvarande startsidovideon med en ny
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getStatusAlert()}

            <div className="space-y-3">
              <Label className="text-base font-medium">Välj videofil</Label>
              
              {/* Mobile-friendly file input */}
              <div className="relative">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleFileSelect}
                  className="block w-full text-base text-gray-900 border-2 border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 focus:outline-none focus:border-purple-500 transition-colors file:mr-4 file:py-3 file:px-4 file:rounded-l-md file:border-0 file:text-base file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Format som stöds:</strong> MP4, WebM, OGG, MOV
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Max filstorlek:</strong> 500MB
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Rekommenderad upplösning:</strong> 1920x1080 (16:9)
                </p>
              </div>
            </div>

            {previewUrl && (
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={previewUrl}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleUpload} 
                    disabled={uploadStatus === 'uploading'}
                    className="flex-1 py-4 text-base font-medium"
                  >
                    <UploadIcon className="h-5 w-5 mr-2" />
                    {uploadStatus === 'uploading' ? 'Laddar upp...' : 'Ladda upp video'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={uploadStatus === 'uploading'}
                    className="py-4 text-base font-medium"
                  >
                    Avbryt
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
          <CardTitle>Videoriktlinjer</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Rekommenderad upplösning: 1920x1080 (16:9 bildformat)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Håll filstorleken under 500MB (Supabase Storage gräns)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Använd högkvalitativa bilder som visar upp din lokal</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Se till att ha bra ljus och stabilt kameraarbete</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Överväg att lägga till mjuk bakgrundsmusik (videon spelas upp tyst)</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}