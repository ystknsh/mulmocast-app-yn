<template>
  <div>
    <!-- Image section -->
    <div class="mb-4">
      <!-- Image preview -->
      <div
        class="relative rounded-lg border-2 border-dashed border-gray-300 p-4 text-center"
        :key="`beat_editor_${beat.id ?? index}`"
      >
        <!-- Generate image button -->
        <template v-if="shouldShowGenerateButton">
          <Button
            variant="ghost"
            size="icon"
            class="absolute -top-3 -left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white shadow transition-colors hover:bg-gray-100"
            @click="generateImage"
            :disabled="isImageGenerating || isHtmlGenerating || props.toggleTypeMode || disabled"
            :title="t('ui.actions.' + imageGenerateButtonTitle)"
          >
            <Loader2 v-if="isImageGenerating || isHtmlGenerating" class="h-4 w-4 animate-spin" />
            <Sparkles v-else class="h-4 w-4" />
          </Button>
        </template>
        <template v-if="beat?.image?.type === 'beat'"> Reference<!-- Todo --> </template>
        <template v-if="isImageGenerating || isHtmlGenerating">
          <!-- TODO update design -->
          {{ t("ui.status.generating") }}
        </template>
        <!-- image pewview -->
        <template v-else-if="imageFile">
          <template v-if="beat?.image?.type === 'movie'">
            <video
              :size="64"
              class="mx-auto mb-4 cursor-pointer text-gray-400 transition-opacity hover:opacity-80"
              controls
              :src="mediaUri(imageFile)"
              @click="openModal('video', imageFile)"
            />
          </template>
          <template v-else>
            <img
              :src="mediaUri(imageFile)"
              class="cursor-pointer transition-opacity hover:opacity-80"
              @click="openModal('image', imageFile)"
            />
          </template>
        </template>
        <template v-else>
          <Video v-if="beat?.image?.type === 'movie'" :size="32" class="mx-auto mb-2 text-gray-400" />
          <FileImage v-else :size="32" class="mx-auto mb-2 text-gray-400" />
          <p class="text-sm text-gray-500">
            {{ t("beat." + (beat?.image?.type === "movie" ? "videoPreview" : "imagePreview")) }}
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileImage, Video, Loader2, Sparkles } from "lucide-vue-next";
import { computed } from "vue";
import type { MulmoBeat } from "mulmocast/browser";
import { useI18n } from "vue-i18n";

import { Button } from "@/components/ui/button";
import { mediaUri } from "@/lib/utils";
import { isLocalSourceMediaBeat } from "@/lib/beat_util";

interface Props {
  beat: MulmoBeat;
  index: number;
  imageFile: ArrayBuffer | string | null;
  isImageGenerating: boolean;
  isHtmlGenerating: boolean;
  toggleTypeMode?: boolean;
  disabled?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(["openModal", "generateImage"]);

const { t } = useI18n();

// Computed properties for button visibility
const shouldShowGenerateButton = computed(() => {
  return (
    props.beat?.image?.type !== "beat" &&
    !(
      ["image", "movie"].includes(props.beat?.image?.type || "") &&
      props.beat?.image &&
      isLocalSourceMediaBeat(props.beat)
    )
  );
});

const openModal = (type: "image" | "video" | "audio" | "other", src: ArrayBuffer | string | null) => {
  emit("openModal", type, src);
};

const generateImage = () => {
  emit("generateImage");
};

const imageGenerateButtonTitle = computed(() => {
  return props.toggleTypeMode
    ? "changeBeatTypeFirst"
    : props.isImageGenerating || props.isHtmlGenerating
      ? "generating"
      : "generateImage";
});
</script>
