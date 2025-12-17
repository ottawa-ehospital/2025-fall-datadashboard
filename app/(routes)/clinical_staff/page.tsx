import ClinicalStaffPage from "@/app/clinical_staff"
import { getClinicalStaffDashboardData } from "@/lib/dashboard-data"

export const dynamic = "force-dynamic"

export default async function ClinicalStaffRoute() {
  const data = await getClinicalStaffDashboardData()
  return <ClinicalStaffPage {...data} />
}


