"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, TrendingUp, Clock, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"

interface SensorDetailModalProps {
  sensor: any
  onClose: () => void
}

export default function SensorDetailModal({ sensor, onClose }: SensorDetailModalProps) {
  const [historicalData, setHistoricalData] = useState<any[]>([])

  useEffect(() => {
    // Simulate historical data - in real app, fetch from API
    const generateHistoricalData = () => {
      const data = []
      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(Date.now() - i * 60 * 60 * 1000)
        data.push({
          timestamp: timestamp.toISOString(),
          value: Math.random() * 100,
          status: Math.random() > 0.8 ? "warning" : "safe",
        })
      }
      setHistoricalData(data)
    }
    generateHistoricalData()
  }, [])

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

  const getDetailedInfo = () => {
    switch (sensor.id) {
      case "earthquake":
        return {
          title: "Earthquake Monitoring Details",
          metrics: [
            { label: "Current Magnitude", value: `${sensor.data.magnitude.toFixed(2)}` },
            { label: "Raw Vibration Value", value: `${sensor.data.vibrationValue}/1024` },
            { label: "Vibration Status", value: sensor.data.isVibrating ? "Active" : "Stable" },
            { label: "Last Detection", value: new Date(sensor.data.timestamp).toLocaleString() },
          ],
          thresholds: [
            { label: "Safe Range", value: "0.0 - 2.9 Magnitude" },
            { label: "Warning Range", value: "3.0 - 4.9 Magnitude" },
            { label: "Critical Range", value: "5.0+ Magnitude" },
            { label: "Vibration Threshold", value: "300/1024" },
          ],
        }
      case "irrigation":
        return {
          title: "Irrigation System Details",
          metrics: [
            { label: "Soil Moisture", value: `${sensor.data.soilMoisture.toFixed(1)}%` },
            { label: "Raw Sensor Value", value: `${sensor.data.soilMoistureRaw}/1023` },
            { label: "Temperature", value: `${sensor.data.temperature.toFixed(1)}°C` },
            { label: "Pump Status", value: sensor.data.pumpStatus ? "Running" : "Stopped" },
          ],
          thresholds: [
            { label: "Optimal Range", value: "50-80% Moisture" },
            { label: "Warning Range", value: "15-30% Moisture" },
            { label: "Critical Range", value: "< 15% Moisture" },
            { label: "Pump Activation", value: "< 30% Moisture" },
          ],
        }
      case "flood":
        return {
          title: "Flood Monitoring Details",
          metrics: [
            { label: "Water Level", value: `${sensor.data.waterLevel.toFixed(1)}%` },
            { label: "Distance Reading", value: `${sensor.data.distance.toFixed(1)} cm` },
            {
              label: "Risk Level",
              value: sensor.status === "critical" ? "High" : sensor.status === "warning" ? "Medium" : "Low",
            },
            { label: "Last Reading", value: new Date(sensor.data.timestamp).toLocaleString() },
          ],
          thresholds: [
            { label: "Safe Range", value: "> 20 cm distance" },
            { label: "Warning Range", value: "10-20 cm distance" },
            { label: "Critical Range", value: "< 10 cm distance" },
            { label: "Max Depth", value: "50 cm" },
          ],
        }
      default:
        return { title: "Sensor Details", metrics: [], thresholds: [] }
    }
  }

  const detailInfo = getDetailedInfo()
  const IconComponent = sensor.icon

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconComponent className={`h-6 w-6 ${sensor.color}`} />
            <h2 className="text-xl font-bold text-gray-900">{detailInfo.title}</h2>
            <Badge className={`text-xs font-medium border ${getStatusBadgeClass(sensor.status)}`}>
              {sensor.status === "safe" ? "Safe" : sensor.status === "warning" ? "Warning" : "Critical"}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Current Reading</h4>
                  <p className="text-2xl font-bold text-gray-900">{sensor.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{sensor.description}</p>
                  {sensor.extraInfo && <p className="text-xs text-gray-500 mt-2">{sensor.extraInfo}</p>}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
                  <p className="text-lg text-gray-700">{new Date(sensor.timestamp).toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {Math.round((Date.now() - new Date(sensor.timestamp).getTime()) / 1000)} seconds ago
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detailInfo.metrics.map((metric, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{metric.label}</span>
                      <span className="font-medium text-gray-900">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Thresholds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detailInfo.thresholds.map((threshold, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{threshold.label}</span>
                      <span className="font-medium text-gray-900">{threshold.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historical Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                24-Hour Trend (Simulated)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-50 rounded-md flex items-end justify-between p-2">
                {historicalData.slice(-12).map((point, index) => (
                  <div
                    key={index}
                    className={`w-6 rounded-t-sm ${point.status === "warning" ? "bg-yellow-400" : "bg-green-400"}`}
                    style={{ height: `${Math.max(10, point.value)}%` }}
                    title={`${new Date(point.timestamp).toLocaleTimeString()}: ${point.value.toFixed(1)}`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>12h ago</span>
                <span>6h ago</span>
                <span>Now</span>
              </div>
            </CardContent>
          </Card>

          {/* Alert Information */}
          {sensor.status !== "safe" && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  Active Alert Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-700 mb-2">{sensor.description}</p>
                <div className="text-sm text-yellow-600">
                  <p>
                    <strong>Recommended Actions:</strong>
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {sensor.id === "earthquake" && (
                      <>
                        <li>Monitor for aftershocks</li>
                        <li>Check structural integrity</li>
                        <li>Prepare emergency supplies</li>
                      </>
                    )}
                    {sensor.id === "irrigation" && (
                      <>
                        <li>Check irrigation system operation</li>
                        <li>Verify water supply</li>
                        <li>Monitor plant health</li>
                      </>
                    )}
                    {sensor.id === "flood" && (
                      <>
                        <li>Monitor water levels closely</li>
                        <li>Prepare evacuation routes</li>
                        <li>Move valuables to higher ground</li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
