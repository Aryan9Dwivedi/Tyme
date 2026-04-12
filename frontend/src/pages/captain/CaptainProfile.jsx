import { useState } from "react";
import { Check, Shield, ToggleLeft, ToggleRight } from "lucide-react";

import AppShell from "../../components/AppShell";
import { TrustScore, AvailabilityDot } from "../../components/ui/StatusBadge";
import { useAuth } from "@/lib/AuthContext";
import { getCaptainProfileViewModel } from "@/lib/auth-view-models";
import { SKILLS } from "../../lib/mockData";

export default function CaptainProfile() {
  const { user } = useAuth();
  const currentCaptainProfile = getCaptainProfileViewModel(user);
  const [availability, setAvailability] = useState(currentCaptainProfile.availability);
  const [skills, setSkills] = useState(currentCaptainProfile.skills);
  const [bio, setBio] = useState(currentCaptainProfile.bio);
  const [saved, setSaved] = useState(false);

  const toggleSkill = (skill) => {
    setSkills((previous) =>
      previous.includes(skill) ? previous.filter((entry) => entry !== skill) : [...previous, skill],
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const cycleAvailability = () => {
    const states = ["ONLINE", "BUSY", "OFFLINE"];
    const next = states[(states.indexOf(availability) + 1) % states.length];
    setAvailability(next);
  };

  return (
    <AppShell role="captain">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 space-y-5">
        <h1 className="text-xl font-bold text-ink">Captain Profile</h1>

        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-5">
            <img src={currentCaptainProfile.avatar_url} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" alt="" />
            <div className="flex-1">
              <div className="font-bold text-ink text-lg">{user?.name || "Captain"}</div>
              <div className="text-sm text-ink-tertiary mb-2">{currentCaptainProfile.location_city}</div>
              <div className="flex items-center gap-3 flex-wrap">
                <AvailabilityDot status={availability} />
                {currentCaptainProfile.is_verified && (
                  <span className="flex items-center gap-1 text-xs text-teal font-medium bg-teal-light px-2 py-0.5 rounded-full">
                    <Shield size={10} /> Verified
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <TrustScore score={currentCaptainProfile.trust_score} size="lg" />
              <div className="text-[10px] text-ink-tertiary mt-1">Trust Score</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center py-2.5 bg-secondary rounded-xl">
              <div className="text-lg font-bold text-ink">{currentCaptainProfile.completed_tasks}</div>
              <div className="text-[10px] text-ink-tertiary">Completed</div>
            </div>
            <div className="text-center py-2.5 bg-secondary rounded-xl">
              <div className="text-lg font-bold text-amber">{currentCaptainProfile.average_rating}★</div>
              <div className="text-[10px] text-ink-tertiary">Avg rating</div>
            </div>
            <div className="text-center py-2.5 bg-secondary rounded-xl">
              <div className="text-lg font-bold text-teal">{currentCaptainProfile.response_rate}%</div>
              <div className="text-[10px] text-ink-tertiary">Response</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-ink">Availability</h3>
              <p className="text-xs text-ink-tertiary mt-0.5">Toggle to receive or pause task offers</p>
            </div>
            <button
              onClick={cycleAvailability}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                availability === "ONLINE"
                  ? "bg-emerald-light border-emerald/30 text-emerald"
                  : availability === "BUSY"
                  ? "bg-amber-light border-amber/30 text-amber"
                  : "bg-secondary border-border text-ink-secondary"
              }`}
            >
              {availability === "ONLINE" ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              {availability}
            </button>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-ink mb-3">Bio</h3>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            className="input-premium resize-none"
            rows={4}
            placeholder="Describe your experience and what makes you a great Captain..."
          />
        </div>

        <div className="bg-white border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-ink mb-1">Your Skills</h3>
          <p className="text-xs text-ink-tertiary mb-4">Select the skills you can offer. These help with task matching.</p>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((skill) => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  skills.includes(skill)
                    ? "bg-ink text-white border-ink"
                    : "bg-white border-border text-ink-secondary hover:border-teal/30"
                }`}
              >
                {skills.includes(skill) && <Check size={10} className="inline mr-1" />}
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              saved ? "bg-emerald text-white" : "bg-ink text-white hover:bg-ink/90"
            }`}
          >
            {saved ? (
              <>
                <Check size={14} />
                Saved!
              </>
            ) : (
              "Save profile"
            )}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
