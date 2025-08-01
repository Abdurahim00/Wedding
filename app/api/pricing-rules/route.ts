import { NextRequest, NextResponse } from 'next/server'
import { PricingRuleModel } from '@/src/models/PricingRuleModel'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const rules = await PricingRuleModel.findAll()
    return NextResponse.json(rules)
  } catch (error) {
    console.error('Error fetching pricing rules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing rules' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const rule = await PricingRuleModel.create({
      name: data.name,
      type: data.type,
      price: data.price,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      daysOfWeek: data.daysOfWeek || [],
      priority: data.priority || 0,
      isActive: data.isActive ?? true
    })
    
    return NextResponse.json(rule)
  } catch (error) {
    console.error('Error creating pricing rule:', error)
    return NextResponse.json(
      { error: 'Failed to create pricing rule' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      )
    }
    
    const rule = await PricingRuleModel.update(id, {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null
    })
    
    return NextResponse.json(rule)
  } catch (error) {
    console.error('Error updating pricing rule:', error)
    return NextResponse.json(
      { error: 'Failed to update pricing rule' },
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
        { error: 'Rule ID is required' },
        { status: 400 }
      )
    }
    
    const success = await PricingRuleModel.delete(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete pricing rule' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pricing rule:', error)
    return NextResponse.json(
      { error: 'Failed to delete pricing rule' },
      { status: 500 }
    )
  }
}