import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const uploadVideoToSupabase = async (file: File): Promise<string> => {
  try {
    // Create a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `wedding-videos/${fileName}`

    // First, check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
      throw new Error('Failed to access storage buckets')
    }

    // Check if 'videos' bucket exists
    const videosBucket = buckets.find(bucket => bucket.name === 'videos')
    
    if (!videosBucket) {
      // Try to create the bucket
      const { error: createError } = await supabase.storage.createBucket('videos', {
        public: true,
        allowedMimeTypes: ['video/mp4', 'video/webm', 'video/ogg'],
        fileSizeLimit: 524288000 // 500MB in bytes
      })
      
      if (createError) {
        console.error('Error creating videos bucket:', createError)
        throw new Error('Storage bucket not available. Please contact administrator.')
      }
    }

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

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error uploading to Supabase:', error)
    throw new Error('Failed to upload video')
  }
}