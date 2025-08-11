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
          />
          <Video v-else :size="64" class="mx-auto mb-4 text-gray-400" />

          <p class="mb-2 text-lg font-medium">{{ t("project.productTabs.movie.title") }}</p>
          <p class="mb-4 text-sm text-gray-600">{{ t("project.productTabs.movie.description") }}</p>
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
          <div class="mt-4 text-sm text-gray-500" v-if="videoUrl">
            {{ t("project.productTabs.movie.details") }}
          </div>
        </div>
      </div>
    </TabsContent>

    <TabsContent value="pdf" class="mt-4 max-h-[calc(90vh-7rem)] overflow-y-auto">
      <div class="rounded-lg border bg-gray-50 p-8 text-center">
        <FileText :size="64" class="mx-auto mb-4 text-gray-400" />
        <p class="mb-2 text-lg font-medium">{{ t("project.productTabs.pdf.title") }}</p>
        <p class="mb-4 text-sm text-gray-600">{{ t("project.productTabs.pdf.description") }}</p>
        <div v-if="pages === 0">{{ t("project.productTabs.pdf.empty") }}</div>
        <div v-if="pages > 0">
          <div class="flex flex-wrap items-center justify-center gap-2">
            <Button variant="outline" @click="downloadPdf">
              <FileText :size="16" class="mr-2" />
              {{ t("project.productTabs.pdf.download") }}
            </Button>
          </div>
          <div class="mt-4 text-sm text-gray-500">{{ t("project.productTabs.pdf.details") }}</div>

          <div>
            <Button :disabled="pdfCurrentPage < 2" @click="pdfCurrentPage = pdfCurrentPage - 1">< </Button>
            {{ pdfCurrentPage }}/{{ pages }}
            <Button @click="pdfCurrentPage = pdfCurrentPage + 1" :disabled="pdfCurrentPage >= pages">></Button>
            <VuePDF
              :pdf="pdfData.value"
              :page="pdfCurrentPage"
              v-if="pdfData"
              :scale="0.8"
              :fit-parent="true"
              class="mx-auto"
              style="max-width: 100% !important; width: auto !important"
            />
          </div>
        </div>
      </div>
    </TabsContent>

    <TabsContent value="podcast" class="mt-4 max-h-[calc(90vh-7rem)] overflow-y-auto">
      <div class="rounded-lg border bg-gray-50 p-8 text-center">
        <Volume2 :size="64" class="mx-auto mb-4 text-gray-400" />
        <p class="mb-2 text-lg font-medium">{{ t("project.productTabs.podcast.title") }}</p>
        <p class="mb-4 text-sm text-gray-600">{{ t("project.productTabs.podcast.description") }}</p>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <div>
            <audio :src="audioUrl" v-if="!!audioUrl" controls />
          </div>
          <Button variant="outline" @click="downloadMp3">
            <Volume2 :size="16" class="mr-2" />
            {{ t("project.productTabs.podcast.download") }}
          </Button>
        </div>
        <div class="mt-4 text-sm text-gray-500">{{ t("project.productTabs.podcast.details") }}</div>
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
import { computed, ref, watch } from "vue";
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

const pdfData = ref();
const pdfCurrentPage = ref(1);

const downloadMp4 = async () => {
  return downloadFile("movie", "video/mp4", projectId.value + "_video.mp4");
};
const downloadMp3 = async () => {
  return downloadFile("audio", "audio/mp3", projectId.value + "_audio.mp3");
};
const downloadPdf = async () => {
  return downloadFile("pdf", "application/pdf", projectId.value + "_slide.pdf");
};

const videoRef = ref(null);
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

const updateResources = async () => {
  try {
    const bufferMovie = (await window.electronAPI.mulmoHandler(
      "downloadFile",
      projectId.value,
      "movie",
    )) as ArrayBuffer;
    if (bufferMovie && bufferMovie.byteLength > 0) {
      videoUrl.value = bufferToUrl(new Uint8Array(bufferMovie), "video/mp4");
    } else {
      videoUrl.value = "";
    }
  } catch (error) {
    // 動画ファイルが存在しない場合
    videoUrl.value = "";
  }

  try {
    const bufferAudio = (await window.electronAPI.mulmoHandler("downloadFile", projectId.value, "audio")) as Buffer;
    if (bufferAudio && bufferAudio.length > 0) {
      audioUrl.value = bufferToUrl(bufferAudio, "video/mp4");
    } else {
      audioUrl.value = "";
    }
  } catch (error) {
    // 音声ファイルが存在しない場合
    audioUrl.value = "";
  }

  try {
    const bufferPdf = (await window.electronAPI.mulmoHandler("downloadFile", projectId.value, "pdf")) as Buffer;
    if (bufferPdf && bufferPdf.length > 0) {
      pdfBuffer.value = new Uint8Array(bufferPdf);
    } else {
      pdfBuffer.value = undefined;
    }
  } catch (error) {
    // PDFファイルが存在しない場合
    pdfBuffer.value = undefined;
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
