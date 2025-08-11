<template>
  <Tabs default-value="movie" class="max-h-[90vh] w-full">
    <TabsList class="grid w-full grid-cols-4">
      <TabsTrigger value="movie">{{ t("project.productTabs.tabs.movie") }}</TabsTrigger>
      <TabsTrigger value="pdf">{{ t("project.productTabs.tabs.pdf") }}</TabsTrigger>
      <TabsTrigger value="podcast">{{ t("project.productTabs.tabs.podcast") }}</TabsTrigger>
      <TabsTrigger value="slide">{{ t("project.productTabs.tabs.slide") }}</TabsTrigger>
    </TabsList>

    <TabsContent value="movie" class="mt-4 max-h-[calc(90vh-7rem)] overflow-y-auto">
      <div class="rounded-lg border bg-gray-50 p-8 text-center">
        <div>
          <video
            v-if="videoUrl"
            :size="64"
            class="mx-auto mb-4 max-h-[90vh] text-gray-400"
            controls
            :src="videoUrl"
            ref="videoRef"
            @loadedmetadata="updateVideoMetadata"
          />

          <template v-else>
            <Video :size="64" class="mx-auto mb-4 text-gray-400" />
            <p class="mb-2 text-lg font-medium">{{ t("project.productTabs.movie.title") }}</p>
            <p class="mb-4 text-sm text-gray-600">{{ t("project.productTabs.movie.description") }}</p>
          </template>
          <div class="flex flex-wrap items-center justify-center gap-2">
            <Button @click="playVideo" :disabled="!videoUrl">
              <Pause v-if="isPlaying" :size="16" />
              <Play v-else :size="16" />
              {{ isPlaying ? t("project.productTabs.movie.pause") : t("project.productTabs.movie.play") }}
            </Button>
            <Button variant="outline" @click="downloadMp4" :disabled="!videoUrl">
              <Video :size="16" class="mr-2" />
              {{ t("project.productTabs.movie.download") }}
            </Button>
          </div>
          <div class="mt-2 text-xs text-gray-500" v-if="videoUrl">
            {{
              t("project.productTabs.movie.details", {
                duration: videoMetadata.duration || "-",
                resolution: videoMetadata.resolution || "-",
                size: videoMetadata.fileSize || "-",
              })
            }}
          </div>
        </div>
      </div>
    </TabsContent>

    <TabsContent value="pdf" class="mt-4 max-h-[calc(90vh-7rem)] overflow-y-auto">
      <div class="rounded-lg border bg-gray-50 p-8 text-center">
        <div class="mx-auto" v-if="pdfData">
          <VuePDF :pdf="pdfData.value" :page="pdfCurrentPage" :scale="0.8" :fit-parent="true" />
        </div>
        <template v-else>
          <FileText :size="64" class="mx-auto mb-4 text-gray-400" />
          <p class="mb-2 text-lg font-medium">{{ t("project.productTabs.pdf.title") }}</p>
          <p class="mb-4 text-sm text-gray-600">{{ t("project.productTabs.pdf.description") }}</p>
        </template>
        <div v-if="pages === 0">{{ t("project.productTabs.pdf.empty") }}</div>
        <div v-if="pages > 0" class="flex flex-col items-center justify-center gap-2">
          <div class="flex items-center justify-center gap-4">
            <div>
              <Button :disabled="pdfCurrentPage < 2" @click="pdfCurrentPage = pdfCurrentPage - 1">< </Button>
              {{ pdfCurrentPage }}/{{ pages }}
              <Button @click="pdfCurrentPage = pdfCurrentPage + 1" :disabled="pdfCurrentPage >= pages">></Button>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" @click="downloadPdf">
                <FileText :size="16" class="mr-2" />
                {{ t("project.productTabs.pdf.download") }}
              </Button>
            </div>
          </div>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          {{
            t("project.productTabs.pdf.details", {
              pages: pages || "-",
              size: pdfMetadata.fileSize || "-",
            })
          }}
        </div>
      </div>
    </TabsContent>

    <TabsContent value="podcast" class="mt-4 max-h-[calc(90vh-7rem)] overflow-y-auto">
      <div class="rounded-lg border bg-gray-50 p-8 text-center">
        <template v-if="!audioUrl">
          <Volume2 :size="64" class="mx-auto mb-4 text-gray-400" />
          <p class="mb-2 text-lg font-medium">{{ t("project.productTabs.podcast.title") }}</p>
          <p class="mb-4 text-sm text-gray-600">{{ t("project.productTabs.podcast.description") }}</p>
        </template>
        <div class="flex flex-col items-center justify-center gap-4">
          <audio :src="audioUrl" v-if="!!audioUrl" controls ref="audioRef" @loadedmetadata="updateAudioMetadata" />
          <Button variant="outline" @click="downloadMp3">
            <Volume2 :size="16" class="mr-2" />
            {{ t("project.productTabs.podcast.download") }}
          </Button>
        </div>
        <div class="mt-2 text-xs text-gray-500" v-if="audioUrl">
          {{
            t("project.productTabs.podcast.details", {
              duration: audioMetadata.duration || "-",
              size: audioMetadata.fileSize || "-",
            })
          }}
        </div>
      </div>
    </TabsContent>

    <TabsContent value="slide" class="mt-4 max-h-[calc(90vh-7rem)] overflow-y-auto">
      <div class="rounded-lg border bg-gray-50 p-8 text-center">
        <FileImage :size="64" class="mx-auto mb-4 text-gray-400" />
        <p class="mb-2 text-lg font-medium">{{ t("project.productTabs.slide.title") }}</p>
        <p class="mb-4 text-sm text-gray-600">{{ t("project.productTabs.slide.description") }}</p>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <Button>
            <Play :size="16" class="mr-2" />
            {{ t("project.productTabs.slide.start") }}
          </Button>
          <Button variant="outline">
            <FileImage :size="16" class="mr-2" />
            {{ t("project.productTabs.slide.export") }}
          </Button>
        </div>
        <div class="mt-4 text-sm text-gray-500">{{ t("project.productTabs.slide.details") }}</div>
      </div>
    </TabsContent>
  </Tabs>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Video, FileText, Volume2, FileImage, Play, Pause } from "lucide-vue-next";
import { VuePDF, usePDF } from "@tato30/vue-pdf";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { Project } from "@/lib/project_api";
import { bufferToUrl } from "@/lib/utils";

import { useMulmoEventStore } from "@/store";

const { t } = useI18n();

interface Props {
  project: Project;
}

const props = defineProps<Props>();
const projectId = computed(() => props.project?.metadata?.id || "");
const videoUrl = ref("");
const audioUrl = ref("");
const videoMetadata = ref({
  duration: "",
  resolution: "",
  fileSize: "",
});
const audioMetadata = ref({
  duration: "",
  fileSize: "",
});

const pdfData = ref();
const pdfCurrentPage = ref(1);
const pdfMetadata = ref({
  pageSize: "", // TODO: add page size.
  fileSize: "",
});

const downloadMp4 = async () => {
  return downloadFile("movie", "video/mp4", projectId.value + "_video.mp4");
};
const downloadMp3 = async () => {
  return downloadFile("audio", "audio/mp3", projectId.value + "_audio.mp3");
};
const downloadPdf = async () => {
  return downloadFile("pdf", "application/pdf", projectId.value + "_slide.pdf");
};

const videoRef = ref<HTMLVideoElement | null>(null);
const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const playVideo = () => {
  if (videoRef.value?.paused) {
    videoRef.value?.play();
    isPlaying.value = true;
  } else {
    videoRef.value?.pause();
    isPlaying.value = false;
  }
};

const downloadFile = async (fileType: string, mimeType: string, fileName: string) => {
  const buffer = (await window.electronAPI.mulmoHandler("downloadFile", projectId.value, fileType)) as ArrayBuffer;
  const blob = new Blob([buffer], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
};

const pdfBuffer = ref();
const { pdf, pages } = usePDF(pdfBuffer);
pdfData.value = pdf;

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
};

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const updateVideoMetadata = () => {
  if (!videoRef.value) return;

  const video = videoRef.value;

  if (!isNaN(video.duration)) {
    videoMetadata.value.duration = formatDuration(video.duration);
  }

  if (video.videoWidth && video.videoHeight) {
    videoMetadata.value.resolution = `${video.videoWidth}×${video.videoHeight}`;
  }
};

const updateAudioMetadata = () => {
  if (!audioRef.value) return;

  const audio = audioRef.value;

  if (!isNaN(audio.duration)) {
    audioMetadata.value.duration = formatDuration(audio.duration);
  }
};

const updateResources = async () => {
  const bufferMovie = (await window.electronAPI.mulmoHandler("downloadFile", projectId.value, "movie")) as Buffer;
  if (bufferMovie && bufferMovie.byteLength > 0) {
    videoUrl.value = bufferToUrl(new Uint8Array(bufferMovie), "video/mp4");
    videoMetadata.value.fileSize = formatFileSize(bufferMovie.byteLength);

    // Wait for video to load metadata
    await nextTick();
    updateVideoMetadata();
  }
  const bufferAudio = (await window.electronAPI.mulmoHandler("downloadFile", projectId.value, "audio")) as Buffer;
  if (bufferAudio && bufferAudio.byteLength > 0) {
    audioUrl.value = bufferToUrl(new Uint8Array(bufferAudio), "audio/mp3");
    audioMetadata.value.fileSize = formatFileSize(bufferAudio.byteLength);

    // Wait for audio to load metadata
    await nextTick();
    updateAudioMetadata();
  }
  const bufferPdf = (await window.electronAPI.mulmoHandler("downloadFile", projectId.value, "pdf")) as Buffer;
  if (bufferPdf && bufferPdf.byteLength > 0) {
    pdfBuffer.value = new Uint8Array(bufferPdf);
    pdfMetadata.value.fileSize = formatFileSize(bufferPdf.byteLength);
  }
};

watch(
  () => props.project,
  async (newProject, oldProject) => {
    if (newProject && newProject.metadata?.id && newProject.metadata.id !== oldProject?.metadata?.id) {
      await updateResources();
    }
  },
  { immediate: true },
);

const mulmoEventStore = useMulmoEventStore();
watch(
  () => mulmoEventStore.mulmoEvent[projectId.value],
  async (mulmoEvent) => {
    if (mulmoEvent && mulmoEvent.kind === "session" && mulmoEvent.sessionType === "video" && !mulmoEvent.inSession) {
      await updateResources();
    }
  },
);
</script>
