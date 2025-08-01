import { createClient } from '@supabase/supabase-js'

export const uploadVideoToSupabase = async (file: File): Promise<string> => {
  // Use service role key for storage operations (server-side only)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  try {
    // Create a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `wedding-videos/${fileName}`

    // Upload to Supabase Storage
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

    console.log('Upload successful:', data)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath)

    console.log('Public URL:', publicUrl)
    
    return publicUrl
  } catch (error) {
    console.error('Error uploading to Supabase:', error)
    throw new Error('Failed to upload video')
  }
}