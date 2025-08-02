import { createClient } from '@supabase/supabase-js'

export interface AddOn {
  id: string
  name: string
  description?: string | null
  price: number
  priceType: 'fixed' | 'per_person'
  unit?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface BookingAddOn {
  id: string
  bookingId: string
  addOnId: string
  quantity: number
  price: number
  addOn?: AddOn
}

// Create a function to get the supabase client instead of initializing at module level
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export class AddOnModel {
  static async create(data: Omit<AddOn, 'id' | 'createdAt' | 'updatedAt'>): Promise<AddOn> {
    const supabase = getSupabaseClient()
    const { data: addOn, error } = await supabase
      .rpc('create_wedding_addon', {
        p_name: data.name,
        p_description: data.description || null,
        p_price: data.price,
        p_price_type: data.priceType,
        p_unit: data.unit || null,
        p_is_active: data.isActive
      })
    
    if (error) throw error
    return addOn[0]
  }

  static async findAll(includeInactive = false): Promise<AddOn[]> {
    const supabase = getSupabaseClient()
    const { data: addOns, error } = await supabase
      .rpc('get_wedding_addons', { include_inactive: includeInactive })
    
    if (error) throw error
    return addOns || []
  }

  static async findById(id: string): Promise<AddOn | null> {
    const supabase = getSupabaseClient()
    const { data: addOn, error } = await supabase
      .rpc('get_wedding_addon', { p_id: id })
    
    if (error || !addOn || addOn.length === 0) return null
    return addOn[0]
  }

  static async update(id: string, data: Partial<Omit<AddOn, 'id' | 'createdAt' | 'updatedAt'>>): Promise<AddOn> {
    const supabase = getSupabaseClient()
    const { data: addOn, error } = await supabase
      .rpc('update_wedding_addon', {
        p_id: id,
        p_name: data.name || null,
        p_description: data.description !== undefined ? data.description : null,
        p_price: data.price || null,
        p_price_type: data.priceType || null,
        p_unit: data.unit !== undefined ? data.unit : null,
        p_is_active: data.isActive !== undefined ? data.isActive : null
      })
    
    if (error) throw error
    return addOn[0]
  }

  static async delete(id: string): Promise<boolean> {
    const supabase = getSupabaseClient()
    const { data: success, error } = await supabase
      .rpc('delete_wedding_addon', { p_id: id })
    
    return !error && success
  }

  static async toggleActive(id: string): Promise<AddOn> {
    const addOn = await this.findById(id)
    if (!addOn) throw new Error('AddOn not found')
    
    return await this.update(id, { isActive: !addOn.isActive })
  }
}