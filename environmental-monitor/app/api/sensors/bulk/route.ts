import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Process bulk Arduino sensor data
    console.log("Received bulk Arduino data:", body)

    // Here you would typically save to database
    // For now, just acknowledge receipt

    return NextResponse.json({
      success: true,
      message: "Bulk data received successfully",
      recordsProcessed: Array.isArray(body) ? body.length : 1,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error processing bulk data:", error)
    return NextResponse.json({ success: false, error: "Failed to process bulk sensor data" }, { status: 500 })
  }
}
