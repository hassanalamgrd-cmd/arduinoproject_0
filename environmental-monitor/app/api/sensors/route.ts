import { NextResponse } from "next/server"

// Simulate Arduino sensor data with correct moisture formula
function generateSensorData() {
  // Simulate raw analog values
  const vibrationValue = Math.floor(Math.random() * 1024)
  const soilMoistureRaw = Math.floor(Math.random() * 1023)
  const distance = 15 + Math.random() * 35 // 15-50 cm range

  // Apply moisture formula: P = 100 * (1 - v / 1023)
  const soilMoisture = 100 * (1 - soilMoistureRaw / 1023)

  // Calculate earthquake magnitude (simplified)
  const magnitude = vibrationValue > 300 ? (vibrationValue / 1024) * 6 : 0

  // Calculate water level percentage based on distance
  const maxDepth = 50 // cm
  const waterLevel = Math.max(0, ((maxDepth - distance) / maxDepth) * 100)

  // Determine statuses
  const earthquakeStatus = magnitude > 3 ? "critical" : magnitude > 1 ? "warning" : "safe"
  const irrigationStatus = soilMoisture < 15 ? "critical" : soilMoisture < 30 ? "warning" : "safe"
  const floodStatus = distance < 10 ? "critical" : distance < 20 ? "warning" : "safe"

  return {
    earthquake: {
      magnitude: magnitude,
      vibrationValue: vibrationValue,
      isVibrating: vibrationValue > 300,
      timestamp: new Date().toISOString(),
      status: earthquakeStatus,
    },
    irrigation: {
      soilMoisture: soilMoisture,
      soilMoistureRaw: soilMoistureRaw,
      temperature: 20 + Math.random() * 15, // 20-35°C
      pumpStatus: soilMoisture < 30, // Pump ON when moisture < 30%
      timestamp: new Date().toISOString(),
      status: irrigationStatus,
    },
    flood: {
      waterLevel: waterLevel,
      distance: distance,
      timestamp: new Date().toISOString(),
      status: floodStatus,
    },
  }
}

export async function GET() {
  try {
    const sensorData = generateSensorData()

    return NextResponse.json({
      success: true,
      data: sensorData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch sensor data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Process Arduino data here
    console.log("Received Arduino data:", body)

    return NextResponse.json({
      success: true,
      message: "Data received successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to process sensor data" }, { status: 500 })
  }
}
