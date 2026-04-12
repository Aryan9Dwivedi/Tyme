import { mockCaptainProfile, mockUser, mockWallet } from "@/lib/mockData";
import { normalizeRole, toRoleSlug } from "@/lib/auth-utils";

function formatPercent(value, fallback) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return value <= 1 ? Math.round(value * 100) : Math.round(value);
}

export function getAvatarUrl(user, fallbackName = mockUser.full_name) {
  if (user?.avatarUrl) {
    return user.avatarUrl;
  }

  const displayName = user?.name || fallbackName;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0f766e&color=ffffff`;
}

export function getDisplayUser(user) {
  const role = normalizeRole(user?.role);

  return {
    id: user?.id ?? mockUser.id,
    full_name: user?.name ?? mockUser.full_name,
    email: user?.email ?? mockUser.email,
    phone: user?.phone ?? mockUser.phone ?? "",
    role: toRoleSlug(role),
    status: user?.status ?? "ACTIVE",
    avatar_url: getAvatarUrl(user),
    created_date: user?.createdAt ?? mockUser.created_date,
  };
}

export function getWalletViewModel(user) {
  return {
    ...mockWallet,
    balance: user?.wallet?.balanceTokens ?? mockWallet.balance,
    pending_balance: user?.wallet ? 0 : mockWallet.pending_balance,
    total_earned: user?.wallet?.balanceTokens ?? mockWallet.total_earned,
    total_spent: user?.wallet ? 0 : mockWallet.total_spent,
    network: user?.wallet?.network ?? mockWallet.network,
    solana_address: user?.wallet?.solanaAddress ?? mockWallet.solana_address,
    is_linked: Boolean(user?.wallet?.solanaAddress),
  };
}

export function getCaptainProfileViewModel(user) {
  const captainProfile = user?.captainProfile;

  return {
    ...mockCaptainProfile,
    headline: captainProfile?.headline || mockCaptainProfile.headline,
    bio: captainProfile?.bio || mockCaptainProfile.bio,
    availability: captainProfile?.availabilityStatus || mockCaptainProfile.availability,
    location_city: captainProfile?.locationLabel || mockCaptainProfile.location_city,
    radius_km: captainProfile?.radiusKm ?? mockCaptainProfile.radius_km,
    trust_score: captainProfile?.trustScore ?? mockCaptainProfile.trust_score,
    response_rate: formatPercent(captainProfile?.responseRate, mockCaptainProfile.response_rate),
    completed_tasks: captainProfile?.tasksCompleted ?? mockCaptainProfile.completed_tasks,
    is_verified: user?.status === "ACTIVE",
    avatar_url: getAvatarUrl(user, mockCaptainProfile.headline),
  };
}
