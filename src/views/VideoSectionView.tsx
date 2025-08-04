"use client"

import { useState, useEffect, useRef } from "react"
import { useStore } from "@/src/services/clientStore"
import { PlayCircle, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return isMobile
}

export default function VideoSectionView() {
  const isMobile = useIsMobile()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playAttempted, setPlayAttempted] = useState(false)
  
  useEffect(() => {
    // Fetch video from database via API
    const fetchVenueVideo = async () => {
      try {
        setIsFetching(true)
        console.log('Fetching venue video...')
        const response = await fetch('/api/venue-settings')
        console.log('Response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('Venue settings data:', data)
          if (data.videoUrl) {
            console.log('Setting video URL:', data.videoUrl)
            setVideoUrl(data.videoUrl)
          } else {
            console.log('No video URL found in data')
          }
        } else {
          console.error('Failed to fetch venue settings:', response.status)
        }
      } catch (error) {
        console.error('Error fetching venue video:', error)
      } finally {
        setIsFetching(false)
      }
    }
    
    fetchVenueVideo()
  }, [])

  const handleVideoClick = async () => {
    if (isMobile && videoRef.current) {
      setPlayAttempted(true)
      try {
        if (isPlaying) {
          videoRef.current.pause()
          setIsPlaying(false)
        } else {
          // Try to play the video
          const playPromise = videoRef.current.play()
          if (playPromise !== undefined) {
            await playPromise
            setIsPlaying(true)
            console.log('Video started playing successfully')
          }
        }
      } catch (error) {
        console.error('Error playing video:', error)
        // If autoplay fails, show controls
        if (videoRef.current) {
          videoRef.current.controls = true
        }
      }
    }
  }

  console.log('VideoSectionView render - isMobile:', isMobile, 'isFetching:', isFetching, 'videoUrl:', videoUrl, 'hasError:', hasError, 'isLoading:', isLoading, 'isPlaying:', isPlaying, 'playAttempted:', playAttempted)
  
  return (
    <div className="relative h-[40vh] sm:h-[50vh] md:h-[55vh] lg:h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Floating Apple Vision Pro Style Container */}
      <div className="relative w-full max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
        {/* Glow effect behind the video */}
        <div className="absolute inset-4 sm:inset-2 lg:inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-2xl sm:blur-3xl scale-90 sm:scale-95"></div>
        
        {/* Video Container - Clean, no borders */}
        <div className={`relative aspect-[16/10] rounded-2xl sm:rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden shadow-lg sm:shadow-xl lg:shadow-2xl transform hover:scale-[1.005] transition-transform duration-700 ease-out ${isMobile ? 'min-h-[200px] bg-black' : ''}`}>
            {isFetching ? (
              /* Skeleton loading state while fetching */
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border-2 sm:border-3 border-white/20 rounded-full animate-spin border-t-white/60 mx-auto mb-4"></div>
                  <p className="text-white/60 text-sm">Loading video...</p>
                </div>
              </div>
            ) : videoUrl && !hasError ? (
              <>
                {/* Loading state */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border-2 sm:border-3 border-white/20 rounded-full animate-spin border-t-white/60"></div>
                  </div>
                )}
                
                {/* Mobile play button overlay */}
                {isMobile && !isLoading && !isPlaying && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
                    onClick={handleVideoClick}
                  >
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                      <PlayCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
                
                {/* Video */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay={!isMobile}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  controls={isMobile}
                  onLoadedData={() => {
                    console.log('Video loaded data')
                    setIsLoading(false)
                  }}
                  onError={(e) => {
                    console.error('Video error:', e)
                    setHasError(true)
                    setIsLoading(false)
                    // On mobile, if video fails to load, show controls
                    if (isMobile && videoRef.current) {
                      videoRef.current.controls = true
                    }
                  }}
                  onLoadStart={() => console.log('Video loading started')}
                  onCanPlay={() => console.log('Video can play')}
                  onCanPlayThrough={() => console.log('Video can play through')}
                  onPlay={() => {
                    console.log('Video started playing')
                    setIsPlaying(true)
                  }}
                  onPause={() => {
                    console.log('Video paused')
                    setIsPlaying(false)
                  }}
                  onEnded={() => console.log('Video ended')}
                >
                  <source src={videoUrl} type="video/mp4" />
                  <source src={videoUrl} type="video/webm" />
                  <source src={videoUrl} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>

                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>

                {/* Minimal Content Overlay */}
                <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 md:bottom-10 md:left-10 lg:bottom-16 lg:left-16 text-white">
                  <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif font-light">
                    Your Perfect Day Awaits
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg opacity-80 mt-1 sm:mt-2 lg:mt-3 font-light">
                    Experience unparalleled elegance
                  </p>
                  {isMobile && !isPlaying && !playAttempted && (
                    <p className="text-xs opacity-60 mt-1">
                      Tap to play video
                    </p>
                  )}
                  {isMobile && !isPlaying && playAttempted && (
                    <p className="text-xs opacity-60 mt-1">
                      Use video controls
                    </p>
                  )}
                </div>
              </>
            ) : (
              /* No video state - Elegant dark gradient */
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                <div className="text-center">
                  <PlayCircle className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 text-white/30 mx-auto mb-4 sm:mb-6 lg:mb-8" />
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-white/80 font-light">
                    Mazzika Fest
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg text-white/60 mt-2 sm:mt-3">Experience Luxury</p>
                  {!videoUrl && (
                    <p className="text-xs text-white/40 mt-2">No video uploaded yet</p>
                  )}
                  {videoUrl && hasError && (
                    <p className="text-xs text-red-400 mt-2">
                      {isMobile ? 'Video controls available below' : 'Video failed to load'}
                    </p>
                  )}
                  {isMobile && videoUrl && !hasError && !isPlaying && !playAttempted && (
                    <p className="text-xs text-white/40 mt-2">Tap to play video</p>
                  )}
                  {isMobile && videoUrl && !hasError && !isPlaying && playAttempted && (
                    <p className="text-xs text-white/40 mt-2">Use video controls below</p>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
