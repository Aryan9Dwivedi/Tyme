import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

const seededDemoPassword = "Tyme123!";
const now = new Date();

function minutesAgo(minutes: number) {
  return new Date(now.getTime() - minutes * 60000);
}

function hoursAgo(hours: number) {
  return new Date(now.getTime() - hours * 60 * 60000);
}

function minutesFromNow(minutes: number) {
  return new Date(now.getTime() + minutes * 60000);
}

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
    { slug: "delivery", label: "Delivery" },
  ];

  for (const skill of skills) {
    const createdSkill = await prisma.skill.create({ data: skill });
    skillMap.set(skill.slug, { id: createdSkill.id });
  }

  async function createTaskWithSkills(
    taskData: Parameters<typeof prisma.task.create>[0]["data"],
    skillSlugs: string[],
  ) {
    const task = await prisma.task.create({
      data: taskData,
    });

    await prisma.taskSkill.createMany({
      data: skillSlugs.map((slug) => ({
        taskId: task.id,
        skillId: skillMap.get(slug)!.id,
      })),
    });

    return task;
  }

  const hashedPassword = await bcrypt.hash(seededDemoPassword, 12);

  const admin = await prisma.user.create({
    data: {
      name: "Ava Admin",
      email: "admin@tyme.local",
      passwordHash: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const requester = await prisma.user.create({
    data: {
      name: "Maria Alvarez",
      email: "maria@tyme.local",
      passwordHash: hashedPassword,
      phone: "+1-312-555-0101",
      role: "USER",
      status: "ACTIVE",
      wallet: {
        create: {
          network: "SOLANA_DEVNET",
          solanaAddress: "F5j7H8m9PnQa2r3s4TuVwXyZaBCdEfGhJKLmNoPqRsT1",
          balanceTokens: 320,
          lastSyncedAt: minutesAgo(95),
        },
      },
    },
    include: {
      wallet: true,
    },
  });

  const captainJordan = await prisma.user.create({
    data: {
      name: "Jordan Lee",
      email: "jordan@tyme.local",
      passwordHash: hashedPassword,
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
          radiusKm: 8,
        },
      },
      wallet: {
        create: {
          network: "SOLANA_DEVNET",
          solanaAddress: "3S6v9LmNPqRsTuVwXyZaBCdEfGhJKLmNoPqRstUvWxY1",
          balanceTokens: 180,
          lastSyncedAt: minutesAgo(72),
        },
      },
    },
    include: {
      captainProfile: true,
      wallet: true,
    },
  });

  const captainPriya = await prisma.user.create({
    data: {
      name: "Priya Shah",
      email: "priya@tyme.local",
      passwordHash: hashedPassword,
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
          radiusKm: 10,
        },
      },
      wallet: {
        create: {
          network: "SOLANA_DEVNET",
          solanaAddress: "7Zr4StUvWxY12AbCdEfGhJKLmNoPqRsTuVwXyZaBCdE3",
          balanceTokens: 140,
          lastSyncedAt: minutesAgo(84),
        },
      },
    },
    include: {
      captainProfile: true,
      wallet: true,
    },
  });

  const captainAmina = await prisma.user.create({
    data: {
      name: "Amina Yusuf",
      email: "amina@tyme.local",
      passwordHash: hashedPassword,
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
          radiusKm: 9,
        },
      },
      wallet: {
        create: {
          network: "SOLANA_DEVNET",
          solanaAddress: "9YxWvUtSrQpNoMLkJiHgFeDcBaZyXwVuTsRqPoNmLkJ4",
          balanceTokens: 205,
          lastSyncedAt: minutesAgo(58),
        },
      },
    },
    include: {
      captainProfile: true,
      wallet: true,
    },
  });

  const captainSkills = [
    {
      captainProfileId: captainJordan.captainProfile!.id,
      slugs: ["errands", "senior-support", "mobility"],
    },
    {
      captainProfileId: captainPriya.captainProfile!.id,
      slugs: ["teaching", "math", "student-support", "delivery"],
    },
    {
      captainProfileId: captainAmina.captainProfile!.id,
      slugs: ["wellness", "household", "senior-support"],
    },
  ];

  for (const entry of captainSkills) {
    await prisma.captainSkill.createMany({
      data: entry.slugs.map((slug) => ({
        captainProfileId: entry.captainProfileId,
        skillId: skillMap.get(slug)!.id,
      })),
    });
  }

  const medicineTask = await createTaskWithSkills(
    {
      title: "Pick up medicine for Ms. Alvarez",
      description: "A nearby resident needs a same-day medicine pickup and doorstep dropoff before dinner.",
      category: "ERRANDS",
      taskType: "TOKEN_FUNDED",
      status: "OPEN",
      urgency: "HIGH",
      tokenBudget: 24,
      locationLabel: "West Loop, Chicago",
      latitude: 41.8839,
      longitude: -87.6376,
      radiusKm: 7,
      requestedAt: minutesAgo(22),
      creatorId: requester.id,
      voiceTranscript: "Need someone nearby to pick up medicine and drop it off before 6 PM.",
    },
    ["errands", "senior-support", "mobility"],
  );

  const tutoringTask = await createTaskWithSkills(
    {
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
      requestedAt: hoursAgo(32),
      scheduledFor: hoursAgo(5),
      creatorId: requester.id,
    },
    ["teaching", "math", "student-support"],
  );

  const wellnessTask = await createTaskWithSkills(
    {
      title: "Wellness check and grocery unpacking",
      description: "A neighbor needs a quick wellness visit plus help unpacking groceries this evening.",
      category: "WELLNESS",
      taskType: "TOKEN_FUNDED",
      status: "IN_PROGRESS",
      urgency: "MEDIUM",
      tokenBudget: 18,
      locationLabel: "South Loop, Chicago",
      latitude: 41.8721,
      longitude: -87.6298,
      radiusKm: 6,
      requestedAt: minutesAgo(52),
      scheduledFor: minutesAgo(35),
      creatorId: requester.id,
    },
    ["wellness", "household", "senior-support"],
  );

  const heatmapTasks = [
    {
      task: {
        title: "Pharmacy relay for evening dose",
        description: "Need a captain to pick up a prescription and deliver it before dinner.",
        category: "ERRANDS" as const,
        taskType: "TOKEN_FUNDED" as const,
        status: "MATCHING" as const,
        urgency: "HIGH" as const,
        tokenBudget: 26,
        locationLabel: "West Loop, Chicago",
        latitude: 41.8842,
        longitude: -87.6481,
        radiusKm: 6,
        requestedAt: minutesAgo(6),
        creatorId: requester.id,
      },
      skillSlugs: ["errands", "senior-support", "delivery"],
    },
    {
      task: {
        title: "Short ride to clinic check-in",
        description: "Quick mobility help needed for a medical check-in across downtown.",
        category: "MOBILITY" as const,
        taskType: "TOKEN_FUNDED" as const,
        status: "OPEN" as const,
        urgency: "HIGH" as const,
        tokenBudget: 32,
        locationLabel: "West Loop, Chicago",
        latitude: 41.8842,
        longitude: -87.6481,
        radiusKm: 7,
        requestedAt: minutesAgo(12),
        creatorId: requester.id,
      },
      skillSlugs: ["mobility", "senior-support"],
    },
    {
      task: {
        title: "Courier drop to Ogilvie lobby",
        description: "A local package needs to reach the Ogilvie lobby before pickup closes.",
        category: "DELIVERY" as const,
        taskType: "TOKEN_FUNDED" as const,
        status: "OPEN" as const,
        urgency: "MEDIUM" as const,
        tokenBudget: 18,
        locationLabel: "West Loop, Chicago",
        latitude: 41.8842,
        longitude: -87.6481,
        radiusKm: 6,
        requestedAt: minutesAgo(18),
        creatorId: requester.id,
      },
      skillSlugs: ["delivery", "errands"],
    },
    {
      task: {
        title: "Algebra rescue before exam",
        description: "One-hour tutoring help needed before tomorrow's algebra test.",
        category: "LEARNING" as const,
        taskType: "VOLUNTEER" as const,
        status: "MATCHING" as const,
        urgency: "MEDIUM" as const,
        tokenBudget: 0,
        locationLabel: "River North, Chicago",
        latitude: 41.8924,
        longitude: -87.6341,
        radiusKm: 8,
        requestedAt: minutesAgo(7),
        creatorId: requester.id,
      },
      skillSlugs: ["teaching", "math", "student-support"],
    },
    {
      task: {
        title: "Urgent grocery top-up for senior floor",
        description: "Need two grocery bags delivered to a senior high-rise tonight.",
        category: "ERRANDS" as const,
        taskType: "TOKEN_FUNDED" as const,
        status: "MATCHING" as const,
        urgency: "HIGH" as const,
        tokenBudget: 20,
        locationLabel: "River North, Chicago",
        latitude: 41.8924,
        longitude: -87.6341,
        radiusKm: 8,
        requestedAt: minutesAgo(15),
        creatorId: requester.id,
      },
      skillSlugs: ["errands", "senior-support"],
    },
    {
      task: {
        title: "Prescription drop to condo lobby",
        description: "Medication pickup is ready and needs to get across the neighborhood fast.",
        category: "DELIVERY" as const,
        taskType: "TOKEN_FUNDED" as const,
        status: "OPEN" as const,
        urgency: "HIGH" as const,
        tokenBudget: 24,
        locationLabel: "River North, Chicago",
        latitude: 41.8924,
        longitude: -87.6341,
        radiusKm: 7,
        requestedAt: minutesAgo(23),
        creatorId: requester.id,
      },
      skillSlugs: ["delivery", "errands"],
    },
    {
      task: {
        title: "Evening wellness check after procedure",
        description: "A neighbor needs a calm check-in and help settling back in after a procedure.",
        category: "WELLNESS" as const,
        taskType: "TOKEN_FUNDED" as const,
        status: "MATCHING" as const,
        urgency: "HIGH" as const,
        tokenBudget: 22,
        locationLabel: "South Loop, Chicago",
        latitude: 41.8721,
        longitude: -87.6298,
        radiusKm: 6,
        requestedAt: minutesAgo(5),
        creatorId: requester.id,
      },
      skillSlugs: ["wellness", "senior-support"],
    },
    {
      task: {
        title: "Lift grocery totes upstairs",
        description: "Quick household help needed carrying groceries up one flight of stairs.",
        category: "HOUSEHOLD" as const,
        taskType: "TOKEN_FUNDED" as const,
        status: "OPEN" as const,
        urgency: "MEDIUM" as const,
        tokenBudget: 14,
        locationLabel: "South Loop, Chicago",
        latitude: 41.8721,
        longitude: -87.6298,
        radiusKm: 5,
        requestedAt: minutesAgo(17),
        creatorId: requester.id,
      },
      skillSlugs: ["household", "wellness"],
    },
    {
      task: {
        title: "Quiet companionship visit",
        description: "Friendly volunteer check-in requested for a neighbor who would like company.",
        category: "WELLNESS" as const,
        taskType: "VOLUNTEER" as const,
        status: "OPEN" as const,
        urgency: "LOW" as const,
        tokenBudget: 0,
        locationLabel: "South Loop, Chicago",
        latitude: 41.8721,
        longitude: -87.6298,
        radiusKm: 5,
        requestedAt: minutesAgo(33),
        creatorId: requester.id,
      },
      skillSlugs: ["wellness", "senior-support"],
    },
    {
      task: {
        title: "Laptop setup for job application",
        description: "Need help connecting a webcam and finishing an online application tonight.",
        category: "LEARNING" as const,
        taskType: "VOLUNTEER" as const,
        status: "OPEN" as const,
        urgency: "MEDIUM" as const,
        tokenBudget: 0,
        locationLabel: "Logan Square, Chicago",
        latitude: 41.9295,
        longitude: -87.7071,
        radiusKm: 8,
        requestedAt: minutesAgo(27),
        creatorId: requester.id,
      },
      skillSlugs: ["teaching", "student-support"],
    },
    {
      task: {
        title: "Same-day pharmacy run",
        description: "A neighborhood pharmacy pickup needs to happen before it closes.",
        category: "ERRANDS" as const,
        taskType: "TOKEN_FUNDED" as const,
        status: "MATCHING" as const,
        urgency: "HIGH" as const,
        tokenBudget: 27,
        locationLabel: "Logan Square, Chicago",
        latitude: 41.9295,
        longitude: -87.7071,
        radiusKm: 8,
        requestedAt: minutesAgo(39),
        creatorId: requester.id,
      },
      skillSlugs: ["errands", "mobility", "senior-support"],
    },
    {
      task: {
        title: "Wheelchair assist to community center",
        description: "Mobility support needed for a short evening ride to a neighborhood program.",
        category: "MOBILITY" as const,
        taskType: "TOKEN_FUNDED" as const,
        status: "OPEN" as const,
        urgency: "MEDIUM" as const,
        tokenBudget: 16,
        locationLabel: "Hyde Park, Chicago",
        latitude: 41.7943,
        longitude: -87.5907,
        radiusKm: 7,
        requestedAt: minutesAgo(14),
        creatorId: requester.id,
      },
      skillSlugs: ["mobility", "wellness"],
    },
    {
      task: {
        title: "Meal drop for recovering neighbor",
        description: "A hot meal is ready and needs a quick handoff to a nearby apartment.",
        category: "DELIVERY" as const,
        taskType: "TOKEN_FUNDED" as const,
        status: "MATCHING" as const,
        urgency: "MEDIUM" as const,
        tokenBudget: 15,
        locationLabel: "Hyde Park, Chicago",
        latitude: 41.7943,
        longitude: -87.5907,
        radiusKm: 7,
        requestedAt: minutesAgo(26),
        creatorId: requester.id,
      },
      skillSlugs: ["delivery", "wellness"],
    },
  ];

  for (const entry of heatmapTasks) {
    await createTaskWithSkills(entry.task, entry.skillSlugs);
  }

  await prisma.taskOffer.create({
    data: {
      taskId: medicineTask.id,
      captainId: captainJordan.id,
      status: "PENDING",
      note: "Nearby and ready to pick up immediately.",
    },
  });

  await prisma.taskOffer.create({
    data: {
      taskId: medicineTask.id,
      captainId: captainPriya.id,
      status: "DECLINED",
      note: "Available later today but not in time for this request.",
      respondedAt: minutesAgo(18),
    },
  });

  const tutoringOfferPriya = await prisma.taskOffer.create({
    data: {
      taskId: tutoringTask.id,
      captainId: captainPriya.id,
      status: "ACCEPTED",
      note: "Happy to take the tutoring session.",
      respondedAt: hoursAgo(31),
    },
  });

  const wellnessOfferAmina = await prisma.taskOffer.create({
    data: {
      taskId: wellnessTask.id,
      captainId: captainAmina.id,
      status: "ACCEPTED",
      note: "Can arrive within 20 minutes.",
      respondedAt: minutesAgo(48),
    },
  });

  const tutoringAssignment = await prisma.assignment.create({
    data: {
      taskId: tutoringTask.id,
      captainId: captainPriya.id,
      offerId: tutoringOfferPriya.id,
      status: "COMPLETED",
      acceptedAt: hoursAgo(31),
      startedAt: hoursAgo(6),
      completedAt: hoursAgo(5),
    },
  });

  const wellnessAssignment = await prisma.assignment.create({
    data: {
      taskId: wellnessTask.id,
      captainId: captainAmina.id,
      offerId: wellnessOfferAmina.id,
      status: "ACTIVE",
      acceptedAt: minutesAgo(48),
      startedAt: minutesAgo(35),
    },
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
        confirmedAt: minutesAgo(47),
      },
      {
        walletId: captainPriya.wallet!.id,
        assignmentId: tutoringAssignment.id,
        direction: "CREDIT",
        type: "MANUAL_ADJUSTMENT",
        status: "CONFIRMED",
        amountTokens: 12,
        reason: "Hackathon demo reward credit",
        confirmedAt: hoursAgo(4),
      },
      {
        walletId: captainAmina.wallet!.id,
        assignmentId: wellnessAssignment.id,
        direction: "CREDIT",
        type: "REWARD_PAYOUT",
        status: "PENDING",
        amountTokens: 18,
        reason: "Reward queued for active wellness assignment",
      },
    ],
  });

  await prisma.rating.create({
    data: {
      assignmentId: tutoringAssignment.id,
      authorId: requester.id,
      targetId: captainPriya.id,
      score: 5,
      note: "Clear explanations and right on time.",
    },
  });

  console.log(
    JSON.stringify(
      {
        seededBy: admin.email,
        demoPassword: seededDemoPassword,
        skills: skills.length,
        users: 5,
        tasks: 3 + heatmapTasks.length,
        pendingOffers: 1,
        activeAssignments: 1,
        completedAssignments: 1,
        nextSuggestedRefreshAt: minutesFromNow(10).toISOString(),
      },
      null,
      2,
    ),
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
