import { adminDashboard } from "@/features/dashboard/dashboard-config";
import { DashboardPage } from "@/features/dashboard/dashboard-page";

export default function AdminPage() {
  return <DashboardPage config={adminDashboard} />;
}
