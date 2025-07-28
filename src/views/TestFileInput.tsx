"use client"

import { useState } from 'react'

export default function TestFileInput() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  return (
    <div className="p-8 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">File Input Test</h2>
      
      {/* Test 1: Basic HTML input */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Test 1: Basic HTML Input</h3>
        <input 
          type="file" 
          onChange={(e) => {
            console.log('Test 1 - File selected:', e.target.files?.[0])
            setSelectedFile(e.target.files?.[0] || null)
          }}
        />
      </div>

      {/* Test 2: Label with input */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Test 2: Label with Hidden Input</h3>
        <label className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600">
          Choose File (Label)
          <input 
            type="file" 
            className="hidden"
            onChange={(e) => {
              console.log('Test 2 - File selected:', e.target.files?.[0])
              setSelectedFile(e.target.files?.[0] || null)
            }}
          />
        </label>
      </div>

      {/* Test 3: Button with click handler */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Test 3: Button Click</h3>
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.onchange = (e) => {
              const files = (e.target as HTMLInputElement).files
              console.log('Test 3 - File selected:', files?.[0])
              setSelectedFile(files?.[0] || null)
            }
            input.click()
          }}
        >
          Choose File (Button)
        </button>
      </div>

      {/* Test 4: Direct DOM manipulation */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Test 4: Direct DOM</h3>
        <button 
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          onClick={() => {
            const input = document.getElementById('test-input-4') as HTMLInputElement
            if (input) {
              input.click()
            }
          }}
        >
          Choose File (DOM)
        </button>
        <input 
          id="test-input-4"
          type="file" 
          style={{ position: 'absolute', left: '-9999px' }}
          onChange={(e) => {
            console.log('Test 4 - File selected:', e.target.files?.[0])
            setSelectedFile(e.target.files?.[0] || null)
          }}
        />
      </div>

      {/* Display selected file */}
      {selectedFile && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Selected File:</h3>
          <p>Name: {selectedFile.name}</p>
          <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          <p>Type: {selectedFile.type}</p>
        </div>
      )}
    </div>
  )
}