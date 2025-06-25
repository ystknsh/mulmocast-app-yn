export const ENV_KEYS = {
  OPENAI_API_KEY: {
    title: "OpenAI API Key",
    description: "Required for using OpenAI services",
    placeholder: "sk-...",
  },
  NIJIVOICE_API_KEY: {
    title: "NijiVoice API Key",
    description: "Required for using NijiVoice TTS services",
    placeholder: "nv_...",
  },
  TAVILY_API_KEY: {
    title: "Tavily API Key",
    description: "Required for using Tavily search services",
    placeholder: "tvly-...",
  },
  ELEVENLABS_API_KEY: {
    title: "ElevenLabs API Key",
    description: "Required for using ElevenLabs voice synthesis",
    placeholder: "el_...",
  },
  GOOGLE_PROJECT_ID: {
    title: "Google Project ID",
    description: "Required for using Google Cloud services",
    placeholder: "your-project-id",
  },
  REPLICATE_API_TOKEN: {
    title: "Replicate API Token",
    description: "Required for using Replicate AI models",
    placeholder: "r8_...",
  },
} as const;

export type EnvKey = keyof typeof ENV_KEYS;
