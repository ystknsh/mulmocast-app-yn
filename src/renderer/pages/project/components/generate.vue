<template>
  <div class="space-y-6">
    <!-- Output Buttons -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="flex flex-col space-y-2 pl-2">
        <label v-for="option in checkboxOptions" :key="option.key" class="flex items-center space-x-2">
          <Checkbox v-model="options[option.key]" :disabled="option.key === 'audio' && options.movie" />
          <span>{{ t("project.generate." + option.key) }}</span>
        </label>
      </div>
      <Button
        @click="generateContents"
        class="flex flex-col items-center space-y-2 h-auto py-4 whitespace-normal"
        :disabled="mulmoEventStore.isArtifactGenerating[projectId]"
      >
        <div class="flex">
          <Monitor :size="24" v-if="options.movie" />
          <Globe :size="24" v-if="options.audio" />
          <FileText :size="24" v-if="options.pdfSlide || options.pdfHandout" />
        </div>
        <span>{{ t("project.generate.generateContents") }}</span>
      </Button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { useMulmoEventStore } from "../../../store";
import { notifyProgress } from "@/lib/notification";
import { FileText, Monitor, Globe } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { getConcurrentTaskStatusMessageComponent } from "./concurrent_task_status_message";
import { Checkbox } from "@/components/ui/checkbox";

import { useI18n } from "vue-i18n";

interface Props {
  projectId: string;
}
const props = defineProps<Props>();

const { t } = useI18n();

type OptionKey = "movie" | "audio" | "pdfSlide" | "pdfHandout";

const checkboxOptions: { key: OptionKey }[] = [
  { key: "movie" },
  { key: "audio" },
  { key: "pdfSlide" },
  { key: "pdfHandout" },
];

const options = ref<Record<OptionKey, boolean>>({
  movie: true,
  audio: true,
  pdfSlide: false,
  pdfHandout: false,
});

watch(
  () => options.value.movie,
  (movie) => {
    if (movie) {
      options.value.audio = true;
    }
  },
);

const generateContents = () => {
  const keys = Object.keys(options.value).filter((key) => options.value[key]);
  console.log(keys);
  notifyProgress(window.electronAPI.mulmoHandler("mulmoActionRunner", props.projectId, keys), {
    loadingMessage: ConcurrentTaskStatusMessageComponent,
    successMessage: t('project.generateStatus.success'),
    errorMessage: t('project.generateStatus.error'),
  });
};
const mulmoEventStore = useMulmoEventStore();

const ConcurrentTaskStatusMessageComponent = getConcurrentTaskStatusMessageComponent(props.projectId);
</script>
