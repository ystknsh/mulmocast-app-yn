<template>
  <Card class="p-4">
    <h4 class="mb-3 font-medium">Speech Parameters</h4>
    <div v-if="speechParams" class="space-y-4">
      <div>
        <Label>Provider</Label>
        <Select :model-value="speechParams.provider || 'openai'" @update:model-value="handleProviderChange">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="nijivoice">Nijivoice</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div
        v-if="speechParams.speakers"
        v-for="(speaker, name) in speechParams.speakers"
        :key="name"
        class="rounded border p-3"
      >
        <div class="mb-2 flex items-center justify-between">
          <div>
            <div class="template-dropdown-container flex items-center gap-4" v-if="isUpdate && updateKey === name">
              <Input v-model="updateSpeakerId" /><Button @click="handleUpdateSpeakerId" :disabled="!validUpdateKey">{{
                t("update")
              }}</Button>
            </div>
            <h5 class="text-sm font-medium" @click="changeKey(name)" v-else>{{ name }}</h5>
          </div>
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
            <Label class="text-xs">Voice ID</Label>
            <Select
              :model-value="speaker.voiceId"
              @update:model-value="(value) => handleSpeakerVoiceChange(name, String(value))"
            >
              <SelectTrigger class="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="voice in getVoiceList(speechParams.provider || 'openai')"
                  :key="voice.id"
                  :value="voice.id"
                >
                  {{ voice.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div v-if="speechParams.provider === 'nijivoice'">
            <Label class="text-xs">Speed</Label>
            <Input
              :model-value="speaker.speed || ''"
              @update:model-value="(value) => handleSpeechOptionsChange(name, 'speed', value)"
              class="h-8"
              type="number"
            />
          </div>
          <div v-if="speechParams.provider === 'openai'">
            <Label class="text-xs">instruction</Label>
            <Input
              :model-value="speaker.instruction || ''"
              @update:model-value="(value) => handleSpeechOptionsChange(name, 'instruction', value)"
              class="h-8"
            />
          </div>
          <div v-if="speaker.displayName">
            <div class="mb-2">
              <Label class="text-xs">Language</Label>
              <Select
                :model-value="selectedLanguages[name] || DEFAULT_LANGUAGE"
                @update:model-value="(value) => handleLanguageChange(name, String(value))"
              >
                <SelectTrigger class="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="lang in LANGUAGES" :key="lang.code" :value="lang.code">
                    {{ lang.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label class="text-xs"> Display Name ({{ selectedLanguages[name] || DEFAULT_LANGUAGE }}) </Label>
              <Input
                :model-value="speaker.displayName[selectedLanguages[name] || DEFAULT_LANGUAGE] || ''"
                @update:model-value="
                  (value) => handleDisplayNameChange(name, selectedLanguages[name] || DEFAULT_LANGUAGE, String(value))
                "
                class="h-8"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="template-dropdown-container flex items-center gap-4">
        <Input v-model="speechKey" :invalid="!validateKey" class="w-64" />

        <Button variant="outline" size="sm" @click="handleAddSpeaker">Add Speaker</Button>
      </div>
      <div></div>
      <MulmoError :mulmoError="mulmoError" />
    </div>
    <div v-else>
      <p class="mb-2 text-sm text-gray-500">No speakers defined</p>
      <Button variant="outline" size="sm" @click="initializeSpeechParams">Initialize Speech Parameters</Button>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MulmoError from "./mulmo_error.vue";
import { VOICE_LISTS } from "@/../shared/constants";
import type { MulmoPresentationStyle } from "mulmocast/browser";
import { useI18n } from "vue-i18n";

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

const { t } = useI18n();

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

const handleProviderChange = (value: string) => {
  const newProvider = value as Provider;
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

const handleSpeechOptionsChange = (name: string, key: string, value: string) => {
  updateSpeaker(name, { speechOptions: { [key]: key === "speed" ? Number(value) : value } });
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

// add or update key
const validateKeyFunc = (key: string) => {
  return key !== "" && /^[a-zA-Z0-9]+$/.test(key) && !Object.keys(speakers.value).includes(key);
};

const isUpdate = ref(false);
const updateSpeakerId = ref("");
const validUpdateKey = computed(() => {
  return validateKeyFunc(updateSpeakerId.value);
});

const updateKey = ref("");
const changeKey = (key: string) => {
  if (isUpdate.value) {
    return;
  }
  isUpdate.value = true;
  updateSpeakerId.value = key;
  updateKey.value = key;
};
const handleUpdateSpeakerId = () => {
  if (!isUpdate.value || !validUpdateKey.value) {
    return;
  }
  const { [updateKey.value]: __, ...newSpeakers } = speakers.value;
  newSpeakers[updateSpeakerId.value] = speakers.value[updateKey.value];
  updateSpeakers({
    ...newSpeakers,
    [updateSpeakerId.value]: speakers.value[updateKey.value],
  });

  isUpdate.value = false;
  updateSpeakerId.value = "";
  updateKey.value = "";
};

const speechKey = ref("");

const validateKey = computed(() => {
  return validateKeyFunc(speechKey.value);
});
const handleAddSpeaker = () => {
  if (!validateKey.value) {
    return;
  }
  const voiceId = getDefaultVoiceId(currentProvider.value);
  updateSpeakers({
    ...speakers.value,
    [speechKey.value]: createSpeaker(speechKey.value, voiceId),
  });
  speechKey.value = "";
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
