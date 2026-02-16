import { NextRequest, NextResponse } from "next/server"

// Import the mock data from the parent route
// Note: In a real app, this would be from a database
let mockServices = [
  {
    id: "1",
    name: "Classic Haircut",
    description: "Traditional haircut with styling",
    categoryId: "1",
    basePrice: 25,
    estimatedDuration: 30,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Beard Trim",
    description: "Professional beard trimming and shaping",
    categoryId: "2",
    basePrice: 15,
    estimatedDuration: 15,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Hair Coloring",
    description: "Full hair coloring service",
    categoryId: "3",
    basePrice: 80,
    estimatedDuration: 120,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// GET /api/v1/services/[id] - Get service by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const service = mockServices.find((s) => s.id === id)

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 },
    )
  }
}

// PUT /api/v1/services/[id] - Update service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()
    const serviceIndex = mockServices.findIndex((s) => s.id === id)

    if (serviceIndex === -1) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Update the service
    // If name is being updated, ensure uniqueness across other services
    if (body.name) {
      const newName = String(body.name).trim()
      const duplicate = mockServices.some(
        (s) => s.id !== id && s.name.toLowerCase() === newName.toLowerCase(),
      )
      if (duplicate) {
        return NextResponse.json(
          { error: "Service name already exists" },
          { status: 409 },
        )
      }
      body.name = newName
    }

    const updatedService = {
      ...mockServices[serviceIndex],
      ...body,
      id: id, // Ensure ID doesn't change
      basePrice: body.basePrice
        ? parseFloat(body.basePrice)
        : mockServices[serviceIndex].basePrice,
      estimatedDuration: body.estimatedDuration
        ? parseInt(body.estimatedDuration)
        : mockServices[serviceIndex].estimatedDuration,
      updatedAt: new Date().toISOString(),
    }

    mockServices[serviceIndex] = updatedService

    return NextResponse.json(updatedService)
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 },
    )
  }
}

// DELETE /api/v1/services/[id] - Delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const serviceIndex = mockServices.findIndex((s) => s.id === id)

    if (serviceIndex === -1) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Remove the service
    mockServices.splice(serviceIndex, 1)

    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 },
    )
  }
}
