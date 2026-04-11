import { userDashboard } from "@/features/dashboard/dashboard-config";
import { DashboardPage } from "@/features/dashboard/dashboard-page";

export default function UserPage() {
  return <DashboardPage config={userDashboard} />;
}
