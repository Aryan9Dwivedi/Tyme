import { useState } from "react";
import { Camera, Check } from "lucide-react";

import AppShell from "../components/AppShell";
import { useAuth } from "@/lib/AuthContext";
import { getAvatarUrl, getDisplayUser, getWalletViewModel } from "@/lib/auth-view-models";

export default function ProfilePage() {
  const { user } = useAuth();
  const currentUser = getDisplayUser(user);
  const currentWallet = getWalletViewModel(user);
  const [form, setForm] = useState({
    name: currentUser.full_name,
    email: currentUser.email,
    phone: currentUser.phone || "",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (event) => {
    event.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell role="user">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-bold text-ink mb-6">My Profile</h1>

        <div className="space-y-5">
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <img
                  src={getAvatarUrl(user, currentUser.full_name)}
                  alt={currentUser.full_name}
                  className="w-20 h-20 rounded-2xl object-cover"
                />
                <button className="absolute -bottom-2 -right-2 w-7 h-7 bg-ink text-white rounded-full flex items-center justify-center hover:bg-ink/90 transition-colors">
                  <Camera size={13} />
                </button>
              </div>
              <div>
                <div className="font-semibold text-ink text-lg">{currentUser.full_name}</div>
                <div className="text-sm text-ink-tertiary capitalize">
                  {currentUser.role} · Member since {new Date(currentUser.created_date).getFullYear()}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-xs text-ink-secondary bg-teal-light text-teal px-2.5 py-1 rounded-full font-medium">
                    Verified account
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-ink mb-5">Account details</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-2">Full name</label>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="input-premium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-2">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    className="input-premium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-2">Email address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="input-premium"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    saved ? "bg-emerald text-white" : "bg-ink text-white hover:bg-ink/90"
                  }`}
                >
                  {saved ? (
                    <>
                      <Check size={14} />
                      Saved
                    </>
                  ) : (
                    "Save changes"
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-ink mb-4">Wallet overview</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center py-3 bg-secondary rounded-xl">
                <div className="text-xl font-bold text-ink">{currentWallet.balance}</div>
                <div className="text-[10px] text-ink-tertiary mt-0.5">Wild Cash balance</div>
              </div>
              <div className="text-center py-3 bg-secondary rounded-xl">
                <div className="text-xl font-bold text-emerald">{currentWallet.total_earned}</div>
                <div className="text-[10px] text-ink-tertiary mt-0.5">Earned</div>
              </div>
              <div className="text-center py-3 bg-secondary rounded-xl">
                <div className="text-xl font-bold text-ink">{currentWallet.total_spent}</div>
                <div className="text-[10px] text-ink-tertiary mt-0.5">Spent</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-ink mb-1">Account</h2>
            <p className="text-sm text-ink-tertiary mb-4">Manage your account access and data.</p>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-border text-ink-secondary text-sm rounded-xl hover:bg-secondary transition-colors">
                Change password
              </button>
              <button className="px-4 py-2 border border-coral/30 text-coral text-sm rounded-xl hover:bg-coral-light transition-colors">
                Delete account
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
