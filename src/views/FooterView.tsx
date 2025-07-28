"use client"

import { Heart } from "lucide-react"

export default function FooterView() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-serif text-gray-900">Bella Vista</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Creating unforgettable memories in the most beautiful setting for over 25 years
          </p>
          
          <div className="flex items-center justify-center gap-8 pt-4 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-900 transition-colors">Sitemap</a>
          </div>
          
          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
              © {currentYear} Bella Vista. Made with
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              in Beverly Hills
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}