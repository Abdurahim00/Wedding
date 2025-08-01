import { createClient } from '@supabase/supabase-js'

export const uploadVideoDirectly = async (file: File): Promise<string> => {
  // Client-side upload using anon key (with RLS policies)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `wedding-videos/${fileName}`

    // Upload directly from client to Supabase
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath)

    // Now save the URL to database via API
    const response = await fetch('/api/venue-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl: publicUrl })
    })

    if (!response.ok) {
      throw new Error('Failed to save video URL')
    }

    return publicUrl
  } catch (error) {
    console.error('Error uploading video:', error)
    throw error
  }
}