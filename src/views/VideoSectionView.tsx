"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/src/services/clientStore"
import { PlayCircle, Sparkles } from "lucide-react"

export default function VideoSectionView() {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  
  useEffect(() => {
    // Fetch video from database via API
    const fetchVenueVideo = async () => {
      try {
        const response = await fetch('/api/venue-settings')
        if (response.ok) {
          const data = await response.json()
          if (data.videoUrl) {
            setVideoUrl(data.videoUrl)
          }
        }
      } catch (error) {
        console.error('Error fetching venue video:', error)
      }
    }
    
    fetchVenueVideo()
  }, [])

  return (
    <div className="relative h-[50vh] lg:h-full flex items-center justify-center p-6">
      {/* Floating Apple Vision Pro Style Container */}
      <div className="relative w-full max-w-5xl">
        {/* Glow effect behind the video */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl scale-95"></div>
        
        {/* Video Container - Clean, no borders */}
        <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden shadow-2xl transform hover:scale-[1.005] transition-transform duration-700 ease-out">
            {videoUrl && !hasError ? (
              <>
                {/* Loading state */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-12 h-12 border-2 border-white/20 rounded-full animate-spin border-t-white/60"></div>
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
                <div className="absolute bottom-8 left-8 lg:bottom-12 lg:left-12 text-white">
                  <h2 className="text-2xl lg:text-4xl font-serif font-light">
                    Your Perfect Day Awaits
                  </h2>
                  <p className="text-sm lg:text-base opacity-80 mt-2 font-light">
                    Experience unparalleled elegance
                  </p>
                </div>
              </>
            ) : (
              /* No video state - Elegant dark gradient */
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                <div className="text-center">
                  <PlayCircle className="w-16 h-16 text-white/30 mx-auto mb-6" />
                  <h2 className="text-4xl font-serif text-white/80 font-light">
                    Mazzika Fest
                  </h2>
                  <p className="text-base text-white/60 mt-2">Experience Luxury</p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
