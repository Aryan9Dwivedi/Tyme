import { Bell, CheckCircle, Zap, Coins, Star } from "lucide-react";
import AppShell from "../components/AppShell";

const NOTIFICATIONS = [
  { id: "n1", type: "captain", icon: Zap, title: "Marcus Rivera accepted your task", desc: "Grocery pickup — he'll arrive within 30 minutes.", time: "Just now", read: false, color: "text-teal", bg: "bg-teal-light" },
  { id: "n2", type: "complete", icon: CheckCircle, title: "Task completed!", desc: "Your furniture moving task is done. Don't forget to rate your Captain.", time: "1 hour ago", read: false, color: "text-emerald", bg: "bg-emerald-light" },
  { id: "n3", type: "token", icon: Coins, title: "Reward released — 60 Wild Cash", desc: "Wild Cash moved into your wallet after task confirmation.", time: "2 hours ago", read: true, color: "text-amber", bg: "bg-amber-light" },
  { id: "n4", type: "rating", icon: Star, title: "Your Captain left a rating", desc: "Marcus left a 5-star review for your task collaboration.", time: "Yesterday", read: true, color: "text-amber", bg: "bg-amber-light" },
  { id: "n5", type: "offer", icon: Zap, title: "New offer on your task", desc: "A Captain has made an offer on your Spanish tutoring request.", time: "Yesterday", read: true, color: "text-teal", bg: "bg-teal-light" },
  { id: "n6", type: "system", icon: Bell, title: "Task expiring soon", desc: "Your 'Prescription pickup' task will expire in 2 hours without a Captain.", time: "2 days ago", read: true, color: "text-coral", bg: "bg-coral-light" },
];

export default function NotificationsPage() {
  const unread = NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <AppShell role="user">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-ink mb-0.5">Notifications</h1>
            {unread > 0 && <p className="text-sm text-ink-tertiary">{unread} unread</p>}
          </div>
          {unread > 0 && (
            <button className="text-xs text-teal font-medium hover:underline">Mark all read</button>
          )}
        </div>

        <div className="space-y-2">
          {NOTIFICATIONS.map(notif => {
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-premium ${
                  notif.read ? "bg-white border-border" : "bg-white border-teal/20 shadow-premium"
                }`}
              >
                {!notif.read && (
                  <div className="absolute ml-[-8px] mt-4 w-2 h-2 rounded-full bg-teal" />
                )}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.bg}`}>
                  <Icon size={16} className={notif.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink mb-0.5">{notif.title}</div>
                  <div className="text-xs text-ink-tertiary leading-relaxed">{notif.desc}</div>
                  <div className="text-[10px] text-ink-disabled mt-2">{notif.time}</div>
                </div>
                {!notif.read && (
                  <div className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
