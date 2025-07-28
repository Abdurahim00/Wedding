import VideoManagementView from "@/src/views/VideoManagementView"

export default function TestVideoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-8">Video Upload Test Page</h1>
      <VideoManagementView />
    </div>
  )
}