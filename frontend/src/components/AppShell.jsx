import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRightLeft,
  BarChart3,
  Bell,
  CheckSquare,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Navigation,
  ShieldCheck,
  Star,
  User,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";

import { useAuth } from "@/lib/AuthContext";
import { getRoleHome, getRoleLabel, normalizeRole } from "@/lib/auth-utils";
import { getAvatarUrl } from "@/lib/auth-view-models";

const NAV_CONFIG = {
  USER: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "My Tasks", icon: CheckSquare, href: "/my-tasks" },
    { label: "Wallet", icon: Wallet, href: "/wallet" },
    { label: "Notifications", icon: Bell, href: "/notifications" },
    { label: "Profile", icon: User, href: "/profile" },
  ],
  CAPTAIN: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/captain/dashboard" },
    { label: "Opportunities", icon: MapPin, href: "/captain/opportunities" },
    { label: "Assignments", icon: CheckSquare, href: "/captain/assignments" },
    { label: "Earnings", icon: Wallet, href: "/captain/earnings" },
    { label: "My Profile", icon: Star, href: "/captain/profile" },
  ],
  ADMIN: [
    { label: "Command Center", icon: LayoutDashboard, href: "/admin" },
    { label: "Tasks", icon: CheckSquare, href: "/admin/tasks" },
    { label: "Users", icon: Users, href: "/admin/users" },
    { label: "Captains", icon: Navigation, href: "/admin/captains" },
    { label: "Transactions", icon: ArrowRightLeft, href: "/admin/transactions" },
    { label: "Moderation", icon: ShieldCheck, href: "/admin/moderation" },
    { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  ],
};

const PROFILE_ROUTE = {
  USER: "/profile",
  CAPTAIN: "/captain/profile",
  ADMIN: "/admin/users",
};

export default function AppShell({ children, role = "USER" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();

  const resolvedRole = normalizeRole(user?.role || role);
  const navItems = NAV_CONFIG[resolvedRole] || NAV_CONFIG.USER;
  const roleHome = getRoleHome(resolvedRole);
  const profileRoute = PROFILE_ROUTE[resolvedRole];
  const displayName = user?.name || "Tyme User";
  const displayAvatar = getAvatarUrl(user, displayName);
  const displayLabel = getRoleLabel(resolvedRole);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 flex flex-col
          transition-transform duration-300 ease-out
          lg:relative lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ background: "hsl(var(--sidebar-bg))" }}
      >
        <div
          className="flex items-center justify-between px-5 py-5 border-b"
          style={{ borderColor: "hsl(var(--sidebar-border))" }}
        >
          <Link to={roleHome} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center flex-shrink-0">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <span className="block font-semibold text-sidebar-text tracking-tight text-[15px]">
                Tyme
              </span>
              <span className="block text-[10px] uppercase tracking-[0.24em] text-sidebar-muted">
                {displayLabel}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-sidebar-muted hover:text-sidebar-text"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto sidebar-scroll">
          {navItems.map((item) => {
            const active =
              location.pathname === item.href ||
              (item.href !== roleHome && location.pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`nav-item ${active ? "active" : ""}`}
              >
                <item.icon size={16} className={active ? "text-sidebar-accent" : ""} />
                <span className={active ? "text-sidebar-text font-medium" : ""}>{item.label}</span>
                {active && (
                  <ChevronRight
                    size={12}
                    className="ml-auto text-sidebar-accent opacity-60"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div
          className="px-3 py-4 border-t"
          style={{ borderColor: "hsl(var(--sidebar-border))" }}
        >
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-sidebar-border"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-sidebar-text truncate">{displayName}</div>
              <div className="text-[10px] text-sidebar-muted">{displayLabel}</div>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-sidebar-muted hover:text-sidebar-text hover:bg-sidebar-surface transition-colors"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={13} className="flex-shrink-0" />
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b border-border bg-white/80 backdrop-blur-md flex items-center px-4 lg:px-6 gap-4 flex-shrink-0 z-20">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-secondary text-ink-secondary transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
            <span className="text-ink-tertiary">Tyme</span>
            <ChevronRight size={12} className="text-ink-disabled" />
            <span className="font-medium text-ink truncate">
              {navItems.find((item) => location.pathname.startsWith(item.href))?.label || "Overview"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {resolvedRole === "USER" && (
              <Link
                to="/notifications"
                className="relative p-2 rounded-lg hover:bg-secondary text-ink-secondary transition-colors"
              >
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-coral" />
              </Link>
            )}
            <Link to={profileRoute}>
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-border hover:ring-teal transition-all"
              />
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
