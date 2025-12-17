import DoctorPage from "@/app/doctor"
import { getDoctorDashboardData } from "@/lib/dashboard-data"

export const dynamic = "force-dynamic"

export default async function DoctorRoute() {
  const data = await getDoctorDashboardData()
  return <DoctorPage {...data} />
}


