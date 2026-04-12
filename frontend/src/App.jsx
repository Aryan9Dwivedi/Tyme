import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { canAccessRole, getRoleHome } from "@/lib/auth-utils";
import PageNotFound from "./lib/PageNotFound";
import Landing from "./pages/Landing";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UserDashboard from "./pages/UserDashboard";
import MyTasks from "./pages/MyTasks";
import TaskDetail from "./pages/TaskDetail";
import CreateTask from "./pages/CreateTask";
import WalletPage from "./pages/WalletPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import CaptainDashboard from "./pages/captain/CaptainDashboard";
import NearbyOpportunities from "./pages/captain/NearbyOpportunities";
import CaptainProfile from "./pages/captain/CaptainProfile";
import CaptainEarnings from "./pages/captain/CaptainEarnings";
import ActiveAssignments from "./pages/captain/ActiveAssignments";
import AdminCommandCenter from "./pages/admin/AdminCommandCenter";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCaptains from "./pages/admin/AdminCaptains";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminModeration from "./pages/admin/AdminModeration";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

function AppLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-canvas">
      <div className="w-8 h-8 border-4 border-teal/20 border-t-teal rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, isLoadingAuth, user } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    return <AppLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !canAccessRole(user?.role, allowedRoles)) {
    return <Navigate to={getRoleHome(user?.role)} replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoadingAuth, user } = useAuth();

  if (isLoadingAuth) {
    return <AppLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={getRoleHome(user?.role)} replace />;
  }

  return children;
}

function AuthenticatedApp() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-tasks"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <MyTasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks/new"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <CreateTask />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks/:id"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <TaskDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <CreateTask />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallet"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <WalletPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/captain" element={<Navigate to="/captain/dashboard" replace />} />
      <Route
        path="/captain/dashboard"
        element={
          <ProtectedRoute allowedRoles={["CAPTAIN"]}>
            <CaptainDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/captain/opportunities"
        element={
          <ProtectedRoute allowedRoles={["CAPTAIN"]}>
            <NearbyOpportunities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/captain/assignments"
        element={
          <ProtectedRoute allowedRoles={["CAPTAIN"]}>
            <ActiveAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/captain/earnings"
        element={
          <ProtectedRoute allowedRoles={["CAPTAIN"]}>
            <CaptainEarnings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/captain/profile"
        element={
          <ProtectedRoute allowedRoles={["CAPTAIN"]}>
            <CaptainProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminCommandCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tasks"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminTasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/captains"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminCaptains />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminTransactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/moderation"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminModeration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminAnalytics />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
