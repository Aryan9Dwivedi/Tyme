import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

async function main() {
  await prisma.rating.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.taskOffer.deleteMany();
  await prisma.taskSkill.deleteMany();
  await prisma.captainSkill.deleteMany();
  await prisma.task.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.captainProfile.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  const skillMap = new Map<string, { id: string }>();
  const skills = [
    { slug: "errands", label: "Errands" },
    { slug: "senior-support", label: "Senior Support" },
    { slug: "mobility", label: "Mobility" },
    { slug: "teaching", label: "Teaching" },
    { slug: "math", label: "Math" },
    { slug: "student-support", label: "Student Support" },
    { slug: "wellness", label: "Wellness" },
    { slug: "household", label: "Household" },
    { slug: "delivery", label: "Delivery" }
  ];

  for (const skill of skills) {
    const createdSkill = await prisma.skill.create({ data: skill });
    skillMap.set(skill.slug, { id: createdSkill.id });
  }

  const admin = await prisma.user.create({
    data: {
      name: "Ava Admin",
      email: "admin@timebridge.local",
      role: "ADMIN",
      status: "ACTIVE"
    }
  });

  const requester = await prisma.user.create({
    data: {
      name: "Maria Alvarez",
      email: "maria@timebridge.local",
      phone: "+1-312-555-0101",
      role: "USER",
      status: "ACTIVE",
      wallet: {
        create: {
          network: "SOLANA_DEVNET",
          solanaAddress: "F5j7H8m9PnQa2r3s4TuVwXyZaBCdEfGhJKLmNoPqRsT1",
          balanceTokens: 320,
          lastSyncedAt: new Date("2026-04-11T17:00:00.000Z")
        }
      }
    },
    include: {
      wallet: true
    }
  });

  const captainJordan = await prisma.user.create({
    data: {
      name: "Jordan Lee",
      email: "jordan@timebridge.local",
      role: "CAPTAIN",
      status: "ACTIVE",
      captainProfile: {
        create: {
          headline: "Fast responder for errands and senior support",
          bio: "Trusted neighborhood captain for medicine pickups and elder support.",
          availabilityStatus: "ONLINE",
          availabilityWindow: "Available now until 7 PM",
          isAvailableNow: true,
          trustScore: 94,
          responseRate: 0.96,
          tasksCompleted: 61,
          locationLabel: "West Town, Chicago",
          latitude: 41.8938,
          longitude: -87.6722,
          radiusKm: 8
        }
      },
      wallet: {
        create: {
          network: "SOLANA_DEVNET",
          solanaAddress: "3S6v9LmNPqRsTuVwXyZaBCdEfGhJKLmNoPqRstUvWxY1",
          balanceTokens: 180,
          lastSyncedAt: new Date("2026-04-11T17:10:00.000Z")
        }
      }
    },
    include: {
      captainProfile: true,
      wallet: true
    }
  });

  const captainPriya = await prisma.user.create({
    data: {
      name: "Priya Shah",
      email: "priya@timebridge.local",
      role: "CAPTAIN",
      status: "ACTIVE",
      captainProfile: {
        create: {
          headline: "Reliable volunteer with education and delivery experience",
          bio: "Focused on tutoring, delivery support, and student-facing tasks.",
          availabilityStatus: "BUSY",
          availabilityWindow: "Available in 40 minutes",
          isAvailableNow: false,
          trustScore: 92,
          responseRate: 0.91,
          tasksCompleted: 45,
          locationLabel: "River North, Chicago",
          latitude: 41.8924,
          longitude: -87.6341,
          radiusKm: 10
        }
      },
      wallet: {
        create: {
          network: "SOLANA_DEVNET",
          solanaAddress: "7Zr4StUvWxY12AbCdEfGhJKLmNoPqRsTuVwXyZaBCdE3",
          balanceTokens: 140,
          lastSyncedAt: new Date("2026-04-11T16:45:00.000Z")
        }
      }
    },
    include: {
      captainProfile: true,
      wallet: true
    }
  });

  const captainAmina = await prisma.user.create({
    data: {
      name: "Amina Yusuf",
      email: "amina@timebridge.local",
      role: "CAPTAIN",
      status: "ACTIVE",
      captainProfile: {
        create: {
          headline: "Patient helper for wellness and check-in tasks",
          bio: "Strong at care check-ins, household support, and calm response work.",
          availabilityStatus: "ONLINE",
          availabilityWindow: "Available now until 5 PM",
          isAvailableNow: true,
          trustScore: 96,
          responseRate: 0.88,
          tasksCompleted: 39,
          locationLabel: "South Loop, Chicago",
          latitude: 41.8708,
          longitude: -87.6257,
          radiusKm: 9
        }
      },
      wallet: {
        create: {
          network: "SOLANA_DEVNET",
          solanaAddress: "9YxWvUtSrQpNoMLkJiHgFeDcBaZyXwVuTsRqPoNmLkJ4",
          balanceTokens: 205,
          lastSyncedAt: new Date("2026-04-11T16:20:00.000Z")
        }
      }
    },
    include: {
      captainProfile: true,
      wallet: true
    }
  });

  const captainSkills = [
    {
      captainProfileId: captainJordan.captainProfile!.id,
      slugs: ["errands", "senior-support", "mobility"]
    },
    {
      captainProfileId: captainPriya.captainProfile!.id,
      slugs: ["teaching", "math", "student-support", "delivery"]
    },
    {
      captainProfileId: captainAmina.captainProfile!.id,
      slugs: ["wellness", "household", "senior-support"]
    }
  ];

  for (const entry of captainSkills) {
    await prisma.captainSkill.createMany({
      data: entry.slugs.map((slug) => ({
        captainProfileId: entry.captainProfileId,
        skillId: skillMap.get(slug)!.id
      }))
    });
  }

  const medicineTask = await prisma.task.create({
    data: {
      title: "Pick up medicine for Ms. Alvarez",
      description: "A nearby resident needs a same-day medicine pickup and doorstep dropoff before 6 PM.",
      category: "ERRANDS",
      taskType: "TOKEN_FUNDED",
      status: "OPEN",
      urgency: "HIGH",
      tokenBudget: 24,
      locationLabel: "West Loop, Chicago",
      latitude: 41.8839,
      longitude: -87.6376,
      radiusKm: 7,
      requestedAt: new Date("2026-04-11T09:30:00.000Z"),
      creatorId: requester.id,
      voiceTranscript: "Need someone nearby to pick up medicine and drop it off before 6 PM."
    }
  });

  const tutoringTask = await prisma.task.create({
    data: {
      title: "Weekend tutoring for algebra basics",
      description: "A student needs one hour of math help at the neighborhood library this weekend.",
      category: "LEARNING",
      taskType: "VOLUNTEER",
      status: "COMPLETED",
      urgency: "MEDIUM",
      tokenBudget: 0,
      locationLabel: "Near North Side, Chicago",
      latitude: 41.8988,
      longitude: -87.6281,
      radiusKm: 10,
      requestedAt: new Date("2026-04-11T11:00:00.000Z"),
      scheduledFor: new Date("2026-04-12T18:00:00.000Z"),
      creatorId: requester.id
    }
  });

  const wellnessTask = await prisma.task.create({
    data: {
      title: "Wellness check and grocery unpacking",
      description: "A neighbor needs a quick wellness visit plus help unpacking groceries this evening.",
      category: "WELLNESS",
      taskType: "TOKEN_FUNDED",
      status: "ASSIGNED",
      urgency: "MEDIUM",
      tokenBudget: 18,
      locationLabel: "South Loop, Chicago",
      latitude: 41.8721,
      longitude: -87.6298,
      radiusKm: 6,
      requestedAt: new Date("2026-04-11T12:30:00.000Z"),
      scheduledFor: new Date("2026-04-11T23:00:00.000Z"),
      creatorId: requester.id
    }
  });

  const taskSkills = [
    { taskId: medicineTask.id, slugs: ["errands", "senior-support", "mobility"] },
    { taskId: tutoringTask.id, slugs: ["teaching", "math", "student-support"] },
    { taskId: wellnessTask.id, slugs: ["wellness", "household", "senior-support"] }
  ];

  for (const entry of taskSkills) {
    await prisma.taskSkill.createMany({
      data: entry.slugs.map((slug) => ({
        taskId: entry.taskId,
        skillId: skillMap.get(slug)!.id
      }))
    });
  }

  await prisma.taskOffer.create({
    data: {
      taskId: medicineTask.id,
      captainId: captainJordan.id,
      status: "PENDING",
      note: "Nearby and ready to pick up immediately."
    }
  });

  await prisma.taskOffer.create({
    data: {
      taskId: medicineTask.id,
      captainId: captainPriya.id,
      status: "DECLINED",
      note: "Available later today but not in time for this request.",
      respondedAt: new Date("2026-04-11T09:45:00.000Z")
    }
  });

  const tutoringOfferPriya = await prisma.taskOffer.create({
    data: {
      taskId: tutoringTask.id,
      captainId: captainPriya.id,
      status: "ACCEPTED",
      note: "Happy to take the tutoring session.",
      respondedAt: new Date("2026-04-11T11:10:00.000Z")
    }
  });

  const wellnessOfferAmina = await prisma.taskOffer.create({
    data: {
      taskId: wellnessTask.id,
      captainId: captainAmina.id,
      status: "ACCEPTED",
      note: "Can arrive within 20 minutes.",
      respondedAt: new Date("2026-04-11T12:40:00.000Z")
    }
  });

  const tutoringAssignment = await prisma.assignment.create({
    data: {
      taskId: tutoringTask.id,
      captainId: captainPriya.id,
      offerId: tutoringOfferPriya.id,
      status: "COMPLETED",
      acceptedAt: new Date("2026-04-11T11:10:00.000Z"),
      startedAt: new Date("2026-04-12T18:00:00.000Z"),
      completedAt: new Date("2026-04-12T19:15:00.000Z")
    }
  });

  const wellnessAssignment = await prisma.assignment.create({
    data: {
      taskId: wellnessTask.id,
      captainId: captainAmina.id,
      offerId: wellnessOfferAmina.id,
      status: "ACTIVE",
      acceptedAt: new Date("2026-04-11T12:40:00.000Z"),
      startedAt: new Date("2026-04-11T23:05:00.000Z")
    }
  });

  await prisma.transaction.createMany({
    data: [
      {
        walletId: requester.wallet!.id,
        assignmentId: wellnessAssignment.id,
        direction: "DEBIT",
        type: "ESCROW_LOCK",
        status: "CONFIRMED",
        amountTokens: 18,
        reason: "Escrowed token-funded wellness task",
        solanaSignature: "5dTRrS2Vh1VNfM9xkQ8n7Pz4mL2yWs6GcAr2QwKp3Jf9",
        explorerUrl: "https://explorer.solana.com/tx/5dTRrS2Vh1VNfM9xkQ8n7Pz4mL2yWs6GcAr2QwKp3Jf9?cluster=devnet",
        confirmedAt: new Date("2026-04-11T12:42:00.000Z")
      },
      {
        walletId: captainPriya.wallet!.id,
        assignmentId: tutoringAssignment.id,
        direction: "CREDIT",
        type: "MANUAL_ADJUSTMENT",
        status: "CONFIRMED",
        amountTokens: 12,
        reason: "Hackathon demo reward credit",
        confirmedAt: new Date("2026-04-12T19:20:00.000Z")
      },
      {
        walletId: captainAmina.wallet!.id,
        assignmentId: wellnessAssignment.id,
        direction: "CREDIT",
        type: "REWARD_PAYOUT",
        status: "PENDING",
        amountTokens: 18,
        reason: "Reward queued for active wellness assignment"
      }
    ]
  });

  await prisma.rating.create({
    data: {
      assignmentId: tutoringAssignment.id,
      authorId: requester.id,
      targetId: captainPriya.id,
      score: 5,
      note: "Clear explanations and right on time."
    }
  });

  console.log(
    JSON.stringify(
      {
        seededBy: admin.email,
        skills: skills.length,
        users: 5,
        tasks: 3,
        pendingOffers: 1,
        activeAssignments: 1,
        completedAssignments: 1
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
