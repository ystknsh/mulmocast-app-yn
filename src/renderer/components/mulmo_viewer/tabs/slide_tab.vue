<template>
  <div class="border-border text-center">
    <div v-if="beats.length === 0">
      <FileImage :size="64" class="text-muted-foreground mx-auto mb-4" />
      <p class="mb-2 text-lg font-medium">{{ t("project.productTabs.slide.title") }}</p>
      <p class="text-muted-foreground mb-4 text-sm">{{ t("project.productTabs.slide.description") }}</p>
    </div>
    <div v-else>
      <div class="flex w-full items-center justify-between">
        <Button
          @click="decrease"
          variant="ghost"
          :disabled="currentPage === 0"
          :class="{ 'opacity-0!': currentPage === 0 }"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <MediaPlayer
          :videoWithAudioSource="lipSyncFiles?.[currentBeat?.id]"
          :videoSource="movieFiles?.[currentBeat?.id]"
          :imageSource="imageFiles?.[currentBeat?.id]"
          :audioSource="audioFiles[currentLanguage]?.[currentBeat?.id]"
          @play="handlePlay"
          @pause="handlePause"
          @ended="handleAudioEnded"
          ref="mediaPlayer"
        />
        <Button
          @click="increase"
          variant="ghost"
          :disabled="currentPage === beats.length - 1"
          :class="{ 'opacity-0!': currentPage === beats.length - 1 }"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
      <div class="flex w-full items-center justify-between" v-if="false">
        <Button
          @click="decrease"
          variant="ghost"
          :disabled="currentPage === 0"
          :class="{ 'opacity-0!': currentPage === 0 }"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <div class="flex min-w-0 flex-1 flex-col justify-center">
          <video
            v-if="lipSyncFiles?.[currentBeat?.id]"
            :src="lipSyncFiles?.[currentBeat?.id]"
            controls
            class="max-h-64 object-contain"
          />
          <video
            v-else-if="movieFiles?.[currentBeat?.id]"
            :src="movieFiles?.[currentBeat?.id]"
            controls
            class="max-h-64 object-contain"
          />
          <img
            v-else-if="imageFiles?.[currentBeat?.id]"
            :src="imageFiles?.[currentBeat?.id]"
            class="max-h-64 object-contain"
          />
        </div>
        <Button
          @click="increase"
          variant="ghost"
          :disabled="currentPage === beats.length - 1"
          :class="{ 'opacity-0!': currentPage === beats.length - 1 }"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
      <div class="text-muted-foreground mt-1 text-sm">
        {{ t("project.productTabs.slide.details", { pages: beats.length, current: currentPage + 1 }) }}
      </div>
      <div class="bg-foreground/5 mt-2 rounded-lg p-2 text-sm">
        {{
          isScriptLang
            ? currentBeat?.text
            : (mulmoMultiLinguals?.[currentBeatId]?.["multiLingualTexts"]?.[currentLanguage]?.text ??
              t("ui.common.noLang"))
        }}
        <Button
          variant="outline"
          @click="generateLocalize"
          v-if="!isScriptLang && !mulmoMultiLinguals?.[currentBeatId]?.['multiLingualTexts']?.[currentLanguage]?.text"
          >{{ t("ui.actions.translate") }}</Button
        >
      </div>
      <label class="my-2 mr-4 flex items-center justify-end gap-2 text-sm">
        <Checkbox v-model="autoPlay" />
        <span class="text-sm">{{ t("project.productTabs.slide.autoPlay") }}</span>
      </label>
      <div v-if="false">
        <audio
          :src="audioFiles[currentLanguage]?.[currentBeat?.id]"
          v-if="!!audioFiles[currentLanguage]?.[currentBeat?.id]"
          controls
          class="mx-auto mt-2 w-full max-w-full"
          ref="audioRef"
          @play="handlePlay"
          @pause="handlePause"
          @ended="handleAudioEnded"
        />
      </div>
      <div class="mt-2 flex items-center justify-center gap-2">
        <SelectLanguage v-model="currentLanguage" :languages="languages" />
        <Button variant="outline" @click="generateLocalize">{{ t("ui.actions.translate") }}</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { FileImage, ChevronLeft, ChevronRight } from "lucide-vue-next";
import { type MultiLingualTexts, beatId } from "mulmocast/browser";
import { sleep } from "graphai";

import { Button, Checkbox } from "@/components/ui";

import MediaPlayer from "./media_player.vue";

import { useImageFiles, useAudioFiles } from "@/pages/composable";
import { useMulmoEventStore, useMulmoGlobalStore } from "@/store";
import type { Project } from "@/lib/project_api";
import SelectLanguage from "./select_language.vue";

const { t } = useI18n();
const globalStore = useMulmoGlobalStore();
const mulmoEventStore = useMulmoEventStore();

interface Props {
  projectId: string;
  project: Project;
  mulmoMultiLinguals?: MultiLingualTexts;
}
const props = defineProps<Props>();

const emit = defineEmits(["updateMultiLingual"]);
const mediaPlayer = ref();

const currentPage = ref(0);
const audioRef = ref();
const autoPlay = ref(true);

const isPlaying = ref(false);

const handlePlay = () => {
  isPlaying.value = true;
};
const handlePause = () => {
  isPlaying.value = false;
};
const handleEnded = () => {
  isPlaying.value = false;
};

const lang = props.project?.script?.lang ?? "en";
const currentLanguage = ref(globalStore.useLanguages.includes(lang) ? lang : (globalStore.useLanguages[0] ?? "en"));

const languages = computed(() => {
  if (globalStore.useLanguages.includes(lang)) {
    return globalStore.useLanguages;
  }
  return [lang, ...globalStore.useLanguages];
});

const isScriptLang = computed(() => {
  return props.project?.script?.lang === currentLanguage.value;
});

const { imageFiles, movieFiles, lipSyncFiles, downloadImageFiles, downloadImageFile } = useImageFiles();
const { audioFiles, downloadAudioFiles, downloadAudioFile } = useAudioFiles();

const beats = computed(() => {
  return props.project?.script?.beats ?? [];
});
const currentBeat = computed(() => {
  return beats.value[currentPage.value];
});
const currentBeatId = computed(() => {
  return beatId(currentBeat.value?.id, currentPage.value);
});
const increase = () => {
  if (currentPage.value + 1 < beats.value.length) {
    currentPage.value = currentPage.value + 1;
    if (isPlaying.value && autoPlay.value) {
      waitAndPlay();
    }
    return true;
  }
  return false;
};
const decrease = () => {
  if (currentPage.value > 0) {
    currentPage.value = currentPage.value - 1;
    if (isPlaying.value && autoPlay.value) {
      waitAndPlay();
    }
  }
};

const waitAndPlay = async () => {
  await sleep(500);
  if (mediaPlayer.value) {
    mediaPlayer.value.play();
  }
  if (audioRef.value) {
    audioRef.value.play();
  }
};

const handleAudioEnded = async () => {
  handleEnded();
  if (autoPlay.value && increase()) {
    waitAndPlay();
  }
};

const generateLocalize = async () => {
  // translate lang
  await window.electronAPI.mulmoHandler("mulmoTranslate", props.projectId, [currentLanguage.value]);
  // get multiLingual
  emit("updateMultiLingual");
  // generate audio
  await window.electronAPI.mulmoHandler("mulmoActionRunner", props.projectId, ["audio"], currentLanguage.value);
  // get audio
  downloadAudioFiles(props.projectId, currentLanguage.value);
};
watch(currentLanguage, (v) => {
  downloadAudioFiles(props.projectId, v);
});

watch(
  () => props.projectId,
  (newProjectId, oldProjectId) => {
    if (newProjectId && newProjectId !== oldProjectId) {
      downloadImageFiles(newProjectId);
      downloadAudioFiles(newProjectId, currentLanguage.value);
    }
  },
  { immediate: true },
);

watch(
  () => mulmoEventStore.mulmoEvent[props.projectId],
  async (mulmoEvent) => {
    if (mulmoEvent?.inSession) {
      return;
    }
    // generate image
    if (mulmoEvent && mulmoEvent.kind === "session") {
      if (mulmoEvent.sessionType === "image") {
        downloadImageFiles(props.projectId);
      }
      if (mulmoEvent.sessionType === "audio") {
        downloadAudioFiles(props.projectId, currentLanguage.value);
      }
    }

    // beats
    if (mulmoEvent?.kind === "beatGenerate" && ["image"].includes(mulmoEvent.sessionType)) {
      const index = props.project?.script?.beats?.findIndex((beat) => beat.id === mulmoEvent.id);
      if (index === -1 || index === undefined) {
        return;
      }
      downloadImageFile(props.projectId, index, mulmoEvent.id);
    }
    if (mulmoEvent?.kind === "beat") {
      if (mulmoEvent.sessionType === "audio") {
        const index = props.project?.script?.beats?.findIndex((beat) => beat.id === mulmoEvent.id);
        if (index === -1 || index === undefined) {
          return;
        }
        downloadAudioFile(props.projectId, currentLanguage.value, index, mulmoEvent.id);
      }
      if (mulmoEvent.sessionType === "multiLingual") {
        emit("updateMultiLingual");
      }
    }
    console.log(mulmoEvent);
  },
);
</script>
