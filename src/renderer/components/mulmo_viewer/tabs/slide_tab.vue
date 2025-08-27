<template>
  <TabsContent value="slide" class="mt-4 max-h-[calc(90vh-7rem)] overflow-y-auto">
    <div class="border-border bg-muted/50 rounded-lg border p-8 text-center">
      <div class="mb-2 flex items-center justify-center gap-2">
        <SelectLanguage v-model="currentLanguage" />
        <Button variant="outline" @click="generateLocalize">{{ t("ui.actions.generate") }}</Button>
      </div>
      <div v-if="beats.length === 0">
        <FileImage :size="64" class="text-muted-foreground mx-auto mb-4" />
        <p class="mb-2 text-lg font-medium">{{ t("project.productTabs.slide.title") }}</p>
        <p class="text-muted-foreground mb-4 text-sm">{{ t("project.productTabs.slide.description") }}</p>
      </div>
      <div v-else>
        <div class="flex w-full items-center justify-between">
          <Button @click="decrease" variant="outline">{{ t("ui.common.decrease") }}</Button>
          <div class="flex flex-1 flex-col justify-center">
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
            <audio
              :src="audioFiles[currentBeat?.id]"
              v-if="!!audioFiles[currentBeat?.id]"
              controls
              class="mx-auto mt-2"
              @ended="handleAudioEnded"
              ref="audioRef"
            />
          </div>

          <Button @click="increase" variant="outline">{{ t("ui.common.increase") }}</Button>
        </div>
        {{
          mulmoMultiLinguals?.[beatId(currentBeat?.id, currentPage)]?.["multiLingualTexts"]?.[currentLanguage]?.text ||
          currentBeat?.text
        }}
      </div>

      <div class="text-muted-foreground mt-4 text-sm">
        {{ t("project.productTabs.slide.details", { pages: beats.length, current: currentPage + 1 }) }}
      </div>
    </div>
  </TabsContent>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { FileImage } from "lucide-vue-next";
import { sleep } from "graphai";

import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";

import { useImageFiles, useAudioFiles } from "@/pages/composable";
import type { Project } from "@/lib/project_api";
import SelectLanguage from "./select_language.vue";
import { type MultiLingualTexts, beatId } from "mulmocast/browser";

const { t } = useI18n();

interface Props {
  projectId: string;
  project: Project;
  mulmoMultiLinguals?: MultiLingualTexts;
}
const props = defineProps<Props>();

const emit = defineEmits(["updateMultiLingual"]);

const currentPage = ref(0);
const audioRef = ref();

const currentLanguage = ref(props.project?.script?.lang ?? "en");

const { imageFiles, movieFiles, lipSyncFiles, downloadImageFiles } = useImageFiles();
const { audioFiles, downloadAudioFiles } = useAudioFiles();

const beats = computed(() => {
  return props.project?.script?.beats ?? [];
});
const currentBeat = computed(() => {
  return beats.value[currentPage.value];
});
const increase = () => {
  if (currentPage.value + 1 < beats.value.length) {
    currentPage.value = currentPage.value + 1;
    return true;
  }
  return false;
};
const decrease = () => {
  if (currentPage.value > 0) {
    currentPage.value = currentPage.value - 1;
  }
};

const handleAudioEnded = async () => {
  if (increase()) {
    await sleep(500);
    audioRef.value.play();
  }
};
const generateLocalize = async () => {
  await window.electronAPI.mulmoHandler("mulmoTranslate", props.projectId, [currentLanguage.value]);
  emit("updateMultiLingual");
  // translate lang
  // generate audio
  // get multiLingual
  // get audio
};

watch(
  () => props.projectId,
  (newProjectId, oldProjectId) => {
    if (newProjectId && newProjectId !== oldProjectId) {
      downloadImageFiles(newProjectId);
      downloadAudioFiles(newProjectId);
    }
  },
  { immediate: true },
);
</script>
