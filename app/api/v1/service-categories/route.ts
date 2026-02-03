import { NextRequest, NextResponse } from "next/server"

// Mock data for development
let mockCategories = []

// GET /api/v1/service-categories - Get all categories
export async function GET() {
  try {
    return NextResponse.json(mockCategories)
  } catch (error) {
    console.error("Error fetching service categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch service categories" },
      { status: 500 },
    )
  }
}

// POST /api/v1/service-categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields with constraints
    const name = body.name
    if (name === undefined || name === null) {
      return NextResponse.json(
        { message: "Category is required", code: "BAD_REQUEST" },
        { status: 400 },
      )
    }
    if (typeof name !== "string") {
      return NextResponse.json(
        { message: "category must be a string", code: "BAD_REQUEST" },
        { status: 400 },
      )
    }
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      return NextResponse.json(
        {
          message: "Category must be at least 2 characters",
          code: "BAD_REQUEST",
        },
        { status: 400 },
      )
    }
    if (trimmed.length > 50) {
      return NextResponse.json(
        {
          message: "Category cannot exceed 50 characters",
          code: "BAD_REQUEST",
        },
        { status: 400 },
      )
    }

    // Create new category
    const newCategory = {
      id: Date.now().toString(),
      name: trimmed,
      description:
        typeof body.description === "string" ? body.description.trim() : "",
      isActive: body.isActive !== undefined ? !!body.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockCategories.push(newCategory)

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    console.error("Error creating service category:", error)
    return NextResponse.json(
      { error: "Failed to create service category" },
      { status: 500 },
    )
  }
}
