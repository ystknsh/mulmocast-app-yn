<template>
  <div class="space-y-6">
    <CanvasSizeParams
      :canvas-size="presentationStyle?.canvasSize"
      @update="(value) => updateParam(`canvasSize`, value)"
    />
    <SpeechParams
      :speech-params="presentationStyle?.speechParams"
      @update="(value) => updateParam('speechParams', value)"
    />
    <ImageParams
      :image-params="presentationStyle?.imageParams"
      @update="(value) => updateParam('imageParams', value)"
    />
    <MovieParams
      :movie-params="presentationStyle?.movieParams"
      @update="(value) => updateParam('movieParams', value)"
    />
    <TextSlideParams
      :text-slide-params="presentationStyle?.textSlideParams"
      @update="(value) => updateParam('textSlideParams.cssStyles', value)"
    />
    <AudioParams
      :audio-params="presentationStyle?.audioParams"
      @update="(value) => updateParam('audioParams', value)"
    />
  </div>
</template>

<script setup lang="ts">
import type { MulmoPresentationStyle } from "mulmocast";
import CanvasSizeParams from "./parameters/canvas_size_params.vue";
import ImageParams from "./parameters/image_params.vue";
import SpeechParams from "./parameters/speech_params.vue";
import AudioParams from "./parameters/audio_params.vue";
import MovieParams from "./parameters/movie_params.vue";
import TextSlideParams from "./parameters/text_slide_params.vue";

interface Props {
  presentationStyle?: Partial<MulmoPresentationStyle>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:presentationStyle": [style: Partial<MulmoPresentationStyle>];
}>();

const updateParam = (path: string, value: unknown) => {
  const keys = path.split(".");
  const set = (obj: Record<string, unknown>, keyPath: string[], val: unknown): Record<string, unknown> => {
    if (keyPath.length === 1) {
      return { ...obj, [keyPath[0]]: val };
    }
    const [head, ...tail] = keyPath;
    const currentValue = obj?.[head];
    const nextValue =
      currentValue !== null && typeof currentValue === "object" ? { ...(currentValue as Record<string, unknown>) } : {};

    return {
      ...obj,
      [head]: set(nextValue, tail, val),
    };
  };

  const updatedValue = set({ ...(props.presentationStyle || {}) } as Record<string, unknown>, keys, value);
  console.log(`Updating parameter: ${path} =`, value);
  emit("update:presentationStyle", updatedValue);
};

</script>
