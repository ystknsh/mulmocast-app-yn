<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Movie Parameters</h4>
    <div class="space-y-3">
      <div>
        <label class="block text-sm text-gray-600 mb-1">Provider</label>
        <select
          :value="movieParams?.provider || DEFAULT_VALUES.provider"
          @change="handleProviderChange($event)"
          class="w-full p-2 border rounded text-sm"
        >
          <option value="google">Google</option>
          <option value="openai">OpenAI</option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Model</label>
        <input
          :value="movieParams?.model || DEFAULT_VALUES.model"
          @input="handleModelChange($event)"
          placeholder="Provider specific model (optional)"
          class="w-full p-2 border rounded text-sm"
        />
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Transition Type</label>
        <select
          :value="movieParams?.transition?.type || DEFAULT_VALUES.transition.type"
          @change="handleTransitionTypeChange($event)"
          class="w-full p-2 border rounded text-sm"
        >
          <option value="fade">Fade</option>
          <option value="slideout_left">Slide Out Left</option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Transition Duration (seconds)</label>
        <input
          :value="movieParams?.transition?.duration ?? DEFAULT_VALUES.transition.duration"
          @input="handleTransitionDurationChange($event)"
          type="number"
          min="0"
          max="2"
          step="0.1"
          class="w-full p-2 border rounded text-sm"
        />
      </div>
      <MulmoError :mulmoError="mulmoError" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Card } from "@/components/ui/card";
import MulmoError from "./mulmo_error.vue";
import type { MulmoPresentationStyle } from "mulmocast";

type MovieParams = MulmoPresentationStyle["movieParams"];

const props = defineProps<{
  movieParams?: MovieParams;
  mulmoError: MulmoError | null;
}>();

const emit = defineEmits<{
  update: [movieParams: MovieParams];
}>();

const DEFAULT_VALUES: MovieParams = {
  provider: "google",
  model: "",
  transition: {
    type: "fade",
    duration: 0.3,
  },
};

const currentParams = computed((): MovieParams => {
  return {
    provider: props.movieParams?.provider || DEFAULT_VALUES.provider,
    model: props.movieParams?.model || DEFAULT_VALUES.model,
    transition: {
      type: props.movieParams?.transition?.type || DEFAULT_VALUES.transition.type,
      duration: props.movieParams?.transition?.duration ?? DEFAULT_VALUES.transition.duration,
    },
  };
});

const updateParams = (partial: Partial<MovieParams>) => {
  emit("update", {
    ...currentParams.value,
    ...partial,
    transition: partial.transition
      ? {
          ...currentParams.value.transition,
          ...partial.transition,
        }
      : currentParams.value.transition,
  });
};

const handleProviderChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value as "google" | "openai";
  updateParams({ provider: value });
};

const handleModelChange = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  updateParams({ model: value });
};

const handleTransitionTypeChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value as "fade" | "slideout_left";
  updateParams({ transition: { type: value, duration: currentParams.value.transition.duration } });
};

const handleTransitionDurationChange = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  updateParams({ transition: { type: currentParams.value.transition.type, duration: value } });
};
</script>
