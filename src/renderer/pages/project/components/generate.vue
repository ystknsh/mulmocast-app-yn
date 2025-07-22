<template>
  <div class="space-y-6">
    <!-- Output Buttons -->
    <div class="space-y-4">
      <div>
        <Button @click="generateContents" class="w-full">Generate</Button>
        <div class="flex flex-col space-y-2 pl-2">
          <label v-for="option in checkboxOptions" :key="option.key" class="flex items-center space-x-2">
            <Checkbox v-model="options[option.key]" :disabled="option.key === 'audio' && options.movie" />
            <span>{{ option.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Button
        class="flex flex-col items-center space-y-2 h-auto py-4 whitespace-normal"
        @click="generateMovie"
        :disabled="mulmoEventStore.isArtifactGenerating[projectId]"
      >
        <Monitor :size="24" />
        <span>Generate Movie</span>
      </Button>
      <Button
        class="flex flex-col items-center space-y-2 h-auto py-4 whitespace-normal"
        :disabled="mulmoEventStore.isArtifactGenerating[projectId]"
        @click="generatePdf"
      >
        <FileText :size="24" />
        <span>Generate PDF</span>
      </Button>
      <Button
        class="flex flex-col items-center space-y-2 h-auto py-4 whitespace-normal"
        @click="generatePodcast"
        :disabled="mulmoEventStore.isArtifactGenerating[projectId]"
      >
        <Globe :size="24" />
        <span>Generate Podcast</span>
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

interface Props {
  projectId: string;
}
const props = defineProps<Props>();

type OptionKey = "movie" | "audio" | "pdfSlide" | "pdfHandout";

const checkboxOptions: { key: OptionKey; label: string }[] = [
  { key: "movie", label: "Movie" },
  { key: "audio", label: "Podcast" },
  { key: "pdfSlide", label: "PDF (Presenter)" },
  { key: "pdfHandout", label: "PDF (Handout)" },
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
    successMessage: "Movie generated successfully",
    errorMessage: "Failed to generate movie",
  });
};
const mulmoEventStore = useMulmoEventStore();

const ConcurrentTaskStatusMessageComponent = getConcurrentTaskStatusMessageComponent(props.projectId);

const generateMovie = async () => {
  notifyProgress(window.electronAPI.mulmoHandler("mulmoActionRunner", props.projectId, "movie"), {
    loadingMessage: ConcurrentTaskStatusMessageComponent,
    successMessage: "Movie generated successfully",
    errorMessage: "Failed to generate movie",
  });
};

const generatePodcast = async () => {
  notifyProgress(window.electronAPI.mulmoHandler("mulmoActionRunner", props.projectId, "audio"), {
    loadingMessage: ConcurrentTaskStatusMessageComponent,
    successMessage: "Podcast generated successfully",
    errorMessage: "Failed to generate podcast",
  });
};

const generatePdf = async () => {
  notifyProgress(window.electronAPI.mulmoHandler("mulmoActionRunner", props.projectId, "pdf"), {
    loadingMessage: ConcurrentTaskStatusMessageComponent,
    successMessage: "Pdf generated successfully",
    errorMessage: "Failed to generate pdf",
  });
};
</script>
