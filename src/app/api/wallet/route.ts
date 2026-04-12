import { getCurrentAuthUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/prisma";
import { jsonWithCors, preflightResponse } from "@/server/http/cors";

function badRequest(message: string, status = 400) {
  return jsonWithCors({ error: message }, { status });
}

function mapTransactionType(type: string) {
  switch (type) {
    case "FUNDING":
      return "FUND";
    case "ESCROW_LOCK":
      return "ESCROW";
    case "REWARD_PAYOUT":
      return "REWARD";
    case "REFUND":
      return "REFUND";
    default:
      return "ADJUSTMENT";
  }
}

function mapWalletPayload(wallet: {
  id: string;
  balanceTokens: number;
  transactions: Array<{
    id: string;
    type: string;
    direction: string;
    status: string;
    amountTokens: number;
    reason: string;
    createdAt: Date;
    explorerUrl: string | null;
  }>;
}) {
  const transactions = wallet.transactions.map((transaction) => ({
    id: transaction.id,
    type: mapTransactionType(transaction.type),
    direction: transaction.direction,
    status: transaction.status,
    amount: transaction.amountTokens,
    note: transaction.reason,
    created_date: transaction.createdAt,
    reference_url: transaction.explorerUrl,
  }));

  const confirmedCredits = wallet.transactions
    .filter((transaction) => transaction.status === "CONFIRMED" && transaction.direction === "CREDIT")
    .reduce((sum, transaction) => sum + transaction.amountTokens, 0);

  const confirmedDebits = wallet.transactions
    .filter((transaction) => transaction.status === "CONFIRMED" && transaction.direction === "DEBIT")
    .reduce((sum, transaction) => sum + transaction.amountTokens, 0);

  const pendingBalance = wallet.transactions
    .filter((transaction) => transaction.status === "PENDING")
    .reduce((sum, transaction) => sum + transaction.amountTokens, 0);

  return {
    wallet: {
      id: wallet.id,
      balance: wallet.balanceTokens,
      pending_balance: pendingBalance,
      total_earned: confirmedCredits,
      total_spent: confirmedDebits,
    },
    transactions,
  };
}

export function OPTIONS() {
  return preflightResponse();
}

export async function GET(request: Request) {
  const currentUser = await getCurrentAuthUser(request);

  if (!currentUser) {
    return badRequest("Unauthorized", 401);
  }

  const wallet = await prisma.wallet.findUnique({
    where: { ownerId: currentUser.user.id },
    include: {
      transactions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      },
    },
  });

  if (!wallet) {
    return badRequest("Wallet not found.", 404);
  }

  return jsonWithCors(mapWalletPayload(wallet));
}

export async function POST(request: Request) {
  const currentUser = await getCurrentAuthUser(request);

  if (!currentUser) {
    return badRequest("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);
  const amount = Math.max(0, Math.round(Number(body?.amount ?? 0)));

  if (!amount) {
    return badRequest("A funding amount is required.");
  }

  if (amount > 1000) {
    return badRequest("Please keep the demo add-balance amount at 1000 or lower.");
  }

  const existingWallet = await prisma.wallet.findUnique({
    where: { ownerId: currentUser.user.id },
  });

  const wallet =
    existingWallet ??
    (await prisma.wallet.create({
      data: {
        ownerId: currentUser.user.id,
      },
    }));

  await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balanceTokens: wallet.balanceTokens + amount,
        lastSyncedAt: new Date(),
      },
    }),
    prisma.transaction.create({
      data: {
        walletId: wallet.id,
        direction: "CREDIT",
        type: "FUNDING",
        status: "CONFIRMED",
        amountTokens: amount,
        reason: "Demo Wild Cash added from the compliance sandbox",
        confirmedAt: new Date(),
        metadata: {
          source: "demo-funding",
        },
      },
    }),
  ]);

  const refreshedWallet = await prisma.wallet.findUnique({
    where: { id: wallet.id },
    include: {
      transactions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      },
    },
  });

  if (!refreshedWallet) {
    return badRequest("Wallet not found after funding.", 404);
  }

  return jsonWithCors(mapWalletPayload(refreshedWallet));
}
