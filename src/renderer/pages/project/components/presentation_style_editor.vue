<template>
  <div class="space-y-6">
    <CanvasSizeParams
      :canvas-size="presentationStyle?.canvasSize"
      @update="(value, field) => updateParam(`canvasSize.${field}`, value)"
    />
    <SpeechParams
      :speech-params="presentationStyle?.speechParams"
      @update-speaker="(name, field, value) => updateParam(`speechParams.speakers.${name}.${field}`, value)"
      @update-speaker-display-name="
        (name, language, value) => updateParam(`speechParams.speakers.${name}.displayName.${language}`, value)
      "
      @add-speaker="addSpeaker"
      @delete-speaker="deleteSpeaker"
      @initialize-speech-params="initializeSpeechParams"
    />
    <ImageParams
      :image-params="presentationStyle?.imageParams"
      @update="(value, field) => updateParam(`imageParams.${field}`, value)"
    />
    <MovieParams
      :movie-params="presentationStyle?.movieParams"
      @update="(value, field) => updateParam(`movieParams.${field}`, value)"
      @update-transition="(value, field) => updateParam(`movieParams.transition.${field}`, value)"
      @update-fill-option="(value) => updateParam('movieParams.fillOption.style', value)"
    />
    <TextSlideParams
      :text-slide-params="presentationStyle?.textSlideParams"
      @update="(value) => updateParam('textSlideParams.cssStyles', value)"
    />
    <AudioParams
      :audio-params="presentationStyle?.audioParams"
      @update="(value, field) => updateParam(`audioParams.${field}`, value)"
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

const updateParamImmediate = (path: string, value: unknown) => {
  const keys = path.split(".");
  const set = (obj: Record<string, unknown>, keyPath: string[], val: unknown): Record<string, unknown> => {
    if (keyPath.length === 1) {
      return { ...obj, [keyPath[0]]: val };
    }
    const [head, ...tail] = keyPath;
    const currentValue = obj?.[head];
    const nextValue =
      currentValue !== null && typeof currentValue === "object" ? (currentValue as Record<string, unknown>) : {};

    return {
      ...obj,
      [head]: set(nextValue, tail, val),
    };
  };

  const updatedValue = set((props.presentationStyle || {}) as Record<string, unknown>, keys, value);
  console.log(`Updating parameter: ${path} =`, value);
  emit("update:presentationStyle", updatedValue);
};

const updateParam = updateParamImmediate;

const initializeSpeechParams = () => {
  updateParamImmediate("speechParams", {
    provider: "openai",
    speakers: {
      Presenter: {
        voiceId: "shimmer",
        displayName: {
          en: "Presenter",
        },
      },
    },
  });
};

const addSpeaker = () => {
  const speakers = props.presentationStyle?.speechParams?.speakers || {};
  const speakerCount = Object.keys(speakers).length;
  const newSpeakerName = `Speaker${speakerCount + 1}`;

  updateParamImmediate("speechParams.speakers", {
    ...speakers,
    [newSpeakerName]: {
      voiceId: "shimmer",
      displayName: {
        en: newSpeakerName,
      },
    },
  });
};

const deleteSpeaker = (speakerName: string) => {
  const speakers = props.presentationStyle?.speechParams?.speakers || {};
  const speakerCount = Object.keys(speakers).length;

  if (speakerCount <= 1) {
    return;
  }

  const { [speakerName]: __, ...remainingSpeakers } = speakers;

  updateParamImmediate("speechParams.speakers", remainingSpeakers);
};
</script>
