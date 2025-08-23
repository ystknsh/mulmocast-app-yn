<template>
  <TabsContent value="slide" class="mt-4 max-h-[calc(90vh-7rem)] overflow-y-auto">
    <div class="rounded-lg border bg-gray-50 p-8 text-center">
      <div v-if="beats.length === 0">
        <FileImage :size="64" class="mx-auto mb-4 text-gray-400" />
        <p class="mb-2 text-lg font-medium">{{ t("project.productTabs.slide.title") }}</p>
        <p class="mb-4 text-sm text-gray-600">{{ t("project.productTabs.slide.description") }}</p>
      </div>
      <div v-else>
        <div class="flex w-full items-center justify-between">
          <Button @click="decrease" class="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">{{
            t("ui.common.decrease")
          }}</Button>
          <div class="flex flex-1 justify-center">
            <video
              v-if="lipSyncFiles?.[beats[currentPage]?.id]"
              :src="lipSyncFiles?.[beats[currentPage]?.id]"
              controls
              class="max-h-64 object-contain"
            />
            <video
              v-else-if="movieFiles?.[beats[currentPage]?.id]"
              :src="movieFiles?.[beats[currentPage]?.id]"
              controls
              class="max-h-64 object-contain"
            />
            <img
              v-else-if="imageFiles?.[beats[currentPage]?.id]"
              :src="imageFiles?.[beats[currentPage]?.id]"
              class="max-h-64 object-contain"
            />
          </div>

          <Button @click="increase" class="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">{{
            t("ui.common.increase")
          }}</Button>
        </div>
      </div>

      <div class="mt-4 text-sm text-gray-500">
        {{ t("project.productTabs.slide.details", { pages: beats.length }) }}
      </div>
    </div>
  </TabsContent>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { FileImage } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { useImageFiles } from "../../../pages/composable";
import type { Project } from "@/lib/project_api";

const { t } = useI18n();

interface Props {
  projectId: string;
  project: Project;
}

const props = defineProps<Props>();
const currentPage = ref(0);

const { imageFiles, movieFiles, lipSyncFiles, downloadImageFiles } = useImageFiles();

const beats = computed(() => {
  return props.project?.script?.beats ?? [];
});
const increase = () => {
  if (currentPage.value + 1 < beats.value.length) {
    currentPage.value = currentPage.value + 1;
  }
};
const decrease = () => {
  if (currentPage.value > 0) {
    currentPage.value = currentPage.value - 1;
  }
};

watch(
  () => props.projectId,
  async (newProjectId, oldProjectId) => {
    if (newProjectId && newProjectId !== oldProjectId) {
      await downloadImageFiles(newProjectId);
    }
  },
  { immediate: true },
);
</script>
