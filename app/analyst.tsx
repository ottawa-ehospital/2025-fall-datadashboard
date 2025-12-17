"use client"

import { useMemo, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { AnalystDashboardData } from "@/lib/dashboard-data"

type AnalystPageProps = AnalystDashboardData

export default function AnalystPage({ hospitals, kpiMetrics, summary }: AnalystPageProps) {
  const defaultHospital =
    hospitals[0] ?? {
      id: 0,
      name: "Network Wide",
      city: "Canada",
    }

  const [selectedHospital, setSelectedHospital] = useState(defaultHospital)
  const [selectedKPI, setSelectedKPI] = useState<keyof typeof kpiMetrics>("diagnosisVolume")
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "180d">("7d")

  const selectedDataset = kpiMetrics[selectedKPI]
  const metricKey = useMemo(
    () => Object.keys(selectedDataset[0] ?? {}).find((key) => key !== "date") ?? "value",
    [selectedDataset],
  )

  const displayedDataset = useMemo(() => {
    const length = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 180
    if (!selectedDataset.length) return []
    return selectedDataset.slice(-length)
  }, [selectedDataset, timeRange])

  const chartData = displayedDataset.length ? displayedDataset : selectedDataset

  const currentValue = useMemo(() => {
    if (!chartData.length) return 0
    return Number(chartData[chartData.length - 1][metricKey as keyof (typeof chartData)[number]]) || 0
  }, [chartData, metricKey])

  const previousValue = useMemo(() => {
    if (chartData.length < 2) return 0
    return Number(chartData[chartData.length - 2][metricKey as keyof (typeof chartData)[number]]) || 0
  }, [chartData, metricKey])

  const getKPILabel = (kpi: typeof selectedKPI) => {
    switch (kpi) {
      case "diagnosisVolume":
        return "Diagnosis Volume"
      case "appointmentVolume":
        return "Appointment Volume"
      case "aiAccuracy":
        return "AI Accuracy (%)"
      case "retention":
        return "Patient Retention Rate (%)"
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userType="analyst" activeItem="dashboard" />
      <div className="flex-1 flex flex-col">
        <Topbar userType="Analyst" breadcrumb="System Analyst / Dashboard" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Select Hospital</CardTitle>
                <CardDescription>Choose a hospital to view analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {hospitals.map((hospital) => (
                    <button
                      key={hospital.id}
                      onClick={() => setSelectedHospital(hospital)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedHospital.id === hospital.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{hospital.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{hospital.city}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-4 gap-4">
              {(Object.keys(kpiMetrics) as Array<keyof typeof kpiMetrics>).map((kpiKey) => (
                <button
                  key={kpiKey}
                  onClick={() => setSelectedKPI(kpiKey)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedKPI === kpiKey ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900">{getKPILabel(kpiKey)}</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{currentValue.toFixed(1)}</p>
                  <div className="flex items-center gap-1 mt-2 text-green-600 text-xs">
                    <TrendingUp className="w-4 h-4" />
                    <span>{(currentValue - previousValue).toFixed(1)}</span>
                  </div>
                </button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{getKPILabel(selectedKPI)} Trend</CardTitle>
                <CardDescription>Hospital: {selectedHospital.name}</CardDescription>
                <div className="flex gap-2 mt-4">
                  {(["7d", "30d", "180d"] as const).map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeRange(range)}
                    >
                      {range === "7d" && "Last 7 Days"}
                      {range === "30d" && "Last 30 Days"}
                      {range === "180d" && "Last 180 Days"}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => Number(value).toFixed(2)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={metricKey}
                      stroke="#0D47F5"
                      name={getKPILabel(selectedKPI)}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-gray-900">AI Accuracy</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{summary.aiAccuracy.toFixed(1)}%</p>
                    <p className="text-xs text-green-700 mt-2">Data sourced from AI diagnostics</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-gray-900">Patient Retention</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{summary.retention.toFixed(1)}%</p>
                    <p className="text-xs text-blue-700 mt-2">Completed vs total appointments</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Volume</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-gray-900">Total Diagnoses</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">{summary.diagnosesTotal}</p>
                    <p className="text-xs text-purple-700 mt-2">Aggregated from diagnosis records</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-gray-900">Total Appointments</p>
                    <p className="text-3xl font-bold text-orange-600 mt-1">{summary.appointmentsTotal}</p>
                    <p className="text-xs text-orange-700 mt-2">Scheduled encounters this period</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


