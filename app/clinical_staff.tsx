"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle } from "lucide-react"
import type { ClinicalStaffDashboardData } from "@/lib/dashboard-data"

type ClinicalStaffProps = ClinicalStaffDashboardData

export default function ClinicalStaffPage({
  departments,
  patientsByDepartment,
  appointmentsByDepartment,
  followUpsByDepartment,
  alertsByDepartment,
  metricsByPatient,
}: ClinicalStaffProps) {
  const defaultDepartment =
    departments[0] ?? {
      id: 0,
      name: "Department",
      hospital: "Network",
      staffCount: 0,
    }
  const [selectedDepartment, setSelectedDepartment] = useState(defaultDepartment)
  const [selectedPatient, setSelectedPatient] = useState<number | null>(
    (patientsByDepartment[defaultDepartment?.id]?.[0]?.id as number | undefined) ?? null,
  )

  useEffect(() => {
    const nextPatient = patientsByDepartment[selectedDepartment?.id]?.[0]
    setSelectedPatient(nextPatient?.id ?? null)
  }, [selectedDepartment?.id])

  const patients = patientsByDepartment[selectedDepartment?.id] ?? []
  const medicalMetrics = selectedPatient ? metricsByPatient[selectedPatient] ?? [] : []
  const upcomingAppointments = appointmentsByDepartment[selectedDepartment?.id] ?? []
  const followUps = followUpsByDepartment[selectedDepartment?.id] ?? []
  const patientAlerts = alertsByDepartment[selectedDepartment?.id] ?? []

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userType="staff" activeItem="dashboard" />
      <div className="flex-1 flex flex-col">
        <Topbar userType="Clinical Staff" breadcrumb="Clinical Staff / Dashboard" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Select Department</CardTitle>
                <CardDescription>Choose a department to manage patients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDepartment(dept)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedDepartment?.id === dept.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{dept.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{dept.hospital}</p>
                      <p className="text-sm text-gray-500 mt-1">{dept.staffCount} staff members</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Patients in {selectedDepartment?.name}</CardTitle>
                    <CardDescription>Department: {selectedDepartment?.hospital}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {patients.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => setSelectedPatient(patient.id)}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            selectedPatient === patient.id
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{patient.name}</p>
                              <p className="text-sm text-gray-600 mt-1">📋 {patient.condition}</p>
                              <p className="text-sm text-gray-600">📅 {patient.admitted}</p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                patient.status === "Stable"
                                  ? "bg-green-100 text-green-800"
                                  : patient.status === "Recovery"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {patient.status}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {upcomingAppointments.map((apt, index) => (
                      <div key={`${apt.patientName}-${index}`} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{apt.patientName}</p>
                            <p className="text-sm text-gray-600 mt-1">📋 {apt.type}</p>
                            <p className="text-sm text-gray-600">🕐 {apt.date}</p>
                            <p className="text-sm text-gray-600">📍 {apt.room}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Follow-up Dates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {followUps.map((followUp, index) => (
                      <div
                        key={`${followUp.patientName}-${index}`}
                        className="p-4 bg-purple-50 rounded-lg border border-purple-200 flex items-start justify-between"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{followUp.patientName}</p>
                          <p className="text-sm text-gray-600 mt-1">📅 {followUp.followUp}</p>
                          <p className="text-sm text-gray-600">📝 {followUp.reason}</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical Data</CardTitle>
                    <CardDescription>{selectedPatient ? "Current Patient" : "Select a patient"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {medicalMetrics.map((data, index) => (
                      <div key={`${data.metric}-${index}`} className="pb-3 border-b border-gray-200 last:border-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{data.metric}</p>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              data.status === "Normal" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {data.status}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 mt-1">{data.value}</p>
                      </div>
                    ))}
                    {!medicalMetrics.length && (
                      <p className="text-sm text-gray-500">No vitals available for the selected patient.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Patient Alerts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {patientAlerts.map((alert, index) => (
                      <div
                        key={`${alert.patientName}-${index}`}
                        className={`p-3 rounded-lg flex gap-3 ${
                          alert.severity === "critical"
                            ? "bg-red-50 border border-red-200"
                            : alert.severity === "warning"
                              ? "bg-yellow-50 border border-yellow-200"
                              : "bg-blue-50 border border-blue-200"
                        }`}
                      >
                        <AlertCircle
                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            alert.severity === "critical"
                              ? "text-red-600"
                              : alert.severity === "warning"
                                ? "text-yellow-600"
                                : "text-blue-600"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium text-sm ${
                              alert.severity === "critical"
                                ? "text-red-900"
                                : alert.severity === "warning"
                                  ? "text-yellow-900"
                                  : "text-blue-900"
                            }`}
                          >
                            {alert.patientName}
                          </p>
                          <p
                            className={`text-xs mt-0.5 ${
                              alert.severity === "critical"
                                ? "text-red-800"
                                : alert.severity === "warning"
                                  ? "text-yellow-800"
                                  : "text-blue-800"
                            }`}
                          >
                            {alert.alert}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                        </div>
                      </div>
                    ))}
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


