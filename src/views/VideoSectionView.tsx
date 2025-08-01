"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/src/services/clientStore"
import { PlayCircle, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function VideoSectionView() {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  
  useEffect(() => {
    // Fetch video from database via API
    const fetchVenueVideo = async () => {
      try {
        setIsFetching(true)
        const response = await fetch('/api/venue-settings')
        if (response.ok) {
          const data = await response.json()
          if (data.videoUrl) {
            setVideoUrl(data.videoUrl)
          }
        }
      } catch (error) {
        console.error('Error fetching venue video:', error)
      } finally {
        setIsFetching(false)
      }
    }
    
    fetchVenueVideo()
  }, [])

  return (
    <div className="relative h-[40vh] sm:h-[50vh] md:h-[55vh] lg:h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Floating Apple Vision Pro Style Container */}
      <div className="relative w-full max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
        {/* Glow effect behind the video */}
        <div className="absolute inset-4 sm:inset-2 lg:inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-2xl sm:blur-3xl scale-90 sm:scale-95"></div>
        
        {/* Video Container - Clean, no borders */}
        <div className="relative aspect-[16/10] rounded-2xl sm:rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden shadow-lg sm:shadow-xl lg:shadow-2xl transform hover:scale-[1.005] transition-transform duration-700 ease-out">
            {isFetching ? (
              /* Skeleton loading state while fetching */
              <Skeleton className="w-full h-full" />
            ) : videoUrl && !hasError ? (
              <>
                {/* Loading state */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border-2 sm:border-3 border-white/20 rounded-full animate-spin border-t-white/60"></div>
                  </div>
                )}
                
                {/* Video */}
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  onLoadedData={() => setIsLoading(false)}
                  onError={() => {
                    setHasError(true)
                    setIsLoading(false)
                  }}
                >
                  <source src={videoUrl} type="video/mp4" />
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
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
