"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Zap, Waves, Sprout, AlertTriangle, TrendingUp, Activity } from "lucide-react"

interface HistoryDetailViewProps {
  activeItem: string | null
  systemHistory: any[]
}

export default function HistoryDetailView({ activeItem, systemHistory }: HistoryDetailViewProps) {
  if (!activeItem) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            System Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-900 mb-2">Select a history item</p>
            <p className="text-sm text-gray-600">Click on any item in the history panel to view detailed information</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const relatedItems = systemHistory
    .filter(
      (item) =>
        item.title.toLowerCase().includes(activeItem.toLowerCase()) ||
        activeItem.toLowerCase().includes(item.title.toLowerCase()),
    )
    .slice(0, 5)

  const getItemIcon = (type: string) => {
    switch (type) {
      case "earthquake":
        return Zap
      case "flood":
        return Waves
      case "irrigation":
        return Sprout
      case "emergency":
        return AlertTriangle
      default:
        return Clock
    }
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

  const getDetailedContent = () => {
    const lowerActiveItem = activeItem.toLowerCase()

    if (lowerActiveItem.includes("earthquake")) {
      return {
        title: "Earthquake Risk Assessment",
        description: "Monitor seismic activity and earthquake risk levels in real-time",
        metrics: [
          { label: "Current Magnitude", value: "2.1", status: "warning" },
          { label: "Vibration Threshold", value: "300/1024", status: "safe" },
          { label: "Last Detection", value: "2 hours ago", status: "warning" },
          { label: "Risk Level", value: "Moderate", status: "warning" },
        ],
        recommendations: [
          "Monitor structural integrity of buildings",
          "Check emergency supply kits",
          "Review evacuation procedures",
          "Ensure communication devices are charged",
        ],
      }
    } else if (lowerActiveItem.includes("flood")) {
      return {
        title: "Flood Warning Analysis",
        description: "Track water levels and flood risk assessment",
        metrics: [
          { label: "Water Level", value: "15.2 cm", status: "warning" },
          { label: "Risk Assessment", value: "Medium", status: "warning" },
          { label: "Trend", value: "Rising", status: "warning" },
          { label: "Alert Status", value: "Active", status: "warning" },
        ],
        recommendations: [
          "Monitor water levels continuously",
          "Prepare sandbags if available",
          "Move valuables to higher ground",
          "Check drainage systems",
        ],
      }
    } else if (lowerActiveItem.includes("irrigation") || lowerActiveItem.includes("soil")) {
      return {
        title: "Irrigation System Management",
        description: "Monitor soil moisture levels and irrigation system status",
        metrics: [
          { label: "Soil Moisture", value: "25.3%", status: "warning" },
          { label: "Pump Status", value: "Active", status: "safe" },
          { label: "Temperature", value: "28.5°C", status: "safe" },
          { label: "Last Watering", value: "30 minutes ago", status: "safe" },
        ],
        recommendations: [
          "Continue monitoring soil moisture",
          "Check irrigation system for clogs",
          "Verify water supply levels",
          "Adjust watering schedule if needed",
        ],
      }
    } else if (lowerActiveItem.includes("emergency")) {
      return {
        title: "Emergency Preparedness",
        description: "System backup and emergency protocol verification",
        metrics: [
          { label: "System Status", value: "Operational", status: "safe" },
          { label: "Backup Power", value: "Available", status: "safe" },
          { label: "Communication", value: "Online", status: "safe" },
          { label: "Last Check", value: "12 hours ago", status: "safe" },
        ],
        recommendations: [
          "Test emergency communication systems",
          "Verify backup power systems",
          "Review emergency contact list",
          "Check emergency supply inventory",
        ],
      }
    } else {
      return {
        title: "System Query",
        description: "General system information and status",
        metrics: [
          { label: "System Health", value: "Good", status: "safe" },
          { label: "Active Sensors", value: "3/3", status: "safe" },
          { label: "Data Quality", value: "High", status: "safe" },
          { label: "Uptime", value: "99.8%", status: "safe" },
        ],
        recommendations: [
          "Continue regular monitoring",
          "Review system logs periodically",
          "Maintain sensor calibration",
          "Update system software as needed",
        ],
      }
    }
  }

  const content = getDetailedContent()
  const IconComponent = getItemIcon(
    content.title.toLowerCase().includes("earthquake")
      ? "earthquake"
      : content.title.toLowerCase().includes("flood")
        ? "flood"
        : content.title.toLowerCase().includes("irrigation")
          ? "irrigation"
          : "emergency",
  )

  return (
    <div className="space-y-6">
      {/* Main Content Card */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconComponent className="h-5 w-5 text-blue-600" />
            {content.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">{content.description}</p>

          {/* Current Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {content.metrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{metric.value}</span>
                  <Badge className={`text-xs ${getStatusBadgeClass(metric.status)}`}>{metric.status}</Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
            <ul className="space-y-2">
              {content.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Related History Items */}
      {relatedItems.length > 0 && (
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Related Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relatedItems.map((item) => {
                const ItemIcon = getItemIcon(item.type)
                return (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                    <ItemIcon className="h-4 w-4 mt-0.5 text-gray-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-gray-900 text-sm truncate">{item.title}</h5>
                        <Badge className={`text-xs ml-2 ${getStatusBadgeClass(item.status)}`}>{item.status}</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{item.details}</p>
                      <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
