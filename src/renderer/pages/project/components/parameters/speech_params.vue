<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Speech Parameters</h4>
    <div v-if="speechParams" class="space-y-4">
      <div>
        <label class="block text-sm text-gray-600 mb-1">Provider</label>
        <select
          :value="speechParams.provider || 'openai'"
          @change="handleProviderChange"
          class="w-full p-2 border rounded text-sm"
        >
          <option value="openai">OpenAI</option>
          <option value="nijivoice">Nijivoice</option>
          <option value="google">Google</option>
          <option value="elevenlabs">ElevenLabs</option>
        </select>
      </div>
      <div
        v-if="speechParams.speakers"
        v-for="(speaker, name) in speechParams.speakers"
        :key="name"
        class="border p-3 rounded"
      >
        <div class="flex items-center justify-between mb-2">
          <h5 class="font-medium text-sm">{{ name }}</h5>
          <Button
            v-if="Object.keys(speechParams.speakers).length > 1"
            variant="ghost"
            size="sm"
            @click="handleDeleteSpeaker(name)"
            class="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
        <div class="space-y-2">
          <div>
            <label class="block text-xs text-gray-600 mb-1">Voice ID</label>
            <select
              :value="speaker.voiceId"
              @change="handleSpeakerVoiceChange(name, ($event.target as HTMLSelectElement).value)"
              class="w-full p-1 border rounded text-sm"
            >
              <option
                v-for="voice in getVoiceList(speechParams.provider || 'openai')"
                :key="voice.id"
                :value="voice.id"
              >
                {{ voice.name }}
              </option>
            </select>
          </div>
          <div v-if="speaker.displayName">
            <div class="mb-2">
              <label class="block text-xs text-gray-600 mb-1">Language</label>
              <select
                :value="selectedLanguages[name] || DEFAULT_LANGUAGE"
                @change="handleLanguageChange(name, ($event.target as HTMLSelectElement).value)"
                class="w-full p-1 border rounded text-sm"
              >
                <option v-for="lang in LANGUAGES" :key="lang.code" :value="lang.code">
                  {{ lang.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">
                Display Name ({{ selectedLanguages[name] || DEFAULT_LANGUAGE }})
              </label>
              <input
                :value="speaker.displayName[selectedLanguages[name] || DEFAULT_LANGUAGE] || ''"
                @input="
                  handleDisplayNameChange(
                    name,
                    selectedLanguages[name] || DEFAULT_LANGUAGE,
                    ($event.target as HTMLInputElement).value,
                  )
                "
                class="w-full p-1 border rounded text-sm"
              />
            </div>
          </div>
        </div>
      </div>
      <Button variant="outline" size="sm" @click="handleAddSpeaker">Add Speaker</Button>
      <div></div>
      <MulmoError :mulmoError="mulmoError" />
    </div>
    <div v-else>
      <p class="text-sm text-gray-500 mb-2">No speakers defined</p>
      <Button variant="outline" size="sm" @click="initializeSpeechParams">Initialize Speech Parameters</Button>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MulmoError from "./mulmo_error.vue";
import { VOICE_LISTS } from "@/../shared/constants";
import type { MulmoPresentationStyle } from "mulmocast";

type SpeechParams = MulmoPresentationStyle["speechParams"];
type Provider = keyof typeof VOICE_LISTS;
type Speaker = NonNullable<SpeechParams>["speakers"][string];

const DEFAULT_VOICE_IDS: Record<string, string> = {
  openai: VOICE_LISTS.openai[0].id,
  google: VOICE_LISTS.google[0].id,
  nijivoice: VOICE_LISTS.nijivoice[0].id,
  elevenlabs: VOICE_LISTS.elevenlabs[0].id,
} as const;

const props = defineProps<{
  speechParams?: SpeechParams;
  mulmoError: string[];
}>();

const emit = defineEmits<{
  update: [speechParams: SpeechParams];
}>();

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ja", name: "日本語" },
] as const;

const DEFAULT_LANGUAGE = "en";

const selectedLanguages = ref<Record<string, string>>({});

const currentProvider = computed(() => props.speechParams?.provider || "openai");
const speakers = computed(() => props.speechParams?.speakers || {});
const speakerCount = computed(() => Object.keys(speakers.value).length);
const canDeleteSpeaker = computed(() => speakerCount.value > 1);

const getVoiceList = (provider: string) => {
  return VOICE_LISTS[provider as Provider] || VOICE_LISTS.openai;
};

const getDefaultVoiceId = (provider: string): string => {
  return DEFAULT_VOICE_IDS[provider as keyof typeof DEFAULT_VOICE_IDS] || DEFAULT_VOICE_IDS.openai;
};

const createSpeaker = (name: string, voiceId: string): Speaker => ({
  voiceId,
  displayName: {
    [DEFAULT_LANGUAGE]: name,
  },
});

const updateSpeechParams = (updates: Partial<NonNullable<SpeechParams>>): void => {
  const baseParams = props.speechParams || {
    provider: "openai" as Provider,
    speakers: {},
  };

  emit("update", {
    ...baseParams,
    ...updates,
  });
};

const updateSpeakers = (speakerUpdates: NonNullable<SpeechParams>["speakers"]): void => {
  updateSpeechParams({ speakers: speakerUpdates });
};

const updateSpeaker = (name: string, updates: Partial<Speaker>): void => {
  const updatedSpeakers = { ...speakers.value };
  updatedSpeakers[name] = {
    ...updatedSpeakers[name],
    ...updates,
  };
  updateSpeakers(updatedSpeakers);
};

const handleProviderChange = (event: Event) => {
  const newProvider = (event.target as HTMLSelectElement).value as Provider;
  const defaultVoiceId = getDefaultVoiceId(newProvider);

  const updatedSpeakers = Object.entries(speakers.value).reduce(
    (acc, [name, speaker]) => ({
      ...acc,
      [name]: { ...speaker, voiceId: defaultVoiceId },
    }),
    {},
  );

  updateSpeechParams({
    provider: newProvider,
    speakers: updatedSpeakers,
  });
};

const handleLanguageChange = (name: string, language: string) => {
  selectedLanguages.value[name] = language;
};

const handleSpeakerVoiceChange = (name: string, voiceId: string) => {
  updateSpeaker(name, { voiceId });
};

const handleDisplayNameChange = (name: string, language: string, value: string) => {
  const speaker = speakers.value[name];
  if (!speaker) return;

  updateSpeaker(name, {
    displayName: {
      ...speaker.displayName,
      [language]: value,
    },
  });
};

const handleDeleteSpeaker = (name: string) => {
  if (!canDeleteSpeaker.value) return;

  const { [name]: __, ...remainingSpeakers } = speakers.value;
  updateSpeakers(remainingSpeakers);
};

const handleAddSpeaker = () => {
  // Generate a unique speaker name
  const existingSpeakers = speakers.value;
  let speakerNumber = Object.keys(existingSpeakers).length + 1;
  let newSpeakerName = `Speaker${speakerNumber}`;
  while (existingSpeakers[newSpeakerName]) {
    speakerNumber++;
    newSpeakerName = `Speaker${speakerNumber}`;
  }

  const voiceId = getDefaultVoiceId(currentProvider.value);

  updateSpeakers({
    ...existingSpeakers,
    [newSpeakerName]: createSpeaker(newSpeakerName, voiceId),
  });
};

const initializeSpeechParams = () => {
  updateSpeechParams({
    provider: "openai",
    speakers: {
      Presenter: {
        voiceId: DEFAULT_VOICE_IDS.openai,
        displayName: {
          en: "Presenter",
        },
      },
    },
  });
};
</script>
