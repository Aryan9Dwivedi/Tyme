// @ts-nocheck

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  Coins,
  LoaderCircle,
  MapPin,
  Mic,
  RefreshCw,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";

import AppShell from "../components/AppShell";
import { toast } from "@/components/ui/use-toast";
import { assistTask, createTask, fetchTask, updateTask, voiceAssistTask } from "@/lib/platform-api";

const CATEGORY_OPTIONS = [
  { value: "ERRANDS", label: "Errands", icon: "Shopping" },
  { value: "MOBILITY", label: "Mobility", icon: "Ride" },
  { value: "WELLNESS", label: "Wellness", icon: "Care" },
  { value: "LEARNING", label: "Learning", icon: "Tutor" },
  { value: "HOUSEHOLD", label: "Household", icon: "Home" },
  { value: "DELIVERY", label: "Delivery", icon: "Drop" },
  { value: "OTHER", label: "Other", icon: "Other" },
];

const URGENCY_OPTIONS = [
  { value: "LOW", label: "Flexible" },
  { value: "MEDIUM", label: "Today" },
  { value: "HIGH", label: "ASAP" },
];

const TASK_TYPE_OPTIONS = [
  {
    value: "TOKEN_FUNDED",
    label: "Reward a captain",
    description: "Offer Wild Cash so nearby captains jump in fast.",
  },
  {
    value: "VOLUNTEER",
    label: "Volunteer help",
    description: "Open it up to captains without a Wild Cash reward.",
  },
];

const MAX_VOICE_RECORDING_MS = 45000;
const MIN_SPEECH_CAPTURE_MS = 1400;
const SILENCE_STOP_DELAY_MS = 1200;
const EMPTY_SPEECH_STOP_DELAY_MS = 2600;
const VOICE_ACTIVITY_THRESHOLD = 0.018;
const SUPPORTED_VOICE_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

function createEmptyForm() {
  return {
    title: "",
    description: "",
    category: "",
    taskType: "TOKEN_FUNDED",
    urgency: "MEDIUM",
    tokenBudget: 20,
    locationLabel: "",
    latitude: null,
    longitude: null,
    radiusKm: 5,
    requiredSkills: [],
    notes: "",
    voiceTranscript: "",
  };
}

function extractFirstSentence(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const sentence = trimmed.split(/[.!?]/)[0] ?? trimmed;
  return sentence.length > 90 ? `${sentence.slice(0, 87)}...` : sentence;
}

function getSupportedVoiceMimeType() {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return "";
  }

  return (
    SUPPORTED_VOICE_MIME_TYPES.find((mimeType) =>
      typeof MediaRecorder.isTypeSupported === "function" ? MediaRecorder.isTypeSupported(mimeType) : false,
    ) ?? ""
  );
}

function getVoiceFileExtension(mimeType) {
  if (mimeType.includes("mp4")) {
    return "mp4";
  }

  if (mimeType.includes("ogg")) {
    return "ogg";
  }

  return "webm";
}

function createAssistPayload(formState) {
  return {
    title: formState.title,
    description: formState.description,
    transcript: formState.voiceTranscript,
    category: formState.category,
    taskType: formState.taskType,
    urgency: formState.urgency,
    tokenBudget: formState.tokenBudget,
    radiusKm: formState.radiusKm,
    locationLabel: formState.locationLabel,
    latitude: formState.latitude,
    longitude: formState.longitude,
    notes: formState.notes,
  };
}

function createAssistSignature(formState) {
  return JSON.stringify(createAssistPayload(formState));
}

function isCurrentDeviceLocationLabel(value) {
  const normalized = value?.trim().toLowerCase();
  return !normalized || ["current device location", "current location", "live pin", "near you"].includes(normalized);
}

function mergeVoiceAssistIntoForm(current, payload, skillsTouched) {
  return {
    ...current,
    title: payload.draft.title || current.title || extractFirstSentence(payload.transcript ?? ""),
    description: payload.draft.description || current.description,
    category: payload.draft.category || current.category,
    taskType: payload.draft.taskType || current.taskType,
    urgency: payload.draft.urgency ?? current.urgency,
    tokenBudget: payload.draft.taskType === "TOKEN_FUNDED" ? payload.draft.tokenBudget : 0,
    radiusKm: payload.draft.radiusKm ?? current.radiusKm,
    locationLabel: current.locationLabel || payload.draft.locationLabel,
    latitude: current.latitude ?? payload.draft.latitude,
    longitude: current.longitude ?? payload.draft.longitude,
    notes: current.notes || payload.draft.notes,
    voiceTranscript: (payload.transcript ?? payload.combinedTranscript ?? "").trim(),
    requiredSkills:
      skillsTouched && current.requiredSkills.length
        ? current.requiredSkills
        : (payload.draft.requiredSkills ?? payload.suggestedSkills ?? []).slice(0, 4),
  };
}

function mergeAssistIntoForm(current, payload, skillsTouched) {
  return {
    ...current,
    title: current.title || payload.draft.title,
    description: current.description || payload.draft.description,
    category: current.category || payload.draft.category,
    taskType: current.taskType || payload.draft.taskType,
    urgency: payload.draft.urgency ?? current.urgency,
    tokenBudget:
      current.taskType === "TOKEN_FUNDED" || payload.draft.taskType === "TOKEN_FUNDED"
        ? current.tokenBudget || payload.draft.tokenBudget
        : 0,
    radiusKm: current.radiusKm || payload.draft.radiusKm,
    locationLabel: current.locationLabel || payload.draft.locationLabel,
    latitude: current.latitude ?? payload.draft.latitude,
    longitude: current.longitude ?? payload.draft.longitude,
    notes: current.notes || payload.draft.notes,
    voiceTranscript: current.voiceTranscript || payload.draft.voiceTranscript || "",
    requiredSkills:
      skillsTouched && current.requiredSkills.length
        ? current.requiredSkills
        : (payload.draft.requiredSkills ?? payload.suggestedSkills ?? []).slice(0, 4),
  };
}

export default function CreateTask() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(id);
  const shouldStartVoice = searchParams.get("voice") === "1";
  const [form, setForm] = useState(createEmptyForm);
  const [locationMode, setLocationMode] = useState("device");
  const [locationStatus, setLocationStatus] = useState(
    "We will match captains around your live pin.",
  );
  const [isRecording, setIsRecording] = useState(false);
  const [skillsTouched, setSkillsTouched] = useState(false);
  const [manualSkill, setManualSkill] = useState("");
  const [voiceStatus, setVoiceStatus] = useState(
    "Speak naturally. ElevenLabs will transcribe your note and Gemini will shape the title, description, category, and skills.",
  );
  const [providerSummary, setProviderSummary] = useState({
    drafting: "",
    draftingModel: "",
    transcription: "",
    transcriptionModel: "",
  });
  const hasDeviceLocation = typeof form.latitude === "number" && typeof form.longitude === "number";
  const usingDeviceLocation = locationMode === "device";
  const latestFormRef = useRef(form);
  const assistSignatureRef = useRef("");
  const hasHydratedEditRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const voiceTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const voiceMonitorFrameRef = useRef(null);
  const silenceStopTimeoutRef = useRef(null);
  const recordingStartedAtRef = useRef(0);
  const speechDetectedRef = useRef(false);
  const autoStartedVoiceRef = useRef(false);

  useEffect(() => {
    latestFormRef.current = form;
  }, [form]);

  const taskQuery = useQuery({
    queryKey: ["task", id],
    queryFn: () => fetchTask(id),
    enabled: isEditing,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!taskQuery.data?.task || hasHydratedEditRef.current) {
      return;
    }

    const task = taskQuery.data.task;
    setForm({
      title: task.title ?? "",
      description: task.description ?? "",
      category: task.category ?? "ERRANDS",
      taskType: task.task_type ?? "TOKEN_FUNDED",
      urgency: task.urgency ?? "MEDIUM",
      tokenBudget: task.token_budget ?? 20,
      locationLabel: task.location_address ?? "",
      latitude: task.latitude ?? null,
      longitude: task.longitude ?? null,
      radiusKm: task.radius_km ?? 5,
      requiredSkills: task.required_skill_slugs ?? [],
      notes: task.notes ?? "",
      voiceTranscript: task.voice_transcript ?? "",
    });
    setLocationMode(isCurrentDeviceLocationLabel(task.location_address ?? "") ? "device" : "address");
    hasHydratedEditRef.current = true;
    setLocationStatus(task.location_address ? "Using the saved location for this task." : "Location ready.");
  }, [taskQuery.data]);

  const assistMutation = useMutation({
    mutationFn: assistTask,
    onSuccess: (payload) => {
      setForm((current) => mergeAssistIntoForm(current, payload, skillsTouched));
      setProviderSummary((current) => ({
        ...current,
        drafting: payload.providers?.drafting ?? current.drafting,
        draftingModel: payload.providers?.draftingModel ?? current.draftingModel,
      }));
      setVoiceStatus(
        payload.providers?.drafting === "gemini"
          ? "Tyme Assist refreshed the title, description, category, urgency, and skills."
          : "Tyme Assist refreshed the form using the local drafting fallback.",
      );
    },
  });

  const voiceAssistMutation = useMutation({
    mutationFn: voiceAssistTask,
    onSuccess: (payload) => {
      setProviderSummary({
        drafting: payload.providers?.drafting ?? "",
        draftingModel: payload.providers?.draftingModel ?? "",
        transcription: payload.providers?.transcription ?? "",
        transcriptionModel: payload.providers?.transcriptionModel ?? "",
      });
      setVoiceStatus(
        payload.providers?.drafting === "gemini"
          ? "Voice note synced. ElevenLabs captured it and Gemini refreshed the title, details, category, urgency, and skills."
          : "Voice note synced. ElevenLabs captured it and Tyme used the local drafting fallback to fill the form.",
      );
      setForm((current) => {
        return mergeVoiceAssistIntoForm(current, payload, skillsTouched);
      });
      assistSignatureRef.current = createAssistSignature({
        ...latestFormRef.current,
        title: payload.draft.title,
        description: payload.draft.description,
        category: payload.draft.category,
        taskType: payload.draft.taskType,
        urgency: payload.draft.urgency,
        tokenBudget: payload.draft.tokenBudget,
        radiusKm: payload.draft.radiusKm,
        voiceTranscript: payload.transcript ?? payload.combinedTranscript ?? "",
      });
    },
    onError: (error) => {
      setVoiceStatus("Voice assist could not finish. You can still type the task details manually.");
      toast({
        title: "Voice assist could not finish",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveTaskMutation = useMutation({
    mutationFn: async ({ publish }) => {
      const payload = {
        ...form,
        tokenBudget: form.taskType === "TOKEN_FUNDED" ? Number(form.tokenBudget) || 0 : 0,
        publish,
        status: publish ? "OPEN" : "DRAFT",
      };

      if (isEditing) {
        return updateTask(id, payload);
      }

      return createTask(payload);
    },
    onSuccess: (payload, variables) => {
      toast({
        title: variables.publish ? "Task is live" : "Draft saved",
        description: variables.publish
          ? "Captains are now being ranked and pinged in real time."
          : "You can come back and finish this later.",
      });
      navigate(`/tasks/${payload.task.id}`, { replace: true });
    },
    onError: (error) => {
      toast({
        title: "Could not save task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!navigator.geolocation || (isEditing && hasHydratedEditRef.current)) {
      if (!navigator.geolocation) {
        setLocationStatus("Location permission is unavailable in this browser.");
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          latitude: current.latitude ?? Number(position.coords.latitude.toFixed(6)),
          longitude: current.longitude ?? Number(position.coords.longitude.toFixed(6)),
          locationLabel:
            usingDeviceLocation || isCurrentDeviceLocationLabel(current.locationLabel)
              ? "Live pin"
              : current.locationLabel,
        }));
        setLocationStatus("Live pin ready. Matching will use your latest coordinates.");
      },
      () => {
        setLocationStatus("We could not read your live pin yet. You can still enter a meeting point manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [isEditing, usingDeviceLocation]);

  function clearVoiceTimer() {
    if (voiceTimeoutRef.current) {
      window.clearTimeout(voiceTimeoutRef.current);
      voiceTimeoutRef.current = null;
    }
  }

  function clearSilenceStopTimer() {
    if (silenceStopTimeoutRef.current) {
      window.clearTimeout(silenceStopTimeoutRef.current);
      silenceStopTimeoutRef.current = null;
    }
  }

  function teardownVoiceMonitor() {
    if (voiceMonitorFrameRef.current) {
      window.cancelAnimationFrame(voiceMonitorFrameRef.current);
      voiceMonitorFrameRef.current = null;
    }

    clearSilenceStopTimer();

    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect?.();
      analyserRef.current = null;
    }

    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
    }
  }

  function stopActiveStream() {
    if (!mediaStreamRef.current) {
      return;
    }

    for (const track of mediaStreamRef.current.getTracks()) {
      track.stop();
    }

    mediaStreamRef.current = null;
  }

  function stopRecorderSmoothly(statusMessage = "Finishing your note...") {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      return;
    }

    setVoiceStatus(statusMessage);
    clearSilenceStopTimer();
    mediaRecorderRef.current.stop();
  }

  function beginSilenceAwareMonitoring(stream) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const audioContext = new AudioContextClass();
    const sourceNode = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    const sampleData = new Uint8Array(analyser.fftSize);

    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.88;
    sourceNode.connect(analyser);

    audioContextRef.current = audioContext;
    sourceNodeRef.current = sourceNode;
    analyserRef.current = analyser;

    const monitor = () => {
      if (!analyserRef.current || !mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") {
        return;
      }

      analyserRef.current.getByteTimeDomainData(sampleData);
      let total = 0;

      for (const sample of sampleData) {
        const normalized = (sample - 128) / 128;
        total += normalized * normalized;
      }

      const rms = Math.sqrt(total / sampleData.length);
      const elapsedMs = Date.now() - recordingStartedAtRef.current;

      if (rms >= VOICE_ACTIVITY_THRESHOLD) {
        speechDetectedRef.current = true;
        clearSilenceStopTimer();

        if (elapsedMs > 450) {
          setVoiceStatus("Listening... pause naturally and Tyme will finish the note for you.");
        }
      } else if (!silenceStopTimeoutRef.current) {
        const shouldStopForSilence =
          (speechDetectedRef.current && elapsedMs >= MIN_SPEECH_CAPTURE_MS) ||
          (!speechDetectedRef.current && elapsedMs >= EMPTY_SPEECH_STOP_DELAY_MS);

        if (shouldStopForSilence) {
          setVoiceStatus(
            speechDetectedRef.current
              ? "We heard a natural pause. Finishing your note..."
              : "We did not catch much speech. Finishing this note...",
          );
          silenceStopTimeoutRef.current = window.setTimeout(() => {
            stopRecorderSmoothly("Finishing your note...");
          }, SILENCE_STOP_DELAY_MS);
        }
      }

      voiceMonitorFrameRef.current = window.requestAnimationFrame(monitor);
    };

    voiceMonitorFrameRef.current = window.requestAnimationFrame(monitor);
  }

  async function beginVoiceCapture() {
    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof window.MediaRecorder === "undefined"
    ) {
      setVoiceStatus("Voice capture needs microphone recording support in this browser.");
      toast({
        title: "Voice is not supported here",
        description: "This browser cannot record audio for ElevenLabs transcription.",
        variant: "destructive",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMimeType = getSupportedVoiceMimeType();
      const recorder = preferredMimeType ? new MediaRecorder(stream, { mimeType: preferredMimeType }) : new MediaRecorder(stream);

      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data?.size) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstart = () => {
        setIsRecording(true);
        recordingStartedAtRef.current = Date.now();
        speechDetectedRef.current = false;
        setVoiceStatus("Listening... pause naturally and Tyme will finish the note for you.");
        clearVoiceTimer();
        clearSilenceStopTimer();
        voiceTimeoutRef.current = window.setTimeout(() => {
          if (recorder.state !== "inactive") {
            stopRecorderSmoothly("Wrapping up your note...");
          }
        }, MAX_VOICE_RECORDING_MS);
      };

      recorder.onerror = () => {
        setIsRecording(false);
        clearVoiceTimer();
        teardownVoiceMonitor();
        stopActiveStream();
        mediaRecorderRef.current = null;
        toast({
          title: "Voice capture stopped",
          description: "Try again or continue with the manual form.",
          variant: "destructive",
        });
      };

      recorder.onstop = () => {
        const recordedChunks = audioChunksRef.current.slice();
        const mimeType = recorder.mimeType || preferredMimeType || "audio/webm";

        audioChunksRef.current = [];
        setIsRecording(false);
        clearVoiceTimer();
        teardownVoiceMonitor();
        stopActiveStream();
        mediaRecorderRef.current = null;

        if (!recordedChunks.length) {
          setVoiceStatus("Voice note was empty. Try a short sentence or two.");
          return;
        }

        const audioBlob = new Blob(recordedChunks, { type: mimeType });
        const audioFile = new File([audioBlob], `tyme-voice-note.${getVoiceFileExtension(mimeType)}`, {
          type: mimeType,
        });

        setVoiceStatus("Sending your audio to ElevenLabs, then asking Gemini to draft the task.");
        voiceAssistMutation.mutate({
          file: audioFile,
          payload: createAssistPayload(latestFormRef.current),
        });
      };

      beginSilenceAwareMonitoring(stream);
      recorder.start();
    } catch (error) {
      setIsRecording(false);
      clearVoiceTimer();
      teardownVoiceMonitor();
      stopActiveStream();
      mediaRecorderRef.current = null;
      setVoiceStatus("Microphone permission is required for ElevenLabs voice assist.");
      toast({
        title: "Microphone unavailable",
        description: error.message || "Allow microphone access and try again.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    if (!shouldStartVoice || autoStartedVoiceRef.current || isRecording || voiceAssistMutation.isPending) {
      return;
    }

    autoStartedVoiceRef.current = true;
    void beginVoiceCapture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, shouldStartVoice, voiceAssistMutation.isPending]);

  useEffect(() => {
    return () => {
      clearVoiceTimer();
      teardownVoiceMonitor();

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.ondataavailable = null;
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.onerror = null;
        mediaRecorderRef.current.stop();
      }

      stopActiveStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const signature = createAssistSignature(form);

    if ((form.title + form.description + form.voiceTranscript).trim().length < 16) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (assistSignatureRef.current === signature || assistMutation.isPending) {
        return;
      }

      assistSignatureRef.current = signature;
      void assistMutation.mutateAsync(createAssistPayload(form));
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [
    assistMutation,
    form.category,
    form.description,
    form.locationLabel,
    form.longitude,
    form.notes,
    form.radiusKm,
    form.taskType,
    form.title,
    form.tokenBudget,
    form.latitude,
    form.urgency,
    form.voiceTranscript,
  ]);

  const suggestedSkills = useMemo(
    () =>
      Array.from(
        new Set([
          ...(assistMutation.data?.suggestedSkills ?? []),
          ...(voiceAssistMutation.data?.suggestedSkills ?? []),
          ...form.requiredSkills,
        ]),
      ).slice(0, 6),
    [assistMutation.data?.suggestedSkills, form.requiredSkills, voiceAssistMutation.data?.suggestedSkills],
  );
  const selectedCategory = CATEGORY_OPTIONS.find((category) => category.value === form.category)?.label ?? "";

  const addManualSkill = () => {
    const slug = manualSkill.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!slug) {
      return;
    }

    setSkillsTouched(true);
    setForm((current) => ({
      ...current,
      requiredSkills: Array.from(new Set([...current.requiredSkills, slug])).slice(0, 6),
    }));
    setManualSkill("");
  };

  const toggleSkill = (skill) => {
    setSkillsTouched(true);
    setForm((current) => ({
      ...current,
      requiredSkills: current.requiredSkills.includes(skill)
        ? current.requiredSkills.filter((entry) => entry !== skill)
        : [...current.requiredSkills, skill].slice(0, 6),
    }));
  };

  const handleVoiceCapture = () => {
    if (voiceAssistMutation.isPending) {
      toast({
        title: "Voice assist is syncing",
        description: "Wait for the current ElevenLabs transcript to finish syncing first.",
      });
      return;
    }

    if (isRecording) {
      stopRecorderSmoothly("Finishing your note...");
      return;
    }

    void beginVoiceCapture();
  };

  const refreshLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    setLocationStatus("Refreshing your live pin...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
          locationLabel:
            usingDeviceLocation || isCurrentDeviceLocationLabel(current.locationLabel)
              ? "Live pin"
              : current.locationLabel,
        }));
        setLocationStatus("Live pin refreshed. Matching will use the latest coordinates.");
      },
      () => setLocationStatus("We could not refresh your live pin."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleLocationModeChange = (nextMode) => {
    setLocationMode(nextMode);
    setForm((current) => {
      if (nextMode === "device") {
        return {
          ...current,
          locationLabel: "Live pin",
        };
      }

      return {
        ...current,
        locationLabel: isCurrentDeviceLocationLabel(current.locationLabel) ? "" : current.locationLabel,
      };
    });
    setLocationStatus(
      nextMode === "device"
        ? hasDeviceLocation
          ? "Live pin ready. Matching will use your latest coordinates."
          : "We are checking your live pin now."
        : "Add the clearest address or meeting point so captains know exactly where to head.",
    );
  };

  const submitTask = (publish) => {
    if (!form.title.trim() || !form.description.trim()) {
      toast({
        title: "A little more detail helps",
        description: "Add a title and a short description before saving.",
        variant: "destructive",
      });
      return;
    }

    if (!form.locationLabel.trim()) {
      toast({
        title: "Location is missing",
        description: "Type a location or allow the browser to fetch it first.",
        variant: "destructive",
      });
      return;
    }

    saveTaskMutation.mutate({ publish });
  };

  return (
    <AppShell role="user">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/my-tasks" className="p-1.5 rounded-lg hover:bg-secondary text-ink-tertiary transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-ink text-lg">{isEditing ? "Edit Task" : "Create Task"}</h1>
            <p className="text-xs text-ink-tertiary">
              Keep it simple. Tyme will auto-suggest skills, ranking, and captain matching once you publish.
            </p>
          </div>
          {(assistMutation.isPending || voiceAssistMutation.isPending || taskQuery.isLoading) && (
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-ink-tertiary">
              <LoaderCircle size={12} className="animate-spin" />
              Syncing
            </div>
          )}
        </div>

        <div className="space-y-5">
          <section className="bg-white border border-border rounded-3xl p-5 md:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-ink">Two ways to create the task</div>
                <p className="text-xs text-ink-tertiary mt-1">
                  Type it out yourself or record a quick note. ElevenLabs handles the transcript and Gemini shapes the task draft.
                </p>
              </div>
              <button
                type="button"
                onClick={handleVoiceCapture}
                disabled={voiceAssistMutation.isPending}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all ${
                  isRecording
                    ? "bg-coral text-white shadow-premium-md"
                    : "bg-teal-light text-teal hover:bg-teal-mid"
                } ${voiceAssistMutation.isPending ? "opacity-70" : ""}`}
              >
                <Mic size={15} />
                {isRecording ? "Listening..." : voiceAssistMutation.isPending ? "Transcribing..." : "Use voice"}
              </button>
            </div>

            <div className="rounded-2xl border border-border bg-canvas px-4 py-3">
              <p className="text-sm text-ink-secondary">{voiceStatus}</p>
              <p className="text-xs text-ink-tertiary mt-2">
                Keep the clip under 45 seconds for the fastest Vercel upload and response cycle.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-ink-secondary">
                  {providerSummary.transcription === "elevenlabs"
                    ? `ElevenLabs ${providerSummary.transcriptionModel || "speech-to-text"}`
                    : "ElevenLabs speech-to-text ready"}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-ink-secondary">
                  {providerSummary.drafting === "gemini"
                    ? `Gemini ${providerSummary.draftingModel || "task assist"}`
                    : providerSummary.drafting === "heuristic"
                      ? "Local draft fallback active"
                      : "Gemini task assist ready"}
                </span>
              </div>
            </div>

            {form.voiceTranscript && (
              <div className="rounded-2xl border border-teal/20 bg-teal-light px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal mb-2">
                  <Sparkles size={12} />
                  Voice transcript
                </div>
                <p className="text-sm text-ink-secondary leading-relaxed">{form.voiceTranscript}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Short title</label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Pick up medicine before 6 PM"
                className="input-premium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Describe what needs to happen</label>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Tell captains what to do, any deadlines, and anything sensitive they should know."
                className="input-premium min-h-[140px] resize-none"
              />
              <p className="mt-2 text-xs text-ink-tertiary">
                Tyme Assist reads this first, then auto-picks the category, urgency, and skill tags for you.
              </p>
            </div>

            <button
              type="button"
              onClick={() => assistMutation.mutate(createAssistPayload(form))}
              disabled={assistMutation.isPending || voiceAssistMutation.isPending}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-canvas px-4 py-2 text-sm font-medium text-ink hover:border-teal/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <WandSparkles size={15} className="text-teal" />
              Re-run Tyme Assist
            </button>
          </section>

          <section className="grid gap-5 md:grid-cols-[1.25fr_0.75fr]">
            <div className="bg-white border border-border rounded-3xl p-5 md:p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-ink mb-3">Category</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {CATEGORY_OPTIONS.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, category: category.value }))}
                      className={`rounded-2xl border px-3 py-3 text-sm font-medium transition-all ${
                        form.category === category.value
                          ? "border-teal bg-teal-light text-teal"
                          : "border-border bg-white text-ink-secondary hover:border-teal/30"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-ink-tertiary">
                  {selectedCategory
                    ? `Tyme Assist currently reads this as ${selectedCategory}. You can still override it.`
                    : "Leave this alone if you want Tyme Assist to choose the best fit from the request details."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-3">Urgency</label>
                <div className="grid grid-cols-3 gap-2">
                  {URGENCY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, urgency: option.value }))}
                      className={`rounded-2xl border px-3 py-3 text-sm font-medium transition-all ${
                        form.urgency === option.value
                          ? "border-ink bg-ink text-white"
                          : "border-border bg-white text-ink-secondary hover:border-teal/30"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-3">How should captains respond?</label>
                <div className="grid gap-2">
                  {TASK_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          taskType: option.value,
                          tokenBudget: option.value === "TOKEN_FUNDED" ? current.tokenBudget || 20 : 0,
                        }))
                      }
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        form.taskType === option.value
                          ? "border-teal bg-teal-light"
                          : "border-border bg-white hover:border-teal/30"
                      }`}
                    >
                      <div className="text-sm font-semibold text-ink">{option.label}</div>
                      <p className="text-xs text-ink-tertiary mt-1">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {form.taskType === "TOKEN_FUNDED" && (
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Token budget</label>
                  <div className="relative">
                    <Coins size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber" />
                    <input
                      type="number"
                      value={form.tokenBudget}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, tokenBudget: Number(event.target.value) || 0 }))
                      }
                      className="input-premium pl-10"
                      min={0}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[10, 20, 35, 50].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, tokenBudget: amount }))}
                        className="rounded-full bg-amber-light px-3 py-1 text-xs font-medium text-amber"
                      >
                        {amount} Wild Cash
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-border rounded-3xl p-5 md:p-6 space-y-5">
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <label className="text-sm font-medium text-ink">Location</label>
                  <button
                    type="button"
                    onClick={refreshLocation}
                    className="inline-flex items-center gap-1 text-xs font-medium text-teal"
                  >
                    <RefreshCw size={12} />
                    Refresh
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleLocationModeChange("device")}
                    className={`rounded-2xl border px-3 py-3 text-sm font-medium transition-all ${
                      usingDeviceLocation
                        ? "border-teal bg-teal-light text-teal"
                        : "border-border bg-white text-ink-secondary hover:border-teal/30"
                    }`}
                  >
                    Use live pin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLocationModeChange("address")}
                    className={`rounded-2xl border px-3 py-3 text-sm font-medium transition-all ${
                      !usingDeviceLocation
                        ? "border-teal bg-teal-light text-teal"
                        : "border-border bg-white text-ink-secondary hover:border-teal/30"
                    }`}
                  >
                    Enter address
                  </button>
                </div>

                {usingDeviceLocation ? (
                  <div className="mt-3 rounded-2xl border border-border bg-canvas px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-teal shadow-premium">
                        <MapPin size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-ink">
                          {hasDeviceLocation ? "Live pin ready" : "Finding your live pin"}
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{locationStatus}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <div className="rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-ink">
                            {hasDeviceLocation ? "Nearby matching enabled" : "Waiting for signal"}
                          </div>
                          <div className="rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-ink">
                            {hasDeviceLocation
                              ? `${form.latitude?.toFixed(4)}, ${form.longitude?.toFixed(4)}`
                              : "Updating coordinates..."}
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-ink-tertiary">
                          Need a different meetup point? Switch to Enter address.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    <div className="relative">
                      <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                      <input
                        type="text"
                        value={form.locationLabel}
                        onChange={(event) => setForm((current) => ({ ...current, locationLabel: event.target.value }))}
                        className="input-premium pl-10"
                        placeholder="Street address, lobby, gate, or another meeting point"
                      />
                    </div>
                    <div className="rounded-2xl border border-border bg-canvas px-4 py-3 text-xs leading-relaxed text-ink-tertiary">
                      Add the clearest pickup or meeting point you can so captains know exactly where to head.
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Captain search radius <span className="text-teal">{form.radiusKm} km</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={form.radiusKm}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, radiusKm: Number(event.target.value) }))
                  }
                  className="w-full accent-teal"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-ink">Suggested skills</label>
                  {assistMutation.isPending && <LoaderCircle size={12} className="animate-spin text-teal" />}
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        form.requiredSkills.includes(skill)
                          ? "bg-ink text-white"
                          : "bg-secondary text-ink-secondary hover:bg-teal-light hover:text-teal"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={manualSkill}
                    onChange={(event) => setManualSkill(event.target.value)}
                    placeholder="Add a custom skill"
                    className="input-premium"
                  />
                  <button
                    type="button"
                    onClick={addManualSkill}
                    className="rounded-2xl bg-secondary px-4 text-sm font-medium text-ink"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">Optional notes</label>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  className="input-premium min-h-[110px] resize-none"
                  placeholder="Door code, contact preferences, or any extra context."
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-teal/20 bg-teal-light px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-2xl bg-white p-2 text-teal shadow-premium">
                <Zap size={16} />
              </div>
              <div>
                <div className="text-sm font-semibold text-ink">What happens after you publish</div>
                <p className="text-sm text-ink-secondary mt-1 leading-relaxed">
                  Tyme immediately ranks nearby captains, pings their live feed, and updates your task
                  screen as soon as one accepts. You will see the waiting state, assignment, progress,
                  and feedback loop in the same task window.
                </p>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => submitTask(false)}
              disabled={saveTaskMutation.isPending}
              className="rounded-2xl border border-border px-5 py-3 text-sm font-medium text-ink-secondary hover:bg-secondary disabled:opacity-50"
            >
              Save draft
            </button>
            <button
              type="button"
              onClick={() => submitTask(true)}
              disabled={saveTaskMutation.isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-ink/90 disabled:opacity-50"
            >
              {saveTaskMutation.isPending ? (
                <>
                  <LoaderCircle size={15} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Zap size={15} />
                  {isEditing ? "Update and dispatch" : "Publish and dispatch"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
