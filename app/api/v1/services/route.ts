import { NextRequest, NextResponse } from 'next/server'

// Mock data for development
let mockServices = [
  {
    id: '1',
    name: 'Classic Haircut',
    description: 'Traditional haircut with styling',
    categoryId: '1',
    basePrice: 25,
    estimatedDuration: 30,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Beard Trim',
    description: 'Professional beard trimming and shaping',
    categoryId: '2',
    basePrice: 15,
    estimatedDuration: 15,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Hair Coloring',
    description: 'Full hair coloring service',
    categoryId: '3',
    basePrice: 80,
    estimatedDuration: 120,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// GET /api/v1/services - Get all services
export async function GET() {
  try {
    return NextResponse.json(mockServices)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

// POST /api/v1/services - Create new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const name = body.name ? String(body.name).trim() : ''

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Check uniqueness (case-insensitive)
    const exists = mockServices.some(s => s.name.toLowerCase() === name.toLowerCase())
    if (exists) {
      return NextResponse.json({ error: 'Service name already exists' }, { status: 409 })
    }

    // Create new service
    const newService = {
      id: Date.now().toString(),
      name: name,
      description: body.description || '',
      categoryId: body.categoryId || null,
      basePrice: body.basePrice ? parseFloat(body.basePrice) : 0,
      estimatedDuration: body.estimatedDuration ? parseInt(body.estimatedDuration) : 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockServices.push(newService)

    return NextResponse.json(newService, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}