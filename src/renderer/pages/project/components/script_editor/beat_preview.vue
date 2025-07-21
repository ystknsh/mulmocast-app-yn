<template>
  <div>
    <!-- Image section -->
    <div class="mb-4">
      <!-- Generate image button -->
      <Button variant="outline" size="sm" class="mb-2">Generate image</Button>
      
      <!-- Image preview -->
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center"
        :key="`beat_editor_${beat.id ?? index}`"
      >
    <template v-if="beat?.image?.type === 'beat'"> Reference<!-- Todo --> </template>
    <template v-if="isImageGenerating || isHtmlGenerating">
      <!-- TODO update design -->
      <Loader2 class="w-4 h-4 mr-1 animate-spin" />Generating...
    </template>
    <!-- image pewview -->
    <template v-else-if="imageFile">
      <template v-if="beat?.image?.type === 'movie'">
        <video
          :size="64"
          class="mx-auto text-gray-400 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
          controls
          :src="mediaUri(imageFile)"
          @click="openModal('video', imageFile)"
        />
      </template>
      <template v-else>
        <img
          :src="mediaUri(imageFile)"
          class="cursor-pointer hover:opacity-80 transition-opacity"
          @click="openModal('image', imageFile)"
        />
      </template>
    </template>
    <template v-else>
      <Video v-if="beat?.image?.type === 'movie'" :size="32" class="mx-auto text-gray-400 mb-2" />
      <FileImage v-else :size="32" class="mx-auto text-gray-400 mb-2" />
      <p class="text-sm text-gray-500">{{ beat?.image?.type === "movie" ? "Video" : "Image" }} Preview</p>
    </template>
  </div>
    </div>
    
    <!-- Movie section -->
    <div v-if="enableMovieGenerate">
      <!-- Generate movie button -->
      <Button variant="outline" size="sm" class="mb-2">Generate movie</Button>
      
      <!-- Movie preview -->
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
    <template v-if="isMovieGenerating"> <Loader2 class="w-4 h-4 mr-1 animate-spin" />Generating... </template>
    <div class="relative hover:opacity-80 transition-opacity cursor-pointer" v-else-if="movieFile">
      <video
        :size="64"
        class="mx-auto text-gray-400 cursor-pointer"
        :src="mediaUri(movieFile)"
        @click="openModal('video', movieFile)"
      />
      <Play
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2"
        :size="40"
        @click="openModal('video', movieFile)"
      />
    </div>
    <div v-else>
      <Video :size="32" class="mx-auto text-gray-400 mb-2" />
      <p class="text-sm text-gray-500">Video Preview</p>
    </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileImage, Video, Play, Loader2 } from "lucide-vue-next";
import type { MulmoBeat } from "mulmocast/browser";

import { Button } from "@/components/ui/button";
import { mediaUri } from "@/lib/utils";

interface Props {
  beat: MulmoBeat;
  index: number;
  imageFile: ArrayBuffer | string | null;
  movieFile: ArrayBuffer | string | null;
  isImageGenerating: boolean;
  isHtmlGenerating: boolean;
  isMovieGenerating: boolean;
  enableMovieGenerate: boolean;
}

defineProps<Props>();
const emit = defineEmits(["openModal"]);

const openModal = (type: "image" | "video" | "audio" | "other", src: ArrayBuffer | string | null) => {
  emit("openModal", type, src);
};
</script>
