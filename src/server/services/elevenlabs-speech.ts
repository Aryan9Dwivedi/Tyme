import { getElevenLabsApiKey, getElevenLabsSpeechModel } from "@/server/services/ai-config";

type ElevenLabsSpeechResponse = {
  language_code?: string;
  text?: string;
  detail?: {
    message?: string;
  };
};

export type TaskVoiceTranscriptionResult = {
  transcript: string;
  languageCode: string | null;
  providers: {
    transcription: "elevenlabs";
    transcriptionModel: string;
  };
};

function getErrorMessage(payload: ElevenLabsSpeechResponse | null, fallback: string) {
  return payload?.detail?.message || fallback;
}

export async function transcribeTaskVoice(file: File, languageCode?: string | null): Promise<TaskVoiceTranscriptionResult> {
  const apiKey = getElevenLabsApiKey();

  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured.");
  }

  if (!file.size) {
    throw new Error("Audio upload is empty.");
  }

  const model = getElevenLabsSpeechModel();
  const formData = new FormData();
  formData.set("model_id", model);
  formData.set("file", file, file.name || "voice-note.webm");
  formData.set("diarize", "false");
  formData.set("tag_audio_events", "false");
  formData.set("timestamps_granularity", "none");

  if (model === "scribe_v2") {
    formData.set("no_verbatim", "true");
  }

  if (languageCode?.trim()) {
    formData.set("language_code", languageCode.trim());
  }

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
    },
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as ElevenLabsSpeechResponse | null;

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, "ElevenLabs could not transcribe the audio."));
  }

  const transcript = payload?.text?.trim();

  if (!transcript) {
    throw new Error("ElevenLabs returned an empty transcript.");
  }

  return {
    transcript,
    languageCode: typeof payload?.language_code === "string" ? payload.language_code : null,
    providers: {
      transcription: "elevenlabs",
      transcriptionModel: model,
    },
  };
}
