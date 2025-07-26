"use client"

import { useState } from "react"

export default function VideoSection() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="relative h-64 lg:h-full bg-gray-100">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-300 rounded-full mb-4"></div>
            <p className="text-gray-500 text-sm">Loading venue preview...</p>
          </div>
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
        poster="/placeholder.svg?height=600&width=800"
      >
        <source src="/placeholder-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Content Overlay */}
      <div className="absolute bottom-8 left-8 text-white">
        <h2 className="text-3xl lg:text-4xl font-serif mb-2">Your Perfect Day Awaits</h2>
        <p className="text-lg opacity-90">Experience elegance in our stunning venue</p>
      </div>
    </div>
  )
}
