import AnalystPage from "@/app/analyst"
import { getAnalystDashboardData } from "@/lib/dashboard-data"

export const dynamic = "force-dynamic"

export default async function AnalystRoute() {
  const data = await getAnalystDashboardData()
  return <AnalystPage {...data} />
}


