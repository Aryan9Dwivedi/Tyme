import { captainDashboard } from "@/features/dashboard/dashboard-config";
import { DashboardPage } from "@/features/dashboard/dashboard-page";

export default function CaptainPage() {
  return <DashboardPage config={captainDashboard} />;
}
