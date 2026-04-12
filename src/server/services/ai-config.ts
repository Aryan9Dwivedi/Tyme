const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";
const DEFAULT_ELEVENLABS_SPEECH_MODEL = "scribe_v2";

function readOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function getGeminiApiKey() {
  return readOptionalEnv("GEMINI_API_KEY");
}

export function getGeminiModel() {
  return readOptionalEnv("GEMINI_MODEL") ?? DEFAULT_GEMINI_MODEL;
}

export function getElevenLabsApiKey() {
  return readOptionalEnv("ELEVENLABS_API_KEY");
}

export function getElevenLabsSpeechModel() {
  return readOptionalEnv("ELEVENLABS_SPEECH_MODEL") ?? DEFAULT_ELEVENLABS_SPEECH_MODEL;
}
