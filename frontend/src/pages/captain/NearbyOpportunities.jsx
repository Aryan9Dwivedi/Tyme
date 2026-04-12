// @ts-nocheck

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, MapPin, LoaderCircle } from "lucide-react";

import AppShell from "../../components/AppShell";
import OpportunityCard from "../../components/OpportunityCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { acceptCaptainOpportunity, declineCaptainOpportunity, fetchCaptainOpportunities } from "@/lib/platform-api";
import { toast } from "@/components/ui/use-toast";

export default function NearbyOpportunities() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");

  const opportunitiesQuery = useQuery({
    queryKey: ["captain-opportunities"],
    queryFn: fetchCaptainOpportunities,
    refetchInterval: 4000,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ offerId, type }) => {
      if (type === "accept") {
        return acceptCaptainOpportunity(offerId);
      }

      return declineCaptainOpportunity(offerId);
    },
    onSuccess: async (_, variables) => {
      toast({
        title: variables.type === "accept" ? "Opportunity accepted" : "Opportunity passed",
        description:
          variables.type === "accept"
            ? "The requester is being updated in real time now."
            : "Tyme will keep the next best ranked task coming.",
      });
      await queryClient.invalidateQueries({ queryKey: ["captain-opportunities"] });
      await queryClient.invalidateQueries({ queryKey: ["captain-dashboard"] });
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

  const opportunities = (opportunitiesQuery.data?.opportunities ?? []).filter((opportunity) => {
    if (catFilter !== "ALL" && opportunity.category !== catFilter) {
      return false;
    }
    if (search && !`${opportunity.title} ${opportunity.description}`.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const categories = Array.from(
    new Set((opportunitiesQuery.data?.opportunities ?? []).map((opportunity) => opportunity.category)),
  );

  return (
    <AppShell role="captain">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink mb-0.5">Nearby Opportunities</h1>
          <div className="flex items-center gap-2 text-sm text-ink-tertiary">
            <MapPin size={13} className="text-teal" />
            Ranked live from the Tyme recommendation engine
            {opportunitiesQuery.isFetching && <LoaderCircle size={12} className="animate-spin text-teal" />}
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search opportunities..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
          <button
            onClick={() => setCatFilter("ALL")}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              catFilter === "ALL" ? "bg-ink text-white" : "bg-white border border-border text-ink-secondary hover:border-teal/30"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCatFilter(category)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                catFilter === category ? "bg-ink text-white" : "bg-white border border-border text-ink-secondary hover:border-teal/30"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {opportunitiesQuery.isLoading ? (
          <div className="rounded-3xl border border-border bg-white px-6 py-10 text-sm text-ink-tertiary">
            Loading the captain feed...
          </div>
        ) : opportunities.length === 0 ? (
          <EmptyState
            icon="📍"
            title="No ranked tasks right now"
            description="Stay online and Tyme will refresh this feed as soon as a nearby task needs you."
          />
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-ink-tertiary">{opportunities.length} opportunities available</div>
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onAccept={() => actionMutation.mutate({ offerId: opportunity.offer_id, type: "accept" })}
                onDecline={() => actionMutation.mutate({ offerId: opportunity.offer_id, type: "decline" })}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
