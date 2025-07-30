"use client"

export default function TestFilePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Basic File Input Test</h1>
      
      <div className="space-y-8">
        {/* Test 1: Most basic HTML */}
        <div>
          <h2 className="font-semibold mb-2">Test 1: Basic HTML Input</h2>
          <input type="file" />
        </div>

        {/* Test 2: With onChange */}
        <div>
          <h2 className="font-semibold mb-2">Test 2: With onChange</h2>
          <input 
            type="file" 
            onChange={(e) => {
              console.log('File selected:', e.target.files?.[0])
              alert('File selected: ' + e.target.files?.[0]?.name)
            }}
          />
        </div>

        {/* Test 3: With accept */}
        <div>
          <h2 className="font-semibold mb-2">Test 3: With accept attribute</h2>
          <input 
            type="file" 
            accept="video/*"
            onChange={(e) => {
              console.log('Video selected:', e.target.files?.[0])
            }}
          />
        </div>

        {/* Test 4: Button trigger */}
        <div>
          <h2 className="font-semibold mb-2">Test 4: Button trigger</h2>
          <button 
            onClick={() => {
              console.log('Button clicked')
              const input = document.createElement('input')
              input.type = 'file'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                console.log('File from button:', file)
                alert('File selected via button: ' + file?.name)
              }
              input.click()
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Click to choose file
          </button>
        </div>

        {/* Test 5: Form */}
        <div>
          <h2 className="font-semibold mb-2">Test 5: Inside a form</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="file" name="testfile" />
          </form>
        </div>
      </div>
    </div>
  )
}