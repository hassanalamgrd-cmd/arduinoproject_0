import { NextResponse } from "next/server"

// In-memory storage for real Arduino data
let lastArduinoData: any = null
let lastArduinoUpdate = 0
const ARDUINO_TIMEOUT = 10000 // 10 seconds timeout

// Enhanced random data generator that simulates realistic sensor behavior
function generateRealisticSensorData() {
  const now = Date.now()

  // Create more realistic fluctuations
  const baseTime = Math.floor(now / 30000) // Changes every 30 seconds
  const seed = Math.sin(baseTime) * 10000

  // Simulate soil moisture with gradual changes
  const soilMoistureRaw = Math.floor(300 + Math.sin(now / 60000) * 200 + Math.random() * 100)
  const soilMoisture = Math.max(0, Math.min(100, 100 * (1 - soilMoistureRaw / 1023)))

  // Simulate vibration with occasional spikes
  const hasVibrationSpike = Math.random() < 0.1 // 10% chance of spike
  const vibrationValue = hasVibrationSpike
    ? Math.floor(400 + Math.random() * 400)
    : Math.floor(50 + Math.random() * 200)

  // Simulate distance with realistic water level changes
  const baseDistance = 25 + Math.sin(now / 120000) * 15 // Slow changes over 2 minutes
  const distance = Math.max(5, baseDistance + (Math.random() * 10 - 5))

  // Calculate derived values
  const magnitude =
    vibrationValue > 300
      ? Math.max(0, 2 + 3.5 * Math.log10((9 * vibrationValue) / 1023 + 1))
      : Math.max(0, (vibrationValue / 1024) * 2)

  const waterLevel = Math.max(0, Math.min(100, ((50 - distance) / 50) * 100))
  const temperature = 22 + Math.sin(now / 180000) * 8 + (Math.random() * 4 - 2) // Realistic temp variation

  // Determine statuses based on realistic thresholds
  const earthquakeStatus = magnitude > 4 ? "critical" : magnitude > 2 ? "warning" : "safe"
  const irrigationStatus = soilMoisture < 15 ? "critical" : soilMoisture < 30 ? "warning" : "safe"
  const floodStatus = distance < 10 ? "critical" : distance < 20 ? "warning" : "safe"

  return {
    earthquake: {
      magnitude: Number(magnitude.toFixed(2)),
      vibrationValue: vibrationValue,
      isVibrating: vibrationValue > 300,
      timestamp: new Date().toISOString(),
      status: earthquakeStatus,
    },
    irrigation: {
      soilMoisture: Number(soilMoisture.toFixed(1)),
      soilMoistureRaw: soilMoistureRaw,
      temperature: Number(temperature.toFixed(1)),
      pumpStatus: soilMoisture < 30,
      timestamp: new Date().toISOString(),
      status: irrigationStatus,
    },
    flood: {
      waterLevel: Number(waterLevel.toFixed(1)),
      distance: Number(distance.toFixed(1)),
      timestamp: new Date().toISOString(),
      status: floodStatus,
    },
  }
}

export async function GET() {
  try {
    const now = Date.now()
    const isArduinoConnected = lastArduinoData && now - lastArduinoUpdate < ARDUINO_TIMEOUT

    let sensorData
    let dataSource = "simulated"

    if (isArduinoConnected && lastArduinoData) {
      // Use real Arduino data
      sensorData = lastArduinoData
      dataSource = "arduino"
    } else {
      // Generate realistic simulated data
      sensorData = generateRealisticSensorData()
    }

    return NextResponse.json({
      success: true,
      data: sensorData,
      timestamp: new Date().toISOString(),
      dataSource: dataSource,
      arduinoConnected: isArduinoConnected,
      lastArduinoUpdate: lastArduinoUpdate ? new Date(lastArduinoUpdate).toISOString() : null,
    })
  } catch (error) {
    console.error("Error in GET /api/sensors:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch sensor data",
        dataSource: "error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { distance, soilMoistureRaw, vibrationValue, pumpStatus, temperature, moisturePercent } = body

    const timestamp = new Date().toISOString()
    const now = Date.now()

    // Process Arduino data with proper calculations
    const vibration = Number.parseInt(vibrationValue) || 0
    const isVibrating = vibration > 300

    // Apply the magnitude formula: M = 0 if v < 10, M = 2 + 3.5 * log10((9*v/1023) + 1) if v ≥ 10
    let magnitude = 0
    if (vibration >= 10) {
      magnitude = 2 + 3.5 * Math.log10((9 * vibration) / 1023 + 1)
    }

    // Use provided moisture percentage or calculate it
    const soilRaw = Number.parseInt(soilMoistureRaw) || 0
    const soilMoisturePercent =
      moisturePercent !== undefined
        ? Number.parseFloat(moisturePercent)
        : Math.max(0, Math.min(100, 100 * (1 - soilRaw / 1023)))

    // Process distance and water level
    const dist = Number.parseFloat(distance) || 0
    const waterLevelPercent = Math.max(0, Math.min(100, ((50 - dist) / 50) * 100))

    // Determine statuses
    const earthquakeStatus = magnitude > 4 ? "critical" : magnitude > 2 ? "warning" : "safe"
    const irrigationStatus = soilMoisturePercent < 15 ? "critical" : soilMoisturePercent < 30 ? "warning" : "safe"
    const floodStatus = dist < 10 ? "critical" : dist < 20 ? "warning" : "safe"

    // Store processed Arduino data
    lastArduinoData = {
      earthquake: {
        magnitude: Number.parseFloat(magnitude.toFixed(2)),
        vibrationValue: vibration,
        isVibrating,
        timestamp,
        status: earthquakeStatus,
      },
      irrigation: {
        soilMoisture: Number.parseFloat(soilMoisturePercent.toFixed(1)),
        soilMoistureRaw: soilRaw,
        temperature: Number.parseFloat(temperature) || 25,
        pumpStatus: Boolean(pumpStatus),
        timestamp,
        status: irrigationStatus,
      },
      flood: {
        waterLevel: Number.parseFloat(waterLevelPercent.toFixed(1)),
        distance: dist,
        timestamp,
        status: floodStatus,
      },
    }

    lastArduinoUpdate = now

    console.log("📡 Arduino data received and processed:", {
      dataSource: "arduino",
      timestamp,
      earthquake: lastArduinoData.earthquake,
      irrigation: lastArduinoData.irrigation,
      flood: lastArduinoData.flood,
    })

    return NextResponse.json({
      success: true,
      message: "Arduino sensor data received and processed successfully",
      data: lastArduinoData,
      timestamp,
      dataSource: "arduino",
    })
  } catch (error) {
    console.error("Error processing Arduino data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Invalid sensor data format",
        message: "Failed to process Arduino data",
      },
      { status: 400 },
    )
  }
}
