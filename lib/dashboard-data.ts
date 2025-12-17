const API_BASE = "https://aetab8pjmb.us-east-1.awsapprunner.com/table"

type ApiResponse<T> = {
  data?: T[]
}

type ClinicRecord = {
  clinic_id: number
  clinic_name: string
  location: string
  active: boolean
}

type DoctorRecord = {
  doctor_id: number
  name: string
  clinic_id: number
  specialty?: string | null
}

type AppointmentRecord = {
  appointment_id: number
  patient_id: number
  doctor_id: number
  datetime: string | null
  status: string
}

type DiagnosisRecord = {
  diagnosis_id: number
  doctor_id: number
  diagnosis_date: string
}

type AiDiagnosticRecord = {
  confidence_score: number | null
  created_at: string | null
}

type PatientRecord = {
  patient_id: number
  name: string
  dob?: string | null
}

type MedicalHistoryRecord = {
  patient_id: number
  condition: string
  status: string
  severity?: string
  followup_required?: boolean
  diagnosis_date?: string
}

type VitalRecord = {
  patient_id: number
  blood_pressure: string | null
  heart_rate: number | null
  temperature: number | null
  respiratory_rate: number | null
  recorded_on: string | null
}

type PrescriptionRecord = {
  patient_id: number
  doctor_id: number
  medicine_name: string
  dosage: string | null
  start_date: string | null
  end_date: string | null
  status: string
  issued_on: string | null
}

type LabTestRecord = {
  patient_id: number
  test_type: string
  status: string
  result: string
  test_date: string
}

type ClinicHelpRecord = {
  clinic_id: number
  issue_description: string
  submitted_by: string
}

type BloodTestRecord = {
  patient_id: number
  test_name: string
  result_value: string
  test_date: string
}

type DoctorTaskRecord = {
  doctor_id: number
  description: string
  status: string
  due_date: string
}

type PatientMessageHubRecord = {
  patient_id: number
  summary: string
  last_updated: string
}

async function fetchTable<T>(table: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_BASE}/${table}`, { cache: "no-store" })
    if (!res.ok) {
      throw new Error(`Failed to fetch ${table}`)
    }
    const body = (await res.json()) as ApiResponse<T>
    return Array.isArray(body?.data) ? body.data : []
  } catch (error) {
    console.error(`[fetchTable] ${table}`, error)
    return []
  }
}

const formatShortDate = (value: Date) =>
  Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(value)

const formatDateTime = (value: Date) =>
  Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value)

const toDate = (value: string | null | undefined): Date | null => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const ensureTrend = <T extends { date: string }>(
  points: T[],
  fallbackFactory: () => T[],
) => (points.length ? points : fallbackFactory())

export type HospitalOption = {
  id: number
  name: string
  city: string
}

type TrendPoint<Key extends string> = {
  date: string
} & Record<Key, number>

export type AnalystKPIs = {
  diagnosisVolume: TrendPoint<"volume">[]
  appointmentVolume: TrendPoint<"appointments">[]
  aiAccuracy: TrendPoint<"accuracy">[]
  retention: TrendPoint<"retention">[]
}

export type AnalystSummary = {
  aiAccuracy: number
  retention: number
  diagnosesTotal: number
  appointmentsTotal: number
}

export type AnalystDashboardData = {
  hospitals: HospitalOption[]
  kpiMetrics: AnalystKPIs
  summary: AnalystSummary
}

export async function getAnalystDashboardData(): Promise<AnalystDashboardData> {
  const [clinics, diagnoses, appointments, aiDiagnostics] = await Promise.all([
    fetchTable<ClinicRecord>("clinic_servicehistory"),
    fetchTable<DiagnosisRecord>("diagnosis"),
    fetchTable<AppointmentRecord>("appointments"),
    fetchTable<AiDiagnosticRecord>("ai_diagnostics"),
  ])

  const hospitals: HospitalOption[] = (clinics.length ? clinics : []).map((clinic) => ({
    id: clinic.clinic_id,
    name: clinic.clinic_name ?? `Clinic ${clinic.clinic_id}`,
    city: clinic.location ?? "Unknown",
  }))

  const MAX_POINTS = 180

  const dailyCount = <Key extends string>(
    records: { date: string | null }[],
    valueKey: Key,
  ): TrendPoint<Key>[] => {
    const map = new Map<string, number>()
    records.forEach((record) => {
      const date = toDate(record.date)
      if (!date) return
      const label = formatShortDate(date)
      map.set(label, (map.get(label) ?? 0) + 1)
    })
    const sorted = Array.from(map.entries()).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    const limited = sorted.slice(-MAX_POINTS)
    return limited.map(([date, value]) => ({ date, [valueKey]: value }) as TrendPoint<Key>)
  }

  const diagnosisVolume = dailyCount(
    diagnoses.map((d) => ({ date: d.diagnosis_date })),
    "volume",
  )

  const appointmentVolume = dailyCount(
    appointments
      .filter((apt) => apt.datetime)
      .map((apt) => ({ date: apt.datetime! })),
    "appointments",
  )

  const aiAccuracy = (() => {
    const map = new Map<string, { sum: number; count: number }>()
    aiDiagnostics.forEach((record) => {
      if (record.confidence_score == null || !record.created_at) return
      const label = formatShortDate(new Date(record.created_at))
      const entry = map.get(label) ?? { sum: 0, count: 0 }
      entry.sum += record.confidence_score * 100
      entry.count += 1
      map.set(label, entry)
    })
    const sorted = Array.from(map.entries()).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    const limited = sorted.slice(-MAX_POINTS)
    return limited
      .map(
        ([date, { sum, count }]) =>
          ({
            date,
            accuracy: count ? Number((sum / count).toFixed(1)) : 0,
          }) satisfies TrendPoint<"accuracy">,
      )
  })()

  const retention = (() => {
    const map = new Map<string, { total: number; completed: number }>()
    appointments.forEach((apt) => {
      if (!apt.datetime) return
      const label = formatShortDate(new Date(apt.datetime))
      const entry = map.get(label) ?? { total: 0, completed: 0 }
      entry.total += 1
      if (apt.status?.toLowerCase() === "completed") {
        entry.completed += 1
      }
      map.set(label, entry)
    })
    const sorted = Array.from(map.entries()).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    const limited = sorted.slice(-MAX_POINTS)
    return limited
      .map(([date, { total, completed }]) => {
        const percent = total ? Number(((completed / total) * 100).toFixed(1)) : 0
        return { date, retention: percent } satisfies TrendPoint<"retention">
      })
  })()

  const fallbackTrend = <Key extends string>(key: Key): TrendPoint<Key>[] =>
    (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const).map(
      (day) =>
        ({
          date: day,
          [key]: 1,
        }) as TrendPoint<Key>,
    )

  const accuracyFallback = () =>
    fallbackTrend("accuracy").map(
      (point) =>
        ({
          ...point,
          accuracy: 90 + point.accuracy,
        }) as TrendPoint<"accuracy">,
    )

  const retentionFallback = () =>
    fallbackTrend("retention").map(
      (point) =>
        ({
          ...point,
          retention: 85 + point.retention,
        }) as TrendPoint<"retention">,
    )

  const kpiMetrics: AnalystKPIs = {
    diagnosisVolume: ensureTrend(diagnosisVolume, () => fallbackTrend("volume")),
    appointmentVolume: ensureTrend(appointmentVolume, () => fallbackTrend("appointments")),
    aiAccuracy: ensureTrend(aiAccuracy, accuracyFallback),
    retention: ensureTrend(retention, retentionFallback),
  }

  const summary: AnalystSummary = {
    aiAccuracy: kpiMetrics.aiAccuracy.at(-1)?.accuracy ?? 0,
    retention: kpiMetrics.retention.at(-1)?.retention ?? 0,
    diagnosesTotal: kpiMetrics.diagnosisVolume.reduce((sum, point) => sum + point.volume, 0),
    appointmentsTotal: kpiMetrics.appointmentVolume.reduce((sum, point) => sum + point.appointments, 0),
  }

  return {
    hospitals: hospitals.length ? hospitals : [{ id: 0, name: "Network Wide", city: "Canada" }],
    kpiMetrics,
    summary,
  }
}

export type DepartmentInfo = {
  id: number
  name: string
  hospital: string
  staffCount: number
}

export type DepartmentPatient = {
  id: number
  name: string
  admitted: string
  condition: string
  status: "Stable" | "Recovery" | "Monitoring"
}

export type AppointmentCard = {
  patientName: string
  type: string
  date: string
  room: string
}

export type FollowUpCard = {
  patientName: string
  followUp: string
  reason: string
}

export type AlertCard = {
  patientName: string
  alert: string
  severity: "critical" | "warning" | "info"
  time: string
}

export type MetricBlock = {
  metric: string
  value: string
  status: "Normal" | "Review"
}

export type ClinicalStaffDashboardData = {
  departments: DepartmentInfo[]
  patientsByDepartment: Record<number, DepartmentPatient[]>
  appointmentsByDepartment: Record<number, AppointmentCard[]>
  followUpsByDepartment: Record<number, FollowUpCard[]>
  alertsByDepartment: Record<number, AlertCard[]>
  metricsByPatient: Record<number, MetricBlock[]>
}

const statusLabel = (value: string): DepartmentPatient["status"] => {
  const normalized = value.toLowerCase()
  if (normalized.includes("resolve")) return "Stable"
  if (normalized.includes("chronic")) return "Recovery"
  return "Monitoring"
}

const metricStatus = (label: string, value: number): MetricBlock["status"] => {
  if (label === "Heart Rate") {
    return value >= 60 && value <= 100 ? "Normal" : "Review"
  }
  if (label === "Temperature") {
    return value >= 36 && value <= 37.5 ? "Normal" : "Review"
  }
  return "Normal"
}

export async function getClinicalStaffDashboardData(): Promise<ClinicalStaffDashboardData> {
  const [
    clinics,
    staff,
    doctors,
    appointments,
    patients,
    history,
    vitals,
    helpTickets,
  ] = await Promise.all([
    fetchTable<ClinicRecord>("clinic_servicehistory"),
    fetchTable<{ clinic_id: number }>("clinical_staff_registration"),
    fetchTable<DoctorRecord>("doctors_registration"),
    fetchTable<AppointmentRecord>("appointments"),
    fetchTable<PatientRecord>("patients_registration"),
    fetchTable<MedicalHistoryRecord>("medical_history"),
    fetchTable<VitalRecord>("vitals_history"),
    fetchTable<ClinicHelpRecord>("clinic_help"),
  ])

  const staffCounts = staff.reduce<Record<number, number>>((acc, entry) => {
    if (!entry.clinic_id) return acc
    acc[entry.clinic_id] = (acc[entry.clinic_id] ?? 0) + 1
    return acc
  }, {})

  const activeClinics = clinics.filter((clinic) => clinic.active)
  const departments = (activeClinics.length ? activeClinics : clinics).slice(0, 3).map((clinic) => ({
    id: clinic.clinic_id,
    name: clinic.clinic_name ?? `Clinic ${clinic.clinic_id}`,
    hospital: clinic.location ?? "Regional",
    staffCount: staffCounts[clinic.clinic_id] ?? 0,
  }))

  const doctorClinicMap = doctors.reduce<Record<number, number>>((acc, doctor) => {
    if (doctor.doctor_id && doctor.clinic_id) {
      acc[doctor.doctor_id] = doctor.clinic_id
    }
    return acc
  }, {})

  const patientMap = patients.reduce<Record<number, PatientRecord>>((acc, patient) => {
    acc[patient.patient_id] = patient
    return acc
  }, {})

  const historyMap = history.reduce<Record<number, MedicalHistoryRecord>>((acc, entry) => {
    acc[entry.patient_id] = entry
    return acc
  }, {})

  const patientsByDepartment: Record<number, DepartmentPatient[]> = {}
  const appointmentsByDepartment: Record<number, AppointmentCard[]> = {}
  const followUpsByDepartment: Record<number, FollowUpCard[]> = {}
  const alertsByDepartment: Record<number, AlertCard[]> = {}
  const metricsByPatient: Record<number, MetricBlock[]> = {}

  const vitalsByPatient = vitals.reduce<Record<number, VitalRecord[]>>((acc, entry) => {
    if (!entry.patient_id) return acc
    acc[entry.patient_id] = acc[entry.patient_id] ?? []
    acc[entry.patient_id].push(entry)
    return acc
  }, {})

  departments.forEach((dept) => {
    patientsByDepartment[dept.id] = []
    appointmentsByDepartment[dept.id] = []
    followUpsByDepartment[dept.id] = []
    alertsByDepartment[dept.id] = []
  })

  const deptRoom = (clinicId: number) => {
    const clinic = clinics.find((c) => c.clinic_id === clinicId)
    return clinic ? `${clinic.clinic_name} Wing` : "Care Suite"
  }

  appointments.forEach((appointment) => {
    const clinicId = doctorClinicMap[appointment.doctor_id]
    if (!clinicId || !patientsByDepartment[clinicId]) return
    const details = patientMap[appointment.patient_id]
    if (!details) return

    const patientList = patientsByDepartment[clinicId]
    if (!patientList.find((p) => p.id === appointment.patient_id)) {
      const medical = historyMap[appointment.patient_id]
      patientList.push({
        id: appointment.patient_id,
        name: details.name,
        admitted: formatShortDate(toDate(appointment.datetime) ?? new Date()),
        condition: medical?.condition ?? "General Care",
        status: medical ? statusLabel(medical.status) : "Monitoring",
      })
    }

    const isFuture = (() => {
      const date = toDate(appointment.datetime)
      return date ? date.getTime() >= Date.now() : false
    })()

    if (isFuture && appointmentsByDepartment[clinicId].length < 3) {
      appointmentsByDepartment[clinicId].push({
        patientName: details.name,
        type: appointment.status,
        date: formatDateTime(toDate(appointment.datetime) ?? new Date()),
        room: deptRoom(clinicId),
      })
    }
  })

  departments.forEach((dept) => {
    const followUps = history.filter(
      (record) =>
        record.followup_required &&
        patientsByDepartment[dept.id].some((patient) => patient.id === record.patient_id),
    )

    followUpsByDepartment[dept.id] = followUps.slice(0, 3).map((record) => ({
      patientName: patientMap[record.patient_id]?.name ?? `Patient ${record.patient_id}`,
      followUp: record.diagnosis_date ? formatShortDate(new Date(record.diagnosis_date)) : "Pending",
      reason: `${record.condition} • ${record.severity ?? "Review"}`,
    }))

    const deptTickets = helpTickets.filter((ticket) => ticket.clinic_id === dept.id).slice(0, 3)
    alertsByDepartment[dept.id] = (deptTickets.length ? deptTickets : helpTickets.slice(0, 3)).map(
      (ticket, index) => ({
        patientName: ticket.submitted_by,
        alert: ticket.issue_description,
        severity: ticket.issue_description.toLowerCase().includes("emergency")
          ? "critical"
          : index === 0
            ? "warning"
            : "info",
        time: `${15 * (index + 1)} min ago`,
      }),
    )
  })

  Object.entries(vitalsByPatient).forEach(([patientId, records]) => {
    const latest = records.sort(
      (a, b) => (toDate(b.recorded_on)?.getTime() ?? 0) - (toDate(a.recorded_on)?.getTime() ?? 0),
    )[0]
    if (!latest) return

    const metrics: MetricBlock[] = []
    if (latest.blood_pressure) {
      metrics.push({
        metric: "Blood Pressure",
        value: latest.blood_pressure,
        status: "Normal",
      })
    }
    if (typeof latest.heart_rate === "number") {
      metrics.push({
        metric: "Heart Rate",
        value: `${latest.heart_rate} bpm`,
        status: metricStatus("Heart Rate", latest.heart_rate),
      })
    }
    if (typeof latest.temperature === "number") {
      metrics.push({
        metric: "Temperature",
        value: `${latest.temperature.toFixed(1)}°C`,
        status: metricStatus("Temperature", latest.temperature),
      })
    }
    if (typeof latest.respiratory_rate === "number") {
      metrics.push({
        metric: "Respiratory Rate",
        value: `${latest.respiratory_rate} rpm`,
        status: "Normal",
      })
    }

    metricsByPatient[Number(patientId)] = metrics.length
      ? metrics
      : [
          {
            metric: "No vitals available",
            value: "Awaiting data",
            status: "Review",
          },
        ]
  })

  return {
    departments,
    patientsByDepartment,
    appointmentsByDepartment,
    followUpsByDepartment,
    alertsByDepartment,
    metricsByPatient,
  }
}

export type DoctorPatientCard = {
  id: number
  name: string
  age: number
  lastVisit: string
}

export type VitalTrendPoint = {
  date: string
  systolic: number
  diastolic: number
  heartRate: number
}

export type DoctorPrescriptionCard = {
  drug: string
  dose: string
  frequency: string
  since: string
}

export type DoctorAppointmentCard = {
  patientName: string
  date: string
  type: string
}

export type DoctorAlert = {
  message: string
  tone: "warning" | "info"
}

export type DoctorDashboardData = {
  doctorName: string
  patients: DoctorPatientCard[]
  vitalsByPatient: Record<number, VitalTrendPoint[]>
  currentPrescriptions: DoctorPrescriptionCard[]
  previousPrescriptions: DoctorPrescriptionCard[]
  upcomingAppointments: DoctorAppointmentCard[]
  alerts: DoctorAlert[]
}

const parseBloodPressure = (value: string | null) => {
  if (!value) return null
  const [systolic, diastolic] = value.split("/").map((part) => Number(part))
  if (Number.isNaN(systolic) || Number.isNaN(diastolic)) return null
  return { systolic, diastolic }
}

const calculateAge = (dob?: string | null) => {
  if (!dob) return 0
  const birth = new Date(dob)
  if (Number.isNaN(birth.getTime())) return 0
  const diff = Date.now() - birth.getTime()
  return Math.max(0, Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)))
}

export async function getDoctorDashboardData(doctorId = 1): Promise<DoctorDashboardData> {
  const [doctors, appointments, patients, vitals, prescriptions, tasks] = await Promise.all([
    fetchTable<DoctorRecord>("doctors_registration"),
    fetchTable<AppointmentRecord>("appointments"),
    fetchTable<PatientRecord>("patients_registration"),
    fetchTable<VitalRecord>("vitals_history"),
    fetchTable<PrescriptionRecord>("prescription"),
    fetchTable<DoctorTaskRecord>("doctor_tasks"),
  ])

  const doctor = doctors.find((entry) => entry.doctor_id === doctorId)
  const doctorAppointments = appointments.filter((apt) => apt.doctor_id === doctorId)

  const patientMap = patients.reduce<Record<number, PatientRecord>>((acc, patient) => {
    acc[patient.patient_id] = patient
    return acc
  }, {})

  const patientsCards: DoctorPatientCard[] = []
  const patientIds = new Set<number>()
  doctorAppointments.forEach((apt) => {
    if (patientIds.has(apt.patient_id)) return
    patientIds.add(apt.patient_id)
    const patient = patientMap[apt.patient_id]
    if (!patient) return
    const lastVisitDate =
      doctorAppointments
        .filter((entry) => entry.patient_id === apt.patient_id)
        .map((entry) => toDate(entry.datetime)?.getTime() ?? 0)
        .sort((a, b) => b - a)[0] ?? Date.now()
    patientsCards.push({
      id: patient.patient_id,
      name: patient.name,
      age: calculateAge(patient.dob),
      lastVisit: formatShortDate(new Date(lastVisitDate)),
    })
  })

  const vitalsByPatient = doctorAppointments.reduce<Record<number, VitalTrendPoint[]>>((acc, apt) => {
    const patientVitals = vitals
      .filter((record) => record.patient_id === apt.patient_id && record.blood_pressure)
      .sort(
        (a, b) => (toDate(a.recorded_on)?.getTime() ?? 0) - (toDate(b.recorded_on)?.getTime() ?? 0),
      )
      .slice(-7)
      .map((record) => {
        const bp = parseBloodPressure(record.blood_pressure)
        return {
          date: formatShortDate(toDate(record.recorded_on) ?? new Date()),
          systolic: bp?.systolic ?? 0,
          diastolic: bp?.diastolic ?? 0,
          heartRate: record.heart_rate ?? 0,
        }
      })
    if (patientVitals.length) {
      acc[apt.patient_id] = patientVitals
    }
    return acc
  }, {})

  const currentPrescriptions = prescriptions
    .filter((rx) => rx.doctor_id === doctorId && rx.status?.toLowerCase() === "active")
    .map((rx) => ({
      drug: rx.medicine_name,
      dose: rx.dosage ?? "As directed",
      frequency: rx.dosage ?? "Per instructions",
      since: rx.start_date ? formatShortDate(new Date(rx.start_date)) : "Ongoing",
    }))

  const previousPrescriptions = prescriptions
    .filter((rx) => rx.doctor_id === doctorId && rx.status?.toLowerCase() !== "active")
    .map((rx) => ({
      drug: rx.medicine_name,
      dose: rx.dosage ?? "As directed",
      frequency: rx.dosage ?? "Per instructions",
      since: rx.end_date ? formatShortDate(new Date(rx.end_date)) : "Completed",
    }))

  const upcomingAppointments = doctorAppointments
    .filter((apt) => {
      const date = toDate(apt.datetime)
      return date ? date.getTime() >= Date.now() && apt.status?.toLowerCase() === "scheduled" : false
    })
    .slice(0, 3)
    .map((apt) => ({
      patientName: patientMap[apt.patient_id]?.name ?? `Patient ${apt.patient_id}`,
      date: formatDateTime(toDate(apt.datetime) ?? new Date()),
      type: apt.status,
    }))

  const doctorAlerts: DoctorAlert[] = tasks
    .filter((task) => task.doctor_id === doctorId)
    .slice(0, 2)
    .map((task) => ({
      message: task.description,
      tone: task.status.toLowerCase() === "in progress" ? "warning" : "info",
    }))

  return {
    doctorName: doctor?.name ?? `Doctor ${doctorId}`,
    patients: patientsCards.slice(0, 3),
    vitalsByPatient,
    currentPrescriptions,
    previousPrescriptions,
    upcomingAppointments,
    alerts: doctorAlerts.length
      ? doctorAlerts
      : [
          { message: "No outstanding physician tasks", tone: "info" },
          { message: "All lab reviews completed", tone: "warning" },
        ],
  }
}

export type PatientAppointmentCard = {
  doctor: string
  date: string
  location: string
}

export type PatientHealthPoint = {
  date: string
  bloodPressure: number
  heartRate: number
  glucose: number
}

export type PatientMedication = {
  name: string
  dosage: string
}

export type PatientRecordEntry = {
  type: string
  description: string
  date: string
  status: string
  statusTone: "success" | "warning"
}

export type PatientTask = {
  title: string
  createdDate: string
}

export type PatientDashboardData = {
  patientName: string
  appointments: PatientAppointmentCard[]
  healthMetrics: PatientHealthPoint[]
  medications: PatientMedication[]
  medicalRecords: PatientRecordEntry[]
  tasks: PatientTask[]
}

export async function getPatientDashboardData(patientId = 1): Promise<PatientDashboardData> {
  const [
    patients,
    appointments,
    doctors,
    clinics,
    vitals,
    bloodTests,
    prescriptions,
    labTests,
    messageHubs,
  ] = await Promise.all([
    fetchTable<PatientRecord>("patients_registration"),
    fetchTable<AppointmentRecord>("appointments"),
    fetchTable<DoctorRecord>("doctors_registration"),
    fetchTable<ClinicRecord>("clinic_servicehistory"),
    fetchTable<VitalRecord>("vitals_history"),
    fetchTable<BloodTestRecord>("bloodtests"),
    fetchTable<PrescriptionRecord>("prescription"),
    fetchTable<LabTestRecord>("lab_tests"),
    fetchTable<PatientMessageHubRecord>("patient_message_hub"),
  ])

  const patient = patients.find((entry) => entry.patient_id === patientId)
  const doctorMap = doctors.reduce<Record<number, DoctorRecord>>((acc, doc) => {
    acc[doc.doctor_id] = doc
    return acc
  }, {})
  const clinicMap = clinics.reduce<Record<number, ClinicRecord>>((acc, clinic) => {
    acc[clinic.clinic_id] = clinic
    return acc
  }, {})

  const patientAppointments = appointments
    .filter((apt) => apt.patient_id === patientId && apt.datetime)
    .slice(0, 3)
    .map((apt) => {
      const doctor = doctorMap[apt.doctor_id]
      const location = clinicMap[doctor?.clinic_id ?? 0]?.clinic_name ?? "Virtual Visit"
      return {
        doctor: doctor?.name ?? `Doctor ${apt.doctor_id}`,
        date: formatDateTime(toDate(apt.datetime) ?? new Date()),
        location,
      }
    })

  const patientVitals = vitals
    .filter((record) => record.patient_id === patientId)
    .sort(
      (a, b) => (toDate(a.recorded_on)?.getTime() ?? 0) - (toDate(b.recorded_on)?.getTime() ?? 0),
    )
    .slice(-7)

  const patientGlucose = bloodTests
    .filter((record) => record.patient_id === patientId && record.test_name.toLowerCase().includes("glucose"))
    .sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime())
    .slice(-7)

  const healthMetrics: PatientHealthPoint[] =
    patientVitals.length > 0
      ? patientVitals.map((record, index) => {
          const bp = parseBloodPressure(record.blood_pressure)
          const glucose = patientGlucose[index]?.result_value
          return {
            date: formatShortDate(toDate(record.recorded_on) ?? new Date()),
            bloodPressure: bp?.systolic ?? 0,
            heartRate: record.heart_rate ?? 0,
            glucose: glucose ? Number(glucose) : 0,
          }
        })
      : [
          // Minimal mock data when vitals are unavailable to keep the chart visible.
          { date: "Mon", bloodPressure: 120, heartRate: 72, glucose: 95 },
          { date: "Tue", bloodPressure: 118, heartRate: 70, glucose: 96 },
          { date: "Wed", bloodPressure: 122, heartRate: 74, glucose: 98 },
          { date: "Thu", bloodPressure: 119, heartRate: 71, glucose: 97 },
          { date: "Fri", bloodPressure: 121, heartRate: 73, glucose: 99 },
          { date: "Sat", bloodPressure: 117, heartRate: 69, glucose: 94 },
          { date: "Sun", bloodPressure: 120, heartRate: 72, glucose: 95 },
        ]

  const medications = prescriptions
    .filter((rx) => rx.patient_id === patientId && rx.status?.toLowerCase() === "active")
    .map((rx) => ({
      name: rx.medicine_name,
      dosage: rx.dosage ?? "Per instructions",
    }))

  const medicalRecords = labTests
    .filter((record) => record.patient_id === patientId)
    .slice(0, 3)
    .map((record) => ({
      type: record.test_type,
      description: `${record.test_type} • ${record.result}`,
      date: formatShortDate(new Date(record.test_date)),
      status: record.status,
      statusTone: record.status.toLowerCase() === "completed" ? ("success" as const) : ("warning" as const),
    }))

  const tasks = messageHubs
    .filter((hub) => hub.patient_id === patientId)
    .slice(0, 2)
    .map((hub) => ({
      title: hub.summary,
      createdDate: formatDateTime(new Date(hub.last_updated)),
    }))

  return {
    patientName: patient?.name ?? `Patient ${patientId}`,
    appointments: patientAppointments,
    healthMetrics,
    medications: medications.length
      ? medications
      : [{ name: "Medication list empty", dosage: "Awaiting prescriptions" }],
    medicalRecords,
    tasks: tasks.length
      ? tasks
      : [
          {
            title: "No pending tasks",
            createdDate: formatDateTime(new Date()),
          },
        ],
  }
}


