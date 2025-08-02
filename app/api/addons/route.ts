import { NextRequest, NextResponse } from 'next/server'
import { AddOnModel } from '@/src/models/AddOnModel.server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    const addOns = await AddOnModel.findAll(includeInactive)
    return NextResponse.json(addOns)
  } catch (error) {
    console.error('Error fetching add-ons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch add-ons' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.name || data.price === undefined) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      )
    }

    const addOn = await AddOnModel.create({
      name: data.name,
      description: data.description || null,
      price: parseFloat(data.price),
      priceType: data.priceType || 'fixed',
      unit: data.unit || null,
      isActive: data.isActive ?? true
    })
    
    return NextResponse.json(addOn)
  } catch (error) {
    console.error('Error creating add-on:', error)
    return NextResponse.json(
      { error: 'Failed to create add-on' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Add-on ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.price !== undefined) updateData.price = parseFloat(data.price)
    if (data.priceType !== undefined) updateData.priceType = data.priceType
    if (data.unit !== undefined) updateData.unit = data.unit
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    const addOn = await AddOnModel.update(id, updateData)
    return NextResponse.json(addOn)
  } catch (error) {
    console.error('Error updating add-on:', error)
    return NextResponse.json(
      { error: 'Failed to update add-on' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Add-on ID is required' },
        { status: 400 }
      )
    }
    
    const success = await AddOnModel.delete(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete add-on' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting add-on:', error)
    return NextResponse.json(
      { error: 'Failed to delete add-on' },
      { status: 500 }
    )
  }
}