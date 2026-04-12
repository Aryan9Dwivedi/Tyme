/* eslint-disable @typescript-eslint/no-explicit-any */

function titleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function minutesSince(dateValue: Date | string | null | undefined) {
  if (!dateValue) {
    return 0;
  }

  const then = new Date(dateValue).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);

  return Math.max(1, Math.round(diff / 60000));
}

function avatarUrl(name: string, seed: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f766e&color=ffffff&bold=true&rounded=true&size=128&seed=${encodeURIComponent(seed)}`;
}

export function averageRating(ratings: Array<{ score: number }> | null | undefined) {
  if (!ratings?.length) {
    return 0;
  }

  const total = ratings.reduce((sum, rating) => sum + rating.score, 0);
  return Number((total / ratings.length).toFixed(1));
}

export function captainSummaryFromUser(user: any) {
  const captainProfile = user.captainProfile;
  const rating = averageRating(user.ratingsReceived);
  const skills =
    captainProfile?.skills?.map((link: any) => link.skill.label ?? titleCase(link.skill.slug)) ??
    [];

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: avatarUrl(user.name, user.id),
    headline: captainProfile?.headline ?? user.name,
    bio: captainProfile?.bio ?? "",
    availability: captainProfile?.availabilityStatus ?? "OFFLINE",
    is_available_now: captainProfile?.isAvailableNow ?? false,
    location_label: captainProfile?.locationLabel ?? "Current city",
    radius_km: captainProfile?.radiusKm ?? 10,
    trust_score: captainProfile?.trustScore ?? 50,
    response_rate: Math.round(
      typeof captainProfile?.responseRate === "number" && captainProfile.responseRate <= 1
        ? captainProfile.responseRate * 100
        : captainProfile?.responseRate ?? 0,
    ),
    completed_tasks: captainProfile?.tasksCompleted ?? 0,
    average_rating: rating || Number(((captainProfile?.trustScore ?? 50) / 20).toFixed(1)),
    skills,
  };
}

export function recommendationViewFromRanking(recommendation: any, status = "PENDING") {
  return {
    captain_id: recommendation.captain.id,
    name: recommendation.captain.name,
    headline: recommendation.captain.headline,
    total_score: recommendation.totalScore,
    distance_km: recommendation.distanceKm,
    skill_match: recommendation.breakdown.skillMatch,
    reasons: recommendation.reasons,
    why_fit: recommendation.reasons[0] ?? "Strong nearby match",
    status,
  };
}

export function taskViewFromRecord(task: any) {
  const assignment = task.assignment ?? null;
  const assignedCaptain = assignment?.captain ?? null;
  const offers = task.offers ?? [];
  const ratings = assignment?.ratings ?? [];
  const payoutTransaction = assignment?.payoutTransactions?.[0] ?? null;

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    category: task.category,
    task_type: task.taskType,
    status: task.status,
    urgency: task.urgency,
    token_budget: task.tokenBudget,
    location_address: task.locationLabel,
    latitude: task.latitude,
    longitude: task.longitude,
    radius_km: task.radiusKm,
    voice_transcript: task.voiceTranscript,
    notes: task.notes,
    created_date: task.createdAt ?? task.requestedAt,
    requested_at: task.requestedAt,
    scheduled_for: task.scheduledFor,
    creator_id: task.creatorId,
    creator_name: task.creator?.name ?? null,
    captain_id: assignedCaptain?.id ?? null,
    captain: assignedCaptain ? captainSummaryFromUser(assignedCaptain) : null,
    assignment_id: assignment?.id ?? null,
    assignment_status: assignment?.status ?? null,
    accepted_at: assignment?.acceptedAt ?? null,
    started_at: assignment?.startedAt ?? null,
    completed_at: assignment?.completedAt ?? null,
    payout_status: payoutTransaction?.status ?? null,
    payout_amount: payoutTransaction?.amountTokens ?? task.tokenBudget ?? 0,
    payout_released_at: payoutTransaction?.confirmedAt ?? null,
    required_skills:
      task.requiredSkills?.map((link: any) => link.skill.label ?? titleCase(link.skill.slug)) ?? [],
    required_skill_slugs:
      task.requiredSkills?.map((link: any) => link.skill.slug) ?? [],
    offer_count: offers.length,
    pending_offers: offers.filter((offer: any) => offer.status === "PENDING").length,
    feedback: ratings.map((rating: any) => ({
      id: rating.id,
      score: rating.score,
      note: rating.note,
      author_id: rating.authorId,
      target_id: rating.targetId,
      author_name: rating.author?.name ?? "Unknown",
      target_name: rating.target?.name ?? "Unknown",
      created_at: rating.createdAt,
    })),
  };
}

export function opportunityViewFromOffer(offer: any, recommendation: any) {
  return {
    id: offer.id,
    offer_id: offer.id,
    task_id: offer.taskId,
    title: offer.task.title,
    description: offer.task.description,
    category: offer.task.category,
    urgency: offer.task.urgency,
    token_budget: offer.task.tokenBudget,
    task_type: offer.task.taskType,
    status: offer.task.status,
    location_address: offer.task.locationLabel,
    radius_km: offer.task.radiusKm,
    posted_mins_ago: minutesSince(offer.task.requestedAt ?? offer.task.createdAt),
    distance_km: recommendation?.distanceKm ?? 0,
    skill_match: recommendation?.breakdown?.skillMatch ?? 0,
    why_fit: recommendation?.reasons?.[0] ?? offer.note ?? "You are a strong local fit",
    ranking_score: recommendation?.totalScore ?? 0,
    required_skills:
      offer.task.requiredSkills?.map((link: any) => link.skill.label ?? titleCase(link.skill.slug)) ?? [],
  };
}

export function assignmentViewFromRecord(assignment: any) {
  const payoutTransaction = assignment.payoutTransactions?.[0] ?? null;

  return {
    id: assignment.id,
    task_id: assignment.taskId,
    title: assignment.task.title,
    description: assignment.task.description,
    category: assignment.task.category,
    urgency: assignment.task.urgency,
    token_budget: assignment.task.tokenBudget,
    task_type: assignment.task.taskType,
    status: assignment.task.status,
    assignment_status: assignment.status,
    location_address: assignment.task.locationLabel,
    radius_km: assignment.task.radiusKm,
    required_skills:
      assignment.task.requiredSkills?.map((link: any) => link.skill.label ?? titleCase(link.skill.slug)) ??
      [],
    created_date: assignment.task.createdAt ?? assignment.task.requestedAt,
    scheduled_for: assignment.task.scheduledFor,
    accepted_at: assignment.acceptedAt,
    started_at: assignment.startedAt,
    completed_at: assignment.completedAt,
    payout_status: payoutTransaction?.status ?? null,
    payout_amount: payoutTransaction?.amountTokens ?? assignment.task.tokenBudget ?? 0,
    payout_released_at: payoutTransaction?.confirmedAt ?? null,
    requester: assignment.task.creator
      ? {
          id: assignment.task.creator.id,
          name: assignment.task.creator.name,
          email: assignment.task.creator.email,
          phone: assignment.task.creator.phone ?? null,
          avatar_url: avatarUrl(assignment.task.creator.name, assignment.task.creator.id),
        }
      : null,
    feedback: assignment.ratings?.map((rating: any) => ({
      id: rating.id,
      score: rating.score,
      note: rating.note,
      author_id: rating.authorId,
      target_id: rating.targetId,
      author_name: rating.author?.name ?? "Unknown",
      target_name: rating.target?.name ?? "Unknown",
    })) ?? [],
  };
}
