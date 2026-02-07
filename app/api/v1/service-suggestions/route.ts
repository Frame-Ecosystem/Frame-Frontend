import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

// In-memory mock for service suggestions
const SUGGESTIONS_FILE = path.join(
  process.cwd(),
  "app",
  "api",
  "v1",
  "service-suggestions",
  "mock-service-suggestions.json",
)
let mockSuggestions: any[] = []

async function loadSuggestions() {
  try {
    const data = await fs.readFile(SUGGESTIONS_FILE, "utf-8")
    mockSuggestions = JSON.parse(data)
  } catch {
    mockSuggestions = []
  }
}

async function saveSuggestions() {
  await fs.writeFile(SUGGESTIONS_FILE, JSON.stringify(mockSuggestions, null, 2))
}

// POST /api/v1/service-suggestions - Submit a suggestion
export async function POST(request: NextRequest) {
  try {
    await loadSuggestions()

    const body = await request.json()
    const name = body.name ? String(body.name).trim() : ""
    const description =
      body.description !== undefined && body.description !== null
        ? String(body.description).trim()
        : ""
    const category = body.category ? String(body.category).trim() : null
    const estimatedPriceInput =
      body.estimatedPrice !== undefined
        ? Number(body.estimatedPrice)
        : undefined
    const estimatedDurationInput =
      body.estimatedDuration !== undefined
        ? Number(body.estimatedDuration)
        : undefined
    const targetGenderInput = body.targetGender
      ? String(body.targetGender).trim()
      : ""
    const loungeIdInput = body.loungeId ? String(body.loungeId).trim() : ""
    const adminNotes = body.adminNotes ? String(body.adminNotes).trim() : null

    // Validation
    if (!name) {
      return NextResponse.json(
        { message: "name is required", code: "BAD_REQUEST" },
        { status: 400 },
      )
    }

    // description is required per schema
    if (!description) {
      return NextResponse.json(
        { message: "description is required", code: "BAD_REQUEST" },
        { status: 400 },
      )
    }

    if (name.length > 200) {
      return NextResponse.json(
        { message: "name must be at most 200 characters", code: "BAD_REQUEST" },
        { status: 400 },
      )
    }

    if (description && description.length > 1000) {
      return NextResponse.json(
        {
          message: "description must be at most 1000 characters",
          code: "BAD_REQUEST",
        },
        { status: 400 },
      )
    }

    // validate optional numeric fields
    if (
      estimatedPriceInput !== undefined &&
      (Number.isNaN(estimatedPriceInput) || estimatedPriceInput < 0)
    ) {
      return NextResponse.json(
        {
          message: "estimatedPrice must be a non-negative number",
          code: "BAD_REQUEST",
        },
        { status: 400 },
      )
    }
    if (
      estimatedDurationInput !== undefined &&
      (Number.isNaN(estimatedDurationInput) ||
        estimatedDurationInput < 15 ||
        estimatedDurationInput > 480)
    ) {
      return NextResponse.json(
        {
          message: "estimatedDuration must be between 15 and 480 minutes",
          code: "BAD_REQUEST",
        },
        { status: 400 },
      )
    }

    // validate targetGender enum if provided
    const allowedGenders = ["men", "women", "unisex", "kids"]
    let normalizedTargetGender: string | undefined = undefined
    if (targetGenderInput) {
      const g = targetGenderInput.toLowerCase()
      if (!allowedGenders.includes(g)) {
        return NextResponse.json(
          {
            message: "targetGender must be one of men,women,unisex,kids",
            code: "BAD_REQUEST",
          },
          { status: 400 },
        )
      }
      normalizedTargetGender = g
    }

    // Validate loungeId
    if (!loungeIdInput) {
      return NextResponse.json(
        { message: "Lounge ID is required", code: "BAD_REQUEST" },
        { status: 400 },
      )
    }

    const suggestion: any = {
      id: Date.now().toString(),
      name,
      description,
      category,
      loungeId: loungeIdInput,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (estimatedPriceInput !== undefined)
      suggestion.estimatedPrice = estimatedPriceInput
    if (estimatedDurationInput !== undefined)
      suggestion.estimatedDuration = estimatedDurationInput
    if (normalizedTargetGender) suggestion.targetGender = normalizedTargetGender
    if (adminNotes) suggestion.adminNotes = adminNotes

    mockSuggestions.push(suggestion)
    await saveSuggestions()

    return NextResponse.json(suggestion, { status: 201 })
  } catch (error) {
    console.error("Error creating service suggestion:", error)
    return NextResponse.json(
      { error: "Failed to create suggestion" },
      { status: 500 },
    )
  }
}

// GET /api/v1/service-suggestions - Return all suggestions
export async function GET(request: NextRequest) {
  try {
    await loadSuggestions()

    // Parse query params
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10"))
    const statusFilter = searchParams.get("status")
    const loungeIdFilter = searchParams.get("loungeId")

    // Filter suggestions
    let filtered = mockSuggestions
    if (statusFilter) {
      filtered = filtered.filter((s) => s.status === statusFilter)
    }
    if (loungeIdFilter) {
      filtered = filtered.filter((s) => s.loungeId === loungeIdFilter)
    }

    // Paginate
    const total = filtered.length
    const pages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    // Add loungeName and convert id to _id
    const suggestions = paginated.map((s) => ({
      _id: s.id,
      loungeId: s.loungeId,
      loungeName: `Lounge ${s.loungeId.slice(-4)}`, // Mock lounge name
      name: s.name,
      description: s.description,
      category: s.category || null,
      estimatedPrice: s.estimatedPrice,
      estimatedDuration: s.estimatedDuration,
      targetGender: s.targetGender,
      status: s.status,
      adminNotes: s.adminNotes || null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }))

    return NextResponse.json({
      suggestions,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    })
  } catch (error) {
    console.error("Error fetching service suggestions:", error)
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 },
    )
  }
}
