import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory mock for lounge services
let mockLoungeServices: any[] = []

// GET /api/v1/lounge-services - Get all lounge services
export async function GET() {
  try {
    return NextResponse.json(mockLoungeServices)
  } catch (error) {
    console.error('Error fetching lounge services:', error)
    return NextResponse.json({ error: 'Failed to fetch lounge services' }, { status: 500 })
  }
}

// POST /api/v1/lounge-services - Create lounge-specific service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const loungeId = body.loungeId ? String(body.loungeId).trim() : ''
    const serviceId = body.serviceId ? String(body.serviceId).trim() : ''

    if (!loungeId || !serviceId) {
      return NextResponse.json(
        { message: 'Invalid request data. loungeId and serviceId are required', code: 'BAD_REQUEST' },
        { status: 400 }
      )
    }

    const normalizeGender: Record<string, string> = {
      men: 'men',
      women: 'women',
      male: 'men',
      female: 'women',
      unisex: 'unisex',
      kids: 'kids'
    }

    let normalizedGender: string | undefined = undefined
    if (body.gender !== undefined && body.gender !== null && String(body.gender).trim() !== '') {
      const g = String(body.gender).trim().toLowerCase()
      if (!Object.prototype.hasOwnProperty.call(normalizeGender, g)) {
        return NextResponse.json({ message: 'gender must be a valid enum value', code: 'BAD_REQUEST' }, { status: 400 })
      }
      normalizedGender = normalizeGender[g]
    }

    const newItem = {
      id: Date.now().toString(),
      _id: Date.now().toString(),
      loungeId,
      serviceId,
      price: typeof body.price === 'number' ? body.price : body.price ? Number(body.price) : undefined,
      duration: body.duration ? parseInt(body.duration) : undefined,
      gender: normalizedGender || undefined,
      description: body.description || '',
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockLoungeServices.push(newItem)

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Error creating lounge service:', error)
    return NextResponse.json({ error: 'Failed to create lounge service' }, { status: 500 })
  }
}