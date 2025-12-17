"use client"

import { useMemo, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { DoctorDashboardData } from "@/lib/dashboard-data"

type DoctorPageProps = DoctorDashboardData

export default function DoctorPage({
  doctorName,
  patients,
  vitalsByPatient,
  currentPrescriptions,
  previousPrescriptions,
  upcomingAppointments,
  alerts,
}: DoctorPageProps) {
  const defaultPatient =
    patients[0] ?? {
      id: 0,
      name: doctorName,
      age: 0,
      lastVisit: "N/A",
    }
  const [selectedPatient, setSelectedPatient] = useState(defaultPatient)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d")

  const vitalDataset = vitalsByPatient[selectedPatient?.id ?? -1] ?? []
  const chartData = vitalDataset.length
    ? vitalDataset
    : [
        { date: "Mon", systolic: 120, diastolic: 80, heartRate: 72 },
        { date: "Tue", systolic: 122, diastolic: 82, heartRate: 74 },
        { date: "Wed", systolic: 118, diastolic: 78, heartRate: 70 },
        { date: "Thu", systolic: 125, diastolic: 84, heartRate: 76 },
        { date: "Fri", systolic: 119, diastolic: 79, heartRate: 71 },
        { date: "Sat", systolic: 121, diastolic: 81, heartRate: 73 },
        { date: "Sun", systolic: 120, diastolic: 80, heartRate: 72 },
      ]

  const patientCards = useMemo(() => patients.slice(0, 3), [patients])

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userType="doctor" activeItem="dashboard" />
      <div className="flex-1 flex flex-col">
        <Topbar userType="Doctor" breadcrumb="Doctor Portal / Dashboard" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Select Patient</CardTitle>
                <CardDescription>Choose a patient to view their details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {patientCards.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedPatient?.id === patient.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-600 mt-1">Age: {patient.age}</p>
                      <p className="text-sm text-gray-500 mt-1">Last visit: {patient.lastVisit}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Vital Signs Over Time</CardTitle>
                    <CardDescription>Patient: {selectedPatient?.name ?? doctorName}</CardDescription>
                    <div className="flex gap-2 mt-4">
                      {(["7d", "30d", "90d"] as const).map((range) => (
                        <Button
                          key={range}
                          variant={timeRange === range ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTimeRange(range)}
                        >
                          {range === "7d" && "Last 7 Days"}
                          {range === "30d" && "Last 30 Days"}
                          {range === "90d" && "Last 90 Days"}
                        </Button>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="systolic" stroke="#0D47F5" name="Systolic BP" />
                        <Line type="monotone" dataKey="diastolic" stroke="#7C3AED" name="Diastolic BP" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {upcomingAppointments.map((apt, index) => (
                      <div key={`${apt.patientName}-${index}`} className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{apt.patientName}</p>
                            <p className="text-sm text-gray-600 mt-1">📅 {apt.date}</p>
                            <p className="text-sm text-gray-600">📋 {apt.type}</p>
                          </div>
                          <Button variant="link" className="text-blue-600">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Prescriptions</CardTitle>
                    <CardDescription>{selectedPatient?.name ?? doctorName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentPrescriptions.map((rx, index) => (
                      <div key={`${rx.drug}-${index}`} className="pb-3 border-b border-gray-200 last:border-0">
                        <p className="font-semibold text-gray-900">{rx.drug}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {rx.dose} - {rx.frequency}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Since: {rx.since}</p>
                      </div>
                    ))}
                    {!currentPrescriptions.length && (
                      <p className="text-sm text-gray-500">No active prescriptions for this doctor.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Previous Prescriptions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {previousPrescriptions.map((rx, index) => (
                      <div key={`${rx.drug}-${index}`} className="pb-3 border-b border-gray-200 last:border-0">
                        <p className="font-semibold text-gray-900">{rx.drug}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {rx.dose} - {rx.frequency}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{rx.since}</p>
                      </div>
                    ))}
                    {!previousPrescriptions.length && (
                      <p className="text-sm text-gray-500">No historical prescriptions recorded.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {alerts.map((alert, index) => (
                        <div
                          key={`${alert.message}-${index}`}
                          className={`p-3 rounded-lg border flex gap-2 ${
                            alert.tone === "warning"
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-blue-50 border-blue-200"
                          }`}
                        >
                          <AlertCircle
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              alert.tone === "warning" ? "text-yellow-600" : "text-blue-600"
                            }`}
                          />
                          <p
                            className={`text-sm ${
                              alert.tone === "warning" ? "text-yellow-800" : "text-blue-800"
                            }`}
                          >
                            {alert.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


