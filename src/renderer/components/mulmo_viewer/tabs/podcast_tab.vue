<template>
  <TabsContent value="podcast" class="mt-4 max-h-[calc(90vh-7rem)] overflow-y-auto">
    <div class="rounded-lg border border-border bg-muted/50 p-8 text-center">
      <template v-if="!audioUrl">
        <Volume2 :size="64" class="mx-auto mb-4 text-muted-foreground" />
        <p class="mb-2 text-lg font-medium">{{ t("project.productTabs.podcast.title") }}</p>
        <p class="mb-4 text-sm text-muted-foreground">{{ t("project.productTabs.podcast.description") }}</p>
      </template>
      <div class="flex flex-col items-center justify-center gap-4">
        <audio :src="audioUrl" v-if="!!audioUrl" controls ref="audioRef" @loadedmetadata="updateAudioMetadata" />
        <Button variant="outline" @click="downloadMp3" :disabled="!audioUrl">
          <Volume2 :size="16" class="mr-2" />
          {{ t("project.productTabs.podcast.download") }}
        </Button>
      </div>
      <div class="mt-2 text-xs text-muted-foreground" v-if="audioUrl">
        {{
          t("project.productTabs.podcast.details", {
            duration: audioMetadata.duration || "-",
            size: audioMetadata.fileSize || "-",
          })
        }}
      </div>
    </div>
  </TabsContent>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { Volume2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { bufferToUrl } from "@/lib/utils";
import { formatFileSize, formatDuration } from "@/lib/format";

import { downloadFile } from "./utils";

const { t } = useI18n();

interface Props {
  projectId: string;
}

const props = defineProps<Props>();
const audioUrl = ref("");
const audioMetadata = ref({
  duration: "",
  fileSize: "",
});

const audioRef = ref<HTMLAudioElement | null>(null);

const downloadMp3 = async () => {
  downloadFile(props.projectId, "audio", "audio/mp3", "audio.mp3");
};

const updateAudioMetadata = () => {
  if (!audioRef.value) return;

  const audio = audioRef.value;

  if (!isNaN(audio.duration)) {
    audioMetadata.value.duration = formatDuration(audio.duration);
  }
};

const updateResources = async () => {
  const bufferAudio = (await window.electronAPI.mulmoHandler("downloadFile", props.projectId, "audio")) as Buffer;
  if (bufferAudio && bufferAudio.byteLength > 0) {
    audioUrl.value = bufferToUrl(new Uint8Array(bufferAudio), "audio/mp3");
    audioMetadata.value.fileSize = formatFileSize(bufferAudio.byteLength);

    await nextTick();
    updateAudioMetadata();
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
</script>
