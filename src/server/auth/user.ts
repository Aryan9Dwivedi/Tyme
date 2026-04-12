import type { Prisma } from "@prisma/client";

export const authUserInclude = {
  wallet: true,
  captainProfile: true,
} satisfies Prisma.UserInclude;

export type AuthUserRecord = Prisma.UserGetPayload<{
  include: typeof authUserInclude;
}>;

export function serializeAuthUser(user: AuthUserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    wallet: user.wallet
      ? {
          id: user.wallet.id,
          network: user.wallet.network,
          solanaAddress: user.wallet.solanaAddress,
          balanceTokens: user.wallet.balanceTokens,
          lastSyncedAt: user.wallet.lastSyncedAt,
        }
      : null,
    captainProfile: user.captainProfile
      ? {
          id: user.captainProfile.id,
          headline: user.captainProfile.headline,
          bio: user.captainProfile.bio,
          availabilityStatus: user.captainProfile.availabilityStatus,
          availabilityWindow: user.captainProfile.availabilityWindow,
          isAvailableNow: user.captainProfile.isAvailableNow,
          trustScore: user.captainProfile.trustScore,
          responseRate: user.captainProfile.responseRate,
          tasksCompleted: user.captainProfile.tasksCompleted,
          locationLabel: user.captainProfile.locationLabel,
          radiusKm: user.captainProfile.radiusKm,
        }
      : null,
  };
}
