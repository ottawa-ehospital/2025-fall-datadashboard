import PatientPage from "@/app/patient"
import { getPatientDashboardData } from "@/lib/dashboard-data"

export const dynamic = "force-dynamic"

export default async function PatientRoute() {
  const data = await getPatientDashboardData()
  return <PatientPage {...data} />
}


