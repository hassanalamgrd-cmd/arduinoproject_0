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
  X,
  Activity,
  Database,
} from "lucide-react"
import { useState, useEffect } from "react"
import SensorDetailModal from "../components/sensor-detail-modal"
import HistoryDetailView from "../components/history-detail-view"

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

export default function EnvironmentalMonitor() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [sensorData, setSensorData] = useState<SensorData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const [selectedSensor, setSelectedSensor] = useState<any>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [activeHistoryItem, setActiveHistoryItem] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [dataSource, setDataSource] = useState<"arduino" | "simulated" | "error">("simulated")
  const [lastArduinoUpdate, setLastArduinoUpdate] = useState<string | null>(null)
  const [systemHistory, setSystemHistory] = useState<any[]>([
    {
      id: 1,
      type: "earthquake",
      title: "Earthquake Risk Assessment",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      details: "Seismic activity monitoring initialized",
      status: "safe",
    },
    {
      id: 2,
      type: "flood",
      title: "Flood Warning Analysis",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      details: "Water level monitoring system active",
      status: "safe",
    },
    {
      id: 3,
      type: "irrigation",
      title: "Soil Moisture Check",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      details: "Irrigation system status verified",
      status: "safe",
    },
    {
      id: 4,
      type: "irrigation",
      title: "Irrigation Schedule Query",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      details: "Automatic irrigation schedule reviewed",
      status: "safe",
    },
    {
      id: 5,
      type: "emergency",
      title: "Emergency Preparedness",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      details: "Emergency protocols and backup systems checked",
      status: "safe",
    },
  ])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    fetchSensorData()
    const intervalId = setInterval(fetchSensorData, 2000) // Fetch every 2 seconds

    return () => clearInterval(intervalId)
  }, [])

  const fetchSensorData = async () => {
    try {
      const response = await fetch("/api/sensors")
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const previousData = sensorData
          setSensorData(result.data)
          setLastUpdate(new Date())
          setDataSource(result.dataSource)
          setLastArduinoUpdate(result.lastArduinoUpdate)

          // Update connection status based on data source
          if (result.dataSource === "arduino") {
            setIsConnected(true)
            setConnectionStatus("connected")
          } else {
            setIsConnected(false)
            setConnectionStatus("disconnected")
          }

          // Check for status changes and add to history
          if (previousData) {
            const newHistoryItems = []

            // Check earthquake status change
            if (previousData.earthquake.status !== result.data.earthquake.status) {
              newHistoryItems.push({
                id: Date.now() + Math.random(),
                type: "earthquake",
                title: "Earthquake Status Change",
                timestamp: new Date().toISOString(),
                details: `Magnitude: ${result.data.earthquake.magnitude} - Status changed from ${previousData.earthquake.status} to ${result.data.earthquake.status}`,
                status: result.data.earthquake.status,
              })
            }

            // Check irrigation status change
            if (previousData.irrigation.status !== result.data.irrigation.status) {
              newHistoryItems.push({
                id: Date.now() + Math.random(),
                type: "irrigation",
                title: "Irrigation Status Change",
                timestamp: new Date().toISOString(),
                details: `Soil moisture: ${result.data.irrigation.soilMoisture.toFixed(1)}% - Status: ${result.data.irrigation.status}`,
                status: result.data.irrigation.status,
              })
            }

            // Check flood status change
            if (previousData.flood.status !== result.data.flood.status) {
              newHistoryItems.push({
                id: Date.now() + Math.random(),
                type: "flood",
                title: "Flood Status Change",
                timestamp: new Date().toISOString(),
                details: `Water level at ${result.data.flood.distance.toFixed(1)}cm - Status: ${result.data.flood.status}`,
                status: result.data.flood.status,
              })
            }

            // Add data source change notification
            if (previousData && result.dataSource !== dataSource) {
              newHistoryItems.push({
                id: Date.now() + Math.random(),
                type: "system",
                title: "Data Source Changed",
                timestamp: new Date().toISOString(),
                details: `Data source switched from ${dataSource} to ${result.dataSource}`,
                status: result.dataSource === "arduino" ? "safe" : "warning",
              })
            }

            // Add new history items
            if (newHistoryItems.length > 0) {
              setSystemHistory((prev) => [...newHistoryItems, ...prev.slice(0, 20)]) // Keep last 20 items
            }
          }
        }
      } else {
        setIsConnected(false)
        setConnectionStatus("disconnected")
        setDataSource("error")
      }
    } catch (error) {
      console.error("Failed to fetch sensor data:", error)
      setIsConnected(false)
      setConnectionStatus("disconnected")
      setDataSource("error")
    }
  }

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

  const handleHistoryItemClick = (item: any) => {
    setActiveHistoryItem(item.title)
    // Add to system history if it's a new query
    const newHistoryItem = {
      id: Date.now(),
      type: item.type || "query",
      title: item.title,
      timestamp: new Date().toISOString(),
      details: `User accessed ${item.title.toLowerCase()}`,
      status: "safe",
    }
    setSystemHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]) // Keep last 10 items
  }

  const handleClearHistory = () => {
    setSystemHistory([])
    setActiveHistoryItem(null)
    setShowClearConfirm(false)
  }

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

  const getHistoryItemIcon = (type: string) => {
    switch (type) {
      case "earthquake":
        return Zap
      case "flood":
        return Waves
      case "irrigation":
        return Sprout
      case "emergency":
        return AlertTriangle
      case "system":
        return Activity
      default:
        return Clock
    }
  }

  const getHistoryStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "text-red-600"
      case "warning":
        return "text-yellow-600"
      case "safe":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getDataSourceInfo = () => {
    switch (dataSource) {
      case "arduino":
        return {
          icon: Wifi,
          text: "Arduino Connected",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        }
      case "simulated":
        return {
          icon: Database,
          text: "Simulated Data",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        }
      case "error":
        return {
          icon: WifiOff,
          text: "Connection Error",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        }
      default:
        return {
          icon: WifiOff,
          text: "Unknown Status",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        }
    }
  }

  const dataSourceInfo = getDataSourceInfo()
  const DataSourceIcon = dataSourceInfo.icon

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
          <div className="space-y-2">
            {systemHistory.map((item) => {
              const HistoryIcon = getHistoryItemIcon(item.type)
              const isActive = activeHistoryItem === item.title
              return (
                <button
                  key={item.id}
                  onClick={() => handleHistoryItemClick(item)}
                  className={`w-full p-3 text-left text-sm rounded-md transition-all duration-200 border ${
                    isActive
                      ? "bg-blue-50 border-blue-200 text-blue-900"
                      : "text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-200"
                  } lg:text-sm md:text-xs sm:p-2`}
                  title={item.details}
                >
                  <div className="flex items-start gap-2">
                    <HistoryIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${getHistoryStatusColor(item.status)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate lg:text-sm md:text-xs">
                        <span className="lg:inline md:inline sm:hidden">{item.title}</span>
                        <span className="lg:hidden md:hidden sm:inline">{item.title.split(" ")[0]}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 lg:block md:block sm:hidden">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}

            {systemHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No history available</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={systemHistory.length === 0}
            className={`w-full p-2 text-left text-sm rounded-md transition-colors flex items-center gap-2 border lg:text-sm md:text-xs ${
              systemHistory.length === 0
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-50 border-gray-300"
            }`}
          >
            <Trash2 className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Clear History</span>
            <span className="sm:hidden">Clear</span>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-full p-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2 border border-gray-300 lg:text-sm md:text-xs"
          >
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
              {/* Data Source Status */}
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full border ${dataSourceInfo.bgColor} ${dataSourceInfo.borderColor}`}
              >
                <DataSourceIcon className={`h-4 w-4 ${dataSourceInfo.color}`} />
                <span className={`text-sm font-medium ${dataSourceInfo.color} lg:inline md:inline sm:hidden`}>
                  {dataSourceInfo.text}
                </span>
                <span className={`text-xs font-medium ${dataSourceInfo.color} lg:hidden md:hidden sm:inline`}>
                  {dataSource === "arduino" ? "Live" : dataSource === "simulated" ? "Sim" : "Error"}
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

          <div className="text-sm text-gray-600 mb-6 flex flex-wrap gap-4">
            <span>Last updated: {lastUpdate ? lastUpdate.toLocaleString() : "Never"}</span>
            <span>Current time: {currentTime.toLocaleString()}</span>
            {lastArduinoUpdate && <span>Last Arduino data: {new Date(lastArduinoUpdate).toLocaleString()}</span>}
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
                      <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                        <span>Updated: {new Date(metric.timestamp).toLocaleTimeString()}</span>
                        {dataSource === "arduino" && (
                          <Badge className="text-xs bg-green-100 text-green-800 border-green-200">Live</Badge>
                        )}
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
              <p className="text-gray-600">Loading sensor data...</p>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-gray-50 p-6 lg:p-6 md:p-4 sm:p-3 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {activeHistoryItem ? (
              <HistoryDetailView activeItem={activeHistoryItem} systemHistory={systemHistory} />
            ) : (
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
                      <p className="text-lg font-medium text-gray-900 mb-2">Loading System Data</p>
                      <p className="text-sm text-gray-600">
                        Connecting to sensors and initializing monitoring system...
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
                      <p className="text-sm text-gray-600 mb-4">
                        Data source: {dataSource === "arduino" ? "Live Arduino sensors" : "Simulated data"}
                      </p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-700 font-medium">System Status: Healthy</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Sensor Detail Modal */}
      {selectedSensor && <SensorDetailModal sensor={selectedSensor} onClose={() => setSelectedSensor(null)} />}

      {/* Clear History Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Clear System History</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to clear all {systemHistory.length} history items? This will permanently remove all
              logged activities and events.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">System Settings</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Data Source Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Source Status</h3>
                <div className="space-y-4">
                  <div className={`p-4 rounded-md border ${dataSourceInfo.bgColor} ${dataSourceInfo.borderColor}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <DataSourceIcon className={`h-6 w-6 ${dataSourceInfo.color}`} />
                      <div>
                        <h4 className={`font-semibold ${dataSourceInfo.color}`}>{dataSourceInfo.text}</h4>
                        <p className="text-sm text-gray-600">
                          {dataSource === "arduino"
                            ? "Receiving live data from Arduino sensors"
                            : dataSource === "simulated"
                              ? "Using realistic simulated sensor data"
                              : "Unable to connect to data sources"}
                        </p>
                      </div>
                    </div>
                    {lastArduinoUpdate && (
                      <p className="text-xs text-gray-500 mt-2">
                        Last Arduino update: {new Date(lastArduinoUpdate).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Refresh Interval</label>
                    <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="2000">2 seconds (Current)</option>
                      <option value="5000">5 seconds</option>
                      <option value="10000">10 seconds</option>
                      <option value="30000">30 seconds</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sensor Thresholds */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sensor Thresholds</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soil Moisture Critical Level (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="15"
                      min="0"
                      max="100"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vibration Alert Threshold (0-1024)
                    </label>
                    <input
                      type="number"
                      defaultValue="300"
                      min="0"
                      max="1024"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flood Warning Distance (cm)</label>
                    <input
                      type="number"
                      defaultValue="20"
                      min="0"
                      max="100"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
                <div className="bg-gray-50 rounded-md p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Data Source:</span>
                    <span className="font-medium capitalize">{dataSource}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Update:</span>
                    <span className="font-medium">{lastUpdate ? lastUpdate.toLocaleString() : "Never"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">History Items:</span>
                    <span className="font-medium">{systemHistory.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">System Version:</span>
                    <span className="font-medium">v2.1.0</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                  Save Settings
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
