// @ts-nocheck

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CheckCircle, Coins, Star, ToggleRight, Zap, LoaderCircle } from "lucide-react";

import AppShell from "../../components/AppShell";
import StatCard from "../../components/StatCard";
import OpportunityCard from "../../components/OpportunityCard";
import CaptainDemandPanel from "../../components/captain/CaptainDemandPanel";
import IncomingOpportunityDialog from "../../components/captain/IncomingOpportunityDialog";
import { AvailabilityDot, TrustScore } from "../../components/ui/StatusBadge";
import { toast } from "@/components/ui/use-toast";
import {
  acceptCaptainOpportunity,
  declineCaptainOpportunity,
  fetchCaptainDashboard,
} from "@/lib/platform-api";

export default function CaptainDashboard() {
  const queryClient = useQueryClient();
  const [incomingOpportunity, setIncomingOpportunity] = useState(null);
  const seenOpportunityIdsRef = useRef(new Set());
  const hasHydratedOpportunitiesRef = useRef(false);

  const dashboardQuery = useQuery({
    queryKey: ["captain-dashboard"],
    queryFn: fetchCaptainDashboard,
    refetchInterval: 4000,
  });

  const profile = dashboardQuery.data?.profile;
  const opportunities = dashboardQuery.data?.opportunities ?? [];
  const assignments = dashboardQuery.data?.assignments ?? [];
  const recentRatings = dashboardQuery.data?.recentRatings ?? [];
  const stats = dashboardQuery.data?.stats ?? {
    activeAssignments: 0,
    completedAssignments: 0,
    earnings: 0,
  };

  const actionMutation = useMutation({
    mutationFn: async ({ offerId, type }) => {
      if (type === "accept") {
        return acceptCaptainOpportunity(offerId);
      }

      return declineCaptainOpportunity(offerId);
    },
    onSuccess: async (_, variables) => {
      setIncomingOpportunity(null);
      toast({
        title: variables.type === "accept" ? "Opportunity accepted" : "Opportunity passed",
        description:
          variables.type === "accept"
            ? "The requester is being updated in real time now."
            : "Tyme will keep rolling the next best fit into your lane.",
      });
      await queryClient.invalidateQueries({ queryKey: ["captain-dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["captain-opportunities"] });
      await queryClient.invalidateQueries({ queryKey: ["captain-assignments"] });
    },
    onError: (error) => {
      toast({
        title: "That action did not go through",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!opportunities.length) {
      return;
    }

    if (!hasHydratedOpportunitiesRef.current) {
      opportunities.forEach((opportunity) => seenOpportunityIdsRef.current.add(opportunity.offer_id));
      hasHydratedOpportunitiesRef.current = true;
      return;
    }

    const freshOpportunity = opportunities.find(
      (opportunity) => !seenOpportunityIdsRef.current.has(opportunity.offer_id),
    );

    if (!freshOpportunity) {
      return;
    }

    seenOpportunityIdsRef.current.add(freshOpportunity.offer_id);
    setIncomingOpportunity(freshOpportunity);
    toast({
      title: "New captain ping",
      description: `${freshOpportunity.title} just landed in your queue.`,
    });
  }, [opportunities]);

  return (
    <AppShell role="captain">
      <IncomingOpportunityDialog
        open={Boolean(incomingOpportunity)}
        opportunity={incomingOpportunity}
        onOpenChange={(open) => {
          if (!open) {
            setIncomingOpportunity(null);
          }
        }}
        onAccept={(opportunity) => actionMutation.mutate({ offerId: opportunity.offer_id, type: "accept" })}
        onDecline={(opportunity) => actionMutation.mutate({ offerId: opportunity.offer_id, type: "decline" })}
        isSubmitting={actionMutation.isPending}
      />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-ink-tertiary mb-3">
              {dashboardQuery.isFetching && <LoaderCircle size={12} className="animate-spin text-teal" />}
              Live captain feed
            </div>
            <h1 className="text-2xl font-bold text-ink mb-1">Captain Workspace</h1>
            <div className="flex items-center gap-3">
              <AvailabilityDot status={profile?.availability ?? "OFFLINE"} />
              <div className="w-px h-4 bg-border" />
              <span className="text-xs text-ink-tertiary">{profile?.location_label ?? "Your service area"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border bg-secondary border-border text-ink-secondary">
            <ToggleRight size={16} />
            {profile?.availability ?? "OFFLINE"}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Trust Score"
            value={<TrustScore score={profile?.trust_score ?? 0} size="lg" />}
            sub="feedback powered"
            icon={Star}
            accent
          />
          <StatCard label="Response Rate" value={`${profile?.response_rate ?? 0}%`} icon={Zap} sub="captain responsiveness" />
          <StatCard label="Completed" value={stats.completedAssignments} icon={CheckCircle} sub="successful handoffs" />
          <StatCard label="Wallet" value={`${stats.earnings} TB`} icon={Coins} sub="available rewards" />
        </div>

        <CaptainDemandPanel />

        <div className="grid md:grid-cols-2 gap-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-ink">Recommended opportunities</h2>
                <p className="text-xs text-ink-tertiary">{opportunities.length} ranked tasks near you</p>
              </div>
              <Link to="/captain/opportunities" className="text-xs text-teal font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>
            <div className="space-y-3">
              {opportunities.length ? opportunities.slice(0, 2).map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              )) : (
                <div className="rounded-2xl border border-border bg-white px-5 py-6 text-sm text-ink-tertiary">
                  Tyme is waiting for the next ranked task to hit your lane.
                </div>
              )}
            </div>
          </section>

          <div className="space-y-5">
            <div className="bg-white border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-ink mb-4">Performance snapshot</h3>
              <div className="space-y-3">
                {[
                  { label: "Average rating", value: `${profile?.average_rating ?? 0}★`, color: "text-amber" },
                  { label: "Active assignments", value: `${stats.activeAssignments}`, color: "text-teal" },
                  { label: "Service radius", value: `${profile?.radius_km ?? 0} km`, color: "text-emerald" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-ink-secondary">{item.label}</span>
                    <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-ink">Recent ratings</h3>
                <div className="flex items-center gap-1 text-amber text-sm font-semibold">
                  {profile?.average_rating ?? 0}★
                </div>
              </div>
              <div className="space-y-4">
                {recentRatings.length ? recentRatings.map((rating) => (
                  <div key={rating.id}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} size={12} className={index < rating.score ? "text-amber fill-amber" : "text-border"} />
                        ))}
                      </div>
                      <span className="text-xs text-ink-tertiary">{rating.rater_name}</span>
                    </div>
                    <p className="text-xs text-ink-secondary leading-relaxed">"{rating.comment || "Strong handoff."}"</p>
                  </div>
                )) : (
                  <div className="text-sm text-ink-tertiary">Your new ratings will appear here after completed assignments.</div>
                )}
              </div>
            </div>

            <div className="bg-white border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-ink mb-3">Your skills</h3>
              <div className="flex flex-wrap gap-2">
                {(profile?.skills ?? []).map((skill) => (
                  <span key={skill} className="px-3 py-1.5 bg-teal-light text-teal text-xs font-medium rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
              <Link to="/captain/assignments" className="text-xs text-teal font-medium hover:underline mt-3 block">
                Open your live assignments →
              </Link>
            </div>
          </div>
        </div>

        {assignments.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink">Assignment flow</h2>
              <Link to="/captain/assignments" className="text-xs text-teal font-medium hover:underline flex items-center gap-1">
                Manage <ArrowRight size={11} />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {assignments.slice(0, 2).map((assignment) => (
                <div key={assignment.id} className="rounded-2xl border border-border bg-white px-5 py-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-ink-tertiary mb-2">{assignment.assignment_status}</div>
                  <div className="font-semibold text-ink">{assignment.title}</div>
                  <p className="text-sm text-ink-tertiary mt-1">{assignment.location_address}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
