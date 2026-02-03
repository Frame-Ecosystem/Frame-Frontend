import { NextRequest, NextResponse } from "next/server"

// Import the mock data from the parent route
// Note: In a real app, this would be from a database
let mockCategories = []

// GET /api/v1/service-categories/[id] - Get category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const category = mockCategories.find((cat) => cat.id === id)

    if (!category) {
      return NextResponse.json(
        { error: "Service category not found" },
        { status: 404 },
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching service category:", error)
    return NextResponse.json(
      { error: "Failed to fetch service category" },
      { status: 500 },
    )
  }
}

// PUT /api/v1/service-categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()
    const categoryIndex = mockCategories.findIndex((cat) => cat.id === id)

    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: "Service category not found" },
        { status: 404 },
      )
    }

    // Update the category
    const updatedCategory = {
      ...mockCategories[categoryIndex],
      ...body,
      id: id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    }

    mockCategories[categoryIndex] = updatedCategory

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("Error updating service category:", error)
    return NextResponse.json(
      { error: "Failed to update service category" },
      { status: 500 },
    )
  }
}

// DELETE /api/v1/service-categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const categoryIndex = mockCategories.findIndex((cat) => cat.id === id)

    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: "Service category not found" },
        { status: 404 },
      )
    }

    // Remove the category
    mockCategories.splice(categoryIndex, 1)

    return NextResponse.json({
      message: "Service category deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting service category:", error)
    return NextResponse.json(
      { error: "Failed to delete service category" },
      { status: 500 },
    )
  }
}
