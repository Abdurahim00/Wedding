"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-serif text-gray-900">Bella Vista</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#about" className="text-gray-700 hover:text-rose-600 transition-colors duration-200 font-medium">
              About Us
            </a>
            <a href="#contact" className="text-gray-700 hover:text-rose-600 transition-colors duration-200 font-medium">
              Contact Us
            </a>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <nav className="flex flex-col space-y-4">
              <a
                href="#about"
                className="text-gray-700 hover:text-rose-600 transition-colors duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-rose-600 transition-colors duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
