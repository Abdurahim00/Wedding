"use client"

import { Heart } from "lucide-react"

export default function FooterView() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-serif text-gray-900">Mazzika Fest</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Skapar oförglömliga minnen i den vackraste miljön i över 25 år
          </p>
          
          <div className="flex items-center justify-center gap-8 pt-4 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors">Integritetspolicy</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-900 transition-colors">Användarvillkor</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-900 transition-colors">Webbplatskarta</a>
          </div>
          
          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
              © {currentYear} Mazzika Fest. Skapad med
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              i Göteborg
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}