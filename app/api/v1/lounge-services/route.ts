import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

// Simple in-memory mock for lounge services
const LOUNGE_SERVICES_FILE = path.join(
  process.cwd(),
  "app",
  "api",
  "v1",
  "lounge-services",
  "mock-lounge-services.json",
)
let mockLoungeServices: any[] = []

async function loadLoungeServices() {
  try {
    const data = await fs.readFile(LOUNGE_SERVICES_FILE, "utf-8")
    mockLoungeServices = JSON.parse(data)
  } catch {
    mockLoungeServices = []
  }
}

async function saveLoungeServices() {
  await fs.writeFile(
    LOUNGE_SERVICES_FILE,
    JSON.stringify(mockLoungeServices, null, 2),
  )
}

// GET /api/v1/lounge-services - Get all lounge services
export async function GET() {
  try {
    await loadLoungeServices()
    return NextResponse.json(mockLoungeServices)
  } catch (error) {
    console.error("Error fetching lounge services:", error)
    return NextResponse.json(
      { error: "Failed to fetch lounge services" },
      { status: 500 },
    )
  }
}

// POST /api/v1/lounge-services - Create lounge-specific service
export async function POST(request: NextRequest) {
  try {
    await loadLoungeServices()

    const body = await request.json()
    const loungeId = body.loungeId ? String(body.loungeId).trim() : ""
    const serviceId = body.serviceId ? String(body.serviceId).trim() : ""

    if (!loungeId || !serviceId) {
      return NextResponse.json(
        {
          message: "Invalid request data. loungeId and serviceId are required",
          code: "BAD_REQUEST",
        },
        { status: 400 },
      )
    }

    const normalizeGender: Record<string, string> = {
      men: "men",
      women: "women",
      male: "men",
      female: "women",
      unisex: "unisex",
      kids: "kids",
    }

    let normalizedGender: string | undefined = undefined
    if (
      body.gender !== undefined &&
      body.gender !== null &&
      String(body.gender).trim() !== ""
    ) {
      const g = String(body.gender).trim().toLowerCase()
      if (!Object.prototype.hasOwnProperty.call(normalizeGender, g)) {
        return NextResponse.json(
          { message: "gender must be a valid enum value", code: "BAD_REQUEST" },
          { status: 400 },
        )
      }
      normalizedGender = normalizeGender[g]
    }

    const newItem = {
      id: Date.now().toString(),
      _id: Date.now().toString(),
      loungeId,
      serviceId,
      price:
        typeof body.price === "number"
          ? body.price
          : body.price
            ? Number(body.price)
            : undefined,
      duration: body.duration ? parseInt(body.duration) : undefined,
      gender: normalizedGender || undefined,
      description: body.description || "",
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockLoungeServices.push(newItem)
    await saveLoungeServices()

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error("Error creating lounge service:", error)
    return NextResponse.json(
      { error: "Failed to create lounge service" },
      { status: 500 },
    )
  }
}

// PUT /api/v1/lounge-services/:id - Update lounge service
export async function PUT(request: NextRequest) {
  try {
    await loadLoungeServices()

    const url = new URL(request.url)
    const pathParts = url.pathname.split("/")
    const id = pathParts[pathParts.length - 1]

    if (!id) {
      return NextResponse.json(
        { message: "Service ID is required", code: "BAD_REQUEST" },
        { status: 400 },
      )
    }

    const serviceIndex = mockLoungeServices.findIndex(
      (s) => s._id === id || s.id === id,
    )
    if (serviceIndex === -1) {
      return NextResponse.json(
        { message: "Lounge service not found", code: "NOT_FOUND" },
        { status: 404 },
      )
    }

    const body = await request.json()

    // Normalize gender if provided
    const normalizeGender: Record<string, string> = {
      men: "men",
      women: "women",
      male: "men",
      female: "women",
      unisex: "unisex",
      kids: "kids",
    }

    let normalizedGender: string | undefined =
      mockLoungeServices[serviceIndex].gender
    if (
      body.gender !== undefined &&
      body.gender !== null &&
      String(body.gender).trim() !== ""
    ) {
      const g = String(body.gender).trim().toLowerCase()
      if (!Object.prototype.hasOwnProperty.call(normalizeGender, g)) {
        return NextResponse.json(
          { message: "gender must be a valid enum value", code: "BAD_REQUEST" },
          { status: 400 },
        )
      }
      normalizedGender = normalizeGender[g]
    }

    // Update the service with provided fields
    const updatedService = {
      ...mockLoungeServices[serviceIndex],
      price:
        body.price !== undefined
          ? typeof body.price === "number"
            ? body.price
            : Number(body.price)
          : mockLoungeServices[serviceIndex].price,
      duration:
        body.duration !== undefined
          ? parseInt(body.duration)
          : mockLoungeServices[serviceIndex].duration,
      gender: normalizedGender,
      description:
        body.description !== undefined
          ? body.description
          : mockLoungeServices[serviceIndex].description,
      isActive:
        body.isActive !== undefined
          ? Boolean(body.isActive)
          : mockLoungeServices[serviceIndex].isActive,
      updatedAt: new Date().toISOString(),
    }

    mockLoungeServices[serviceIndex] = updatedService
    await saveLoungeServices()

    return NextResponse.json(updatedService)
  } catch (error) {
    console.error("Error updating lounge service:", error)
    return NextResponse.json(
      { error: "Failed to update lounge service" },
      { status: 500 },
    )
  }
}
