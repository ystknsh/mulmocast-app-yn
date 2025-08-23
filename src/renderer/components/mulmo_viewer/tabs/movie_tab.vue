<template>
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
          <Button
            @click="playVideo"
            :disabled="!videoUrl"
            :data-testid="isPlaying ? 'movie-pause-button' : 'movie-play-button'"
          >
            <Pause v-if="isPlaying" :size="16" />
            <Play v-else :size="16" />
            {{ isPlaying ? t("project.productTabs.movie.pause") : t("project.productTabs.movie.play") }}
          </Button>
          <Button variant="outline" @click="downloadMp4" :disabled="!videoUrl" data-testid="movie-download-button">
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
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { Video, Play, Pause } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { bufferToUrl } from "@/lib/utils";
import { formatFileSize, formatDuration } from "@/lib/format";
import { useMulmoEventStore } from "@/store";

const { t } = useI18n();

interface Props {
  projectId: string;
}

const props = defineProps<Props>();
const videoUrl = ref("");
const videoMetadata = ref({
  duration: "",
  resolution: "",
  fileSize: "",
});

const videoRef = ref<HTMLVideoElement | null>(null);
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

const downloadMp4 = async () => {
  downloadFile(props.projectId, "movie", "video/mp4", "video.mp4");
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

const updateResources = async () => {
  const bufferMovie = (await window.electronAPI.mulmoHandler("downloadFile", props.projectId, "movie")) as Buffer;
  if (bufferMovie && bufferMovie.byteLength > 0) {
    videoUrl.value = bufferToUrl(new Uint8Array(bufferMovie), "video/mp4");
    videoMetadata.value.fileSize = formatFileSize(bufferMovie.byteLength);

    await nextTick();
    updateVideoMetadata();
  }
};

watch(
  () => props.projectId,
  async (newProjectId, oldProjectId) => {
    if (newProjectId && newProjectId !== oldProjectId) {
      await updateResources();
    }
  },
  { immediate: true },
);

const mulmoEventStore = useMulmoEventStore();
watch(
  () => mulmoEventStore.mulmoEvent[props.projectId],
  async (mulmoEvent) => {
    if (mulmoEvent && mulmoEvent.kind === "session" && mulmoEvent.sessionType === "video" && !mulmoEvent.inSession) {
      await updateResources();
    }
  },
);
</script>
