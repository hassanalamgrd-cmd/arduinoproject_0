"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  Shield,
  Sprout,
  Waves,
  Zap,
  Clock,
  Settings,
  Trash2,
  Wifi,
  WifiOff,
  Power,
  PowerOff,
} from "lucide-react"
import { useState, useEffect } from "react"
import SensorDetailModal from "./components/sensor-detail-modal"

interface SensorData {
  earthquake: {
    magnitude: number
    vibrationValue: number
    isVibrating: boolean
    timestamp: string
    status: "safe" | "warning" | "critical"
  }
  irrigation: {
    soilMoisture: number
    soilMoistureRaw: number
    temperature: number
    pumpStatus: boolean
    timestamp: string
    status: "safe" | "warning" | "critical"
  }
  flood: {
    waterLevel: number
    distance: number
    timestamp: string
    status: "safe" | "warning" | "critical"
  }
}

export default function Component() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [sensorData, setSensorData] = useState<SensorData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const [selectedSensor, setSelectedSensor] = useState<any>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const historyItems = [
    "Earthquake Risk Assessment",
    "Flood Warning Analysis",
    "Soil Moisture Check",
    "Irrigation Schedule Query",
    "Emergency Preparedness",
  ]

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch sensor data from API
  const fetchSensorData = async () => {
    try {
      const response = await fetch("/api/sensors")
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSensorData(result.data)
          setLastUpdate(new Date())
          setIsConnected(true)
          setConnectionStatus("connected")
        }
      } else {
        setIsConnected(false)
        setConnectionStatus("disconnected")
      }
    } catch (error) {
      console.error("Failed to fetch sensor data:", error)
      setIsConnected(false)
      setConnectionStatus("disconnected")
    }
  }

  // Poll for sensor data every 2 seconds
  useEffect(() => {
    fetchSensorData() // Initial fetch
    const interval = setInterval(fetchSensorData, 2000)
    return () => clearInterval(interval)
  }, [])

  const getEnvironmentalMetrics = () => {
    if (!sensorData) return []

    return [
      {
        id: "earthquake",
        label: "Earthquake Risk",
        value: `${sensorData.earthquake.magnitude.toFixed(1)} Magnitude`,
        status: sensorData.earthquake.status,
        description: sensorData.earthquake.isVibrating
          ? "⚠️ Earthquake detected!"
          : sensorData.earthquake.status === "warning"
            ? "Moderate seismic activity"
            : "Seismic activity normal",
        icon: Zap,
        color: "text-yellow-600",
        timestamp: sensorData.earthquake.timestamp,
        data: sensorData.earthquake,
        extraInfo: `Vibration: ${sensorData.earthquake.vibrationValue}/1024`,
      },
      {
        id: "irrigation",
        label: "Irrigation System",
        value: `${sensorData.irrigation.soilMoisture.toFixed(0)}% Moisture`,
        status: sensorData.irrigation.status,
        description:
          sensorData.irrigation.status === "critical"
            ? "⚠️ Soil very dry - irrigation critical!"
            : sensorData.irrigation.status === "warning"
              ? "⚠️ Soil moisture low - needs water"
              : "✅ Soil moisture adequate",
        icon: Sprout,
        color: "text-green-600",
        timestamp: sensorData.irrigation.timestamp,
        data: sensorData.irrigation,
        extraInfo: `Pump: ${sensorData.irrigation.pumpStatus ? "ON" : "OFF"} | Temp: ${sensorData.irrigation.temperature.toFixed(1)}°C`,
      },
      {
        id: "flood",
        label: "Flood Risk",
        value:
          sensorData.flood.status === "critical"
            ? "High Risk"
            : sensorData.flood.status === "warning"
              ? "Medium Risk"
              : "Low Risk",
        status: sensorData.flood.status,
        description:
          sensorData.flood.status === "critical"
            ? "🚨 Flood warning - take precautions!"
            : sensorData.flood.status === "warning"
              ? "⚠️ Elevated water levels detected"
              : "✅ Water levels normal",
        icon: Waves,
        color: "text-blue-600",
        timestamp: sensorData.flood.timestamp,
        data: sensorData.flood,
        extraInfo: `Distance: ${sensorData.flood.distance.toFixed(1)}cm | Level: ${sensorData.flood.waterLevel.toFixed(1)}%`,
      },
    ]
  }

  const environmentalMetrics = getEnvironmentalMetrics()
  const hasAlerts = environmentalMetrics.some((metric) => metric.status === "critical")

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "safe":
        return "bg-green-100 text-green-800 border-green-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIndicatorClass = (status: string) => {
    switch (status) {
      case "safe":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-600"
      case "connecting":
        return "text-yellow-600"
      case "disconnected":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col lg:w-64 md:w-48 sm:w-40">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 lg:text-lg md:text-base sm:text-sm">
            <Clock className="h-5 w-5 lg:h-5 lg:w-5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">System History</span>
            <span className="sm:hidden">History</span>
          </h2>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {historyItems.map((item, index) => (
            <button
              key={index}
              className="w-full p-3 mb-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors lg:text-sm md:text-xs sm:p-2"
              title={item}
            >
              <span className="lg:inline md:inline sm:hidden">{item}</span>
              <span className="lg:hidden md:hidden sm:inline">{item.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <button className="w-full p-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2 border border-gray-300 lg:text-sm md:text-xs">
            <Trash2 className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Clear History</span>
            <span className="sm:hidden">Clear</span>
          </button>
          <button className="w-full p-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2 border border-gray-300 lg:text-sm md:text-xs">
            <Settings className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">Config</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Dashboard */}
        <div className="bg-white border-b border-gray-200 p-6 lg:p-6 md:p-4 sm:p-3">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h1 className="text-2xl font-bold text-gray-900 lg:text-2xl md:text-xl sm:text-lg">
              Environmental Monitoring System
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              {/* Connection Status */}
              <div className={`flex items-center gap-2 ${getConnectionStatusColor()}`}>
                {isConnected ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
                <span className="text-sm font-medium lg:inline md:inline sm:hidden">
                  {connectionStatus === "connected"
                    ? "Arduino Connected"
                    : connectionStatus === "connecting"
                      ? "Connecting..."
                      : "Arduino Disconnected"}
                </span>
                <span className="text-xs font-medium lg:hidden md:hidden sm:inline">
                  {connectionStatus === "connected" ? "Connected" : "Offline"}
                </span>
              </div>

              {hasAlerts && (
                <div className="flex items-center gap-2 text-red-600 font-semibold">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="lg:inline md:inline sm:hidden">Critical Alerts Active</span>
                  <span className="lg:hidden md:hidden sm:inline">Alerts</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-6">
            Last updated: {lastUpdate ? lastUpdate.toLocaleString() : "Never"} | Current time:{" "}
            {currentTime.toLocaleString()}
          </div>

          {/* Metrics Grid */}
          {sensorData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {environmentalMetrics.map((metric) => {
                const IconComponent = metric.icon
                const isHovered = hoveredCard === metric.id
                return (
                  <Card
                    key={metric.id}
                    className={`relative border border-gray-200 transition-all duration-300 cursor-pointer
                      ${isHovered ? "shadow-lg scale-105 z-10" : "hover:shadow-md"}
                    `}
                    onMouseEnter={() => setHoveredCard(metric.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => setSelectedSensor(metric)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-sm font-medium">
                          <IconComponent className={`h-5 w-5 ${metric.color}`} />
                          {metric.label}
                          {metric.id === "irrigation" && (
                            <div className="ml-2">
                              {metric.data.pumpStatus ? (
                                <Power className="h-4 w-4 text-blue-600" title="Pump Running" />
                              ) : (
                                <PowerOff className="h-4 w-4 text-gray-400" title="Pump Off" />
                              )}
                            </div>
                          )}
                        </CardTitle>
                        <Badge className={`text-xs font-medium border ${getStatusBadgeClass(metric.status)}`}>
                          {metric.status === "safe" ? "Safe" : metric.status === "warning" ? "Warning" : "Critical"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold text-gray-900 mb-1">{metric.value}</div>
                      <div className="text-sm text-gray-600 mb-2">{metric.description}</div>
                      {metric.extraInfo && <div className="text-xs text-gray-500">{metric.extraInfo}</div>}
                      <div className="text-xs text-gray-400 mt-2">
                        Updated: {new Date(metric.timestamp).toLocaleTimeString()}
                      </div>
                      {isHovered && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-md">
                          <span className="text-sm font-medium text-gray-700">Click for details</span>
                        </div>
                      )}
                    </CardContent>
                    <div
                      className={`absolute top-0 right-0 w-1 h-full rounded-r-md ${getStatusIndicatorClass(metric.status)}`}
                    />
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Waiting for Arduino sensor data...</p>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-gray-50 p-6 lg:p-6 md:p-4 sm:p-3 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  System Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!sensorData ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <WifiOff className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">Waiting for Arduino Connection</p>
                    <p className="text-sm text-gray-600">
                      Make sure your Arduino is connected and sending sensor data to the API endpoints.
                    </p>
                  </div>
                ) : hasAlerts ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">Critical Alerts Detected</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Immediate attention required for environmental conditions
                    </p>
                    <div className="space-y-2">
                      {environmentalMetrics
                        .filter((metric) => metric.status === "critical")
                        .map((metric) => (
                          <div
                            key={metric.id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full border border-red-200 mx-1"
                          >
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-red-700 font-medium">
                              {metric.label}: {metric.description}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <Shield className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">All systems operating normally</p>
                    <p className="text-sm text-gray-600 mb-4">No active alerts or warnings detected</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-700 font-medium">System Status: Healthy</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sensor Detail Modal */}
      {selectedSensor && <SensorDetailModal sensor={selectedSensor} onClose={() => setSelectedSensor(null)} />}
    </div>
  )
}
