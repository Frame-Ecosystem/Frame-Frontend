import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

// Mock data files
const SUGGESTIONS_FILE = path.join(
  process.cwd(),
  "app",
  "api",
  "v1",
  "service-suggestions",
  "mock-service-suggestions.json",
)
const SERVICES_FILE = path.join(
  process.cwd(),
  "app",
  "api",
  "v1",
  "services",
  "mock-services.json",
)
const LOUNGE_SERVICES_FILE = path.join(
  process.cwd(),
  "app",
  "api",
  "v1",
  "lounge-services",
  "mock-lounge-services.json",
)

// In-memory mocks
let mockSuggestions: any[] = []
let mockServices: any[] = []
let mockLoungeServices: any[] = []

async function loadData() {
  try {
    const suggestionsData = await fs.readFile(SUGGESTIONS_FILE, "utf-8")
    mockSuggestions = JSON.parse(suggestionsData)
  } catch {
    mockSuggestions = []
  }

  try {
    const servicesData = await fs.readFile(SERVICES_FILE, "utf-8")
    mockServices = JSON.parse(servicesData)
  } catch {
    mockServices = []
  }

  try {
    const loungeServicesData = await fs.readFile(LOUNGE_SERVICES_FILE, "utf-8")
    mockLoungeServices = JSON.parse(loungeServicesData)
  } catch {
    mockLoungeServices = []
  }
}

async function saveData() {
  await fs.writeFile(SUGGESTIONS_FILE, JSON.stringify(mockSuggestions, null, 2))
  await fs.writeFile(SERVICES_FILE, JSON.stringify(mockServices, null, 2))
  await fs.writeFile(
    LOUNGE_SERVICES_FILE,
    JSON.stringify(mockLoungeServices, null, 2),
  )
}

// PATCH /api/v1/service-suggestions/:suggestionId/admin-approve
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ suggestionId: string }> },
) {
  try {
    await loadData()

    const { suggestionId } = await params
    const body = await request.json()

    // Find the suggestion
    const suggestionIndex = mockSuggestions.findIndex(
      (s) => s.id === suggestionId,
    )
    if (suggestionIndex === -1) {
      return NextResponse.json(
        { message: "Service suggestion not found", code: "NOT_FOUND" },
        { status: 404 },
      )
    }

    const suggestion = mockSuggestions[suggestionIndex]

    // Validate request body
    const categoryId = body.categoryId ? String(body.categoryId).trim() : ""
    if (!categoryId) {
      return NextResponse.json(
        { message: "categoryId is required", code: "BAD_REQUEST" },
        { status: 400 },
      )
    }

    // Validate optional fields
    const price = body.price !== undefined ? Number(body.price) : undefined
    const duration =
      body.duration !== undefined ? Number(body.duration) : undefined
    const gender = body.gender ? String(body.gender).trim() : undefined
    const adminNote = body.adminNote ? String(body.adminNote).trim() : undefined

    if (price !== undefined && (isNaN(price) || price < 0)) {
      return NextResponse.json(
        { message: "price must be a non-negative number", code: "BAD_REQUEST" },
        { status: 400 },
      )
    }

    if (
      duration !== undefined &&
      (isNaN(duration) || duration < 15 || duration > 480)
    ) {
      return NextResponse.json(
        {
          message: "duration must be between 15 and 480 minutes",
          code: "BAD_REQUEST",
        },
        { status: 400 },
      )
    }

    // Validate gender enum if provided
    const allowedGenders = ["men", "women", "unisex", "kids", "male", "female"]
    if (gender && !allowedGenders.includes(gender.toLowerCase())) {
      return NextResponse.json(
        {
          message: "gender must be one of men,women,unisex,kids,male,female",
          code: "BAD_REQUEST",
        },
        { status: 400 },
      )
    }

    // Create new service
    const newService = {
      id: Date.now().toString(),
      name: suggestion.name,
      description: suggestion.description || "",
      categoryId: categoryId,
      basePrice: price || suggestion.estimatedPrice || 0,
      estimatedDuration: duration || suggestion.estimatedDuration || 30,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockServices.push(newService)

    // Create lounge service
    const normalizeGender: Record<string, string> = {
      men: "men",
      women: "women",
      male: "men",
      female: "women",
      unisex: "unisex",
      kids: "kids",
    }

    const normalizedGender = gender
      ? normalizeGender[gender.toLowerCase()] || gender.toLowerCase()
      : suggestion.targetGender

    const newLoungeService = {
      id: Date.now().toString() + "_lounge",
      _id: Date.now().toString() + "_lounge",
      loungeId: suggestion.loungeId,
      serviceId: newService.id,
      price: price || suggestion.estimatedPrice,
      duration: duration || suggestion.estimatedDuration,
      gender: normalizedGender,
      description: suggestion.description || "",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockLoungeServices.push(newLoungeService)

    // Update suggestion status to 'implemented'
    suggestion.status = "implemented"
    suggestion.updatedAt = new Date().toISOString()
    if (adminNote) {
      suggestion.adminComment = adminNote
    }

    await saveData()

    // Return response with all created/updated data
    const response = {
      suggestion: {
        _id: suggestion.id,
        name: suggestion.name,
        description: suggestion.description,
        estimatedPrice: suggestion.estimatedPrice,
        estimatedDuration: suggestion.estimatedDuration,
        targetGender: suggestion.targetGender,
        status: suggestion.status,
        loungeId: suggestion.loungeId,
        adminComment: suggestion.adminComment,
        createdAt: suggestion.createdAt,
        updatedAt: suggestion.updatedAt,
      },
      service: newService,
      loungeService: newLoungeService,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Error in admin approve service suggestion:", error)
    return NextResponse.json(
      { error: "Failed to approve service suggestion" },
      { status: 500 },
    )
  }
}
