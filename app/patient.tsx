"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { PatientDashboardData } from "@/lib/dashboard-data"

type PatientPageProps = PatientDashboardData

export default function PatientPage({
  patientName,
  appointments,
  healthMetrics,
  medications,
  medicalRecords,
  tasks,
}: PatientPageProps) {
  const [selectedMetric, setSelectedMetric] = useState<"bloodPressure" | "heartRate" | "glucose">("bloodPressure")
  const greetingName = patientName.split(" ")[0] || "there"

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userType="patient" activeItem="dashboard" />
      <div className="flex-1 flex flex-col">
        <Topbar userType="Patient" breadcrumb="Patient Portal / Dashboard" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white mb-8">
            <h1 className="text-3xl font-bold mb-2">Hello {greetingName},</h1>
            <p className="text-blue-100">Welcome to the patient portal. Here you can access your medical information and more.</p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Overview</CardTitle>
                  <CardDescription>Upcoming Appointments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appointments.map((apt, index) => (
                    <div key={`${apt.doctor}-${index}`} className="p-4 bg-blue-50 rounded-lg flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{apt.doctor}</p>
                        <div className="flex gap-4 text-sm text-gray-600 mt-1">
                          <span>📅 {apt.date}</span>
                          <span>📍 {apt.location}</span>
                        </div>
                      </div>
                      <Button variant="link" className="text-blue-600">
                        View Details
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="text-blue-600 bg-transparent">
                      💙 Book New Appointments
                    </Button>
                    <Button variant="link" className="text-blue-600">
                      View All Appointments →
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Health Metrics Over Time</CardTitle>
                  <CardDescription>7-Day Trend</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-6">
                    {(["bloodPressure", "heartRate", "glucose"] as const).map((metric) => (
                      <Button
                        key={metric}
                        variant={selectedMetric === metric ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedMetric(metric)}
                        className="capitalize"
                      >
                        {metric === "bloodPressure" && "Blood Pressure"}
                        {metric === "heartRate" && "Heart Rate"}
                        {metric === "glucose" && "Glucose"}
                      </Button>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={healthMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey={selectedMetric} stroke="#0D47F5" name={selectedMetric} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Referral / Task</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasks.map((task, index) => (
                    <div key={`${task.title}-${index}`} className="p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-600 mt-1">📅 {task.createdDate}</p>
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700">Complete</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Health Summary</CardTitle>
                  <CardDescription>Current Medication</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {medications.map((med, index) => (
                    <div key={`${med.name}-${index}`} className="flex items-start justify-between pb-3 border-b border-gray-200 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{med.name}</p>
                        <p className="text-sm text-gray-600">{med.dosage}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                  <Button variant="outline" className="w-full text-blue-600 mt-4 bg-transparent">
                    Request Refill
                  </Button>
                  <Button variant="link" className="w-full text-blue-600">
                    View All Medication →
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Medical Records</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {medicalRecords.map((record, index) => (
                    <div key={`${record.type}-${index}`} className="pb-3 border-b border-gray-200 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{record.type}</p>
                          <p className="text-xs text-gray-600">{record.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">{record.date}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.statusTone === "success" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {record.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Button variant="link" className="w-full text-blue-600 mt-2">
                    View All Medical Records →
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


