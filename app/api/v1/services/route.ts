import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

// Mock data for development
const SERVICES_FILE = path.join(
  process.cwd(),
  "app",
  "api",
  "v1",
  "services",
  "mock-services.json",
)
let mockServices: any[] = []

async function loadServices() {
  try {
    const data = await fs.readFile(SERVICES_FILE, "utf-8")
    mockServices = JSON.parse(data)
  } catch {
    mockServices = []
  }
}

async function saveServices() {
  await fs.writeFile(SERVICES_FILE, JSON.stringify(mockServices, null, 2))
}

// GET /api/v1/services - Get all services
export async function GET() {
  try {
    await loadServices()
    return NextResponse.json(mockServices)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 },
    )
  }
}

// POST /api/v1/services - Create new service
export async function POST(request: NextRequest) {
  try {
    await loadServices()

    const body = await request.json()

    const name = body.name ? String(body.name).trim() : ""

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Check uniqueness (case-insensitive)
    const exists = mockServices.some(
      (s) => s.name.toLowerCase() === name.toLowerCase(),
    )
    if (exists) {
      return NextResponse.json(
        { error: "Service name already exists" },
        { status: 409 },
      )
    }

    // Create new service
    const newService = {
      id: Date.now().toString(),
      name: name,
      description: body.description || "",
      categoryId: body.categoryId || null,
      basePrice: body.basePrice ? parseFloat(body.basePrice) : 0,
      estimatedDuration: body.estimatedDuration
        ? parseInt(body.estimatedDuration)
        : 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockServices.push(newService)
    await saveServices()

    return NextResponse.json(newService, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 },
    )
  }
}
