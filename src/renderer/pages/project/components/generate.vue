<template>
  <div class="space-y-6">
    <!-- Output Buttons -->
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
import { useMulmoEventStore } from "../../../store";
import { notifyProgress } from "@/lib/notification";
import { FileText, Monitor, Globe } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { getConcurrentTaskStatusMessageComponent } from "./concurrent_task_status_message";

interface Props {
  projectId: string;
}
const props = defineProps<Props>();

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
