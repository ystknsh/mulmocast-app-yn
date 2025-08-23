<template>
  <div>
    <!-- Movie section -->
    <div v-if="enableMovieGenerate">
      <!-- Movie preview -->
      <div class="relative rounded-lg border-2 border-dashed border-border p-4 text-center">
        <!-- Generate movie button -->
        <template v-if="shouldShowGenerateButton && shouldBeGeneratedWithPrompt">
          <Button
            variant="ghost"
            size="icon"
            class="absolute -top-3 -left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow transition-colors hover:bg-muted"
            @click="generateMovie"
            :disabled="!enableMovieGenerate || isMovieGenerating || props.toggleTypeMode || disabled"
            :title="t('ui.actions.' + movieGenerateButtonTitle)"
          >
            <Loader2 v-if="isMovieGenerating" class="h-4 w-4 animate-spin" />
            <Sparkles v-else class="h-4 w-4" />
          </Button>
        </template>
        <template v-if="isMovieGenerating">
          <Loader2 class="mr-1 h-4 w-4 animate-spin" />{{ t("ui.status.generating") }}</template
        >
        <div class="relative cursor-pointer transition-opacity hover:opacity-80" v-else-if="movieFile">
          <video
            :size="64"
            class="mx-auto cursor-pointer text-muted-foreground"
            :src="mediaUri(movieFile)"
            @click="openModal('video', movieFile)"
          />
          <Play
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-black/50 p-2 text-white"
            :size="40"
            @click="openModal('video', movieFile)"
          />
        </div>
        <div v-else>
          <Video :size="32" class="mx-auto mb-2 text-muted-foreground" />
          <p class="text-sm text-muted-foreground">{{ t("beat.videoPreview") }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Video, Play, Loader2, Sparkles } from "lucide-vue-next";
import { computed } from "vue";
import type { MulmoBeat } from "mulmocast/browser";
import { useI18n } from "vue-i18n";

import { Button } from "@/components/ui/button";
import { mediaUri } from "@/lib/utils";
import { isLocalSourceMediaBeat } from "@/lib/beat_util";

interface Props {
  beat: MulmoBeat;
  index: number;
  movieFile: ArrayBuffer | string | null;
  isMovieGenerating: boolean;
  enableMovieGenerate: boolean;
  toggleTypeMode?: boolean;
  disabled?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(["openModal", "generateMovie"]);

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

const shouldBeGeneratedWithPrompt = computed(() => {
  return !props.beat.htmlPrompt && !props.beat.image;
});

const openModal = (type: "image" | "video" | "audio" | "other", src: ArrayBuffer | string | null) => {
  emit("openModal", type, src);
};

const generateMovie = () => {
  emit("generateMovie");
};

const movieGenerateButtonTitle = computed(() => {
  return props.toggleTypeMode ? "changeBeatTypeFirst" : props.isMovieGenerating ? "generating" : "generateMovie";
});
</script>
