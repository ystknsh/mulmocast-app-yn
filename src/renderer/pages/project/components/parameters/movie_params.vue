<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Movie Parameters</h4>
    <div class="space-y-3">
      <div>
        <Label>Provider</Label>
        <Select
          :model-value="movieParams?.provider || DEFAULT_VALUES.provider"
          @update:model-value="handleProviderChange"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="replicate">Replicate</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Model</Label>
        <Input
          :model-value="movieParams?.model || DEFAULT_VALUES.model"
          @update:model-value="handleModelChange"
          placeholder="Provider specific model (optional)"
        />
      </div>
      <div>
        <Label>Transition Type</Label>
        <Select
          :model-value="movieParams?.transition?.type || DEFAULT_VALUES.transition.type"
          @update:model-value="handleTransitionTypeChange"
        >
          <SelectTrigger>
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="undefined">None</SelectItem>
            <SelectItem value="fade">Fade</SelectItem>
            <SelectItem value="slideout_left">Slide Out Left</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Transition Duration (seconds)</Label>
        <Input
          :model-value="movieParams?.transition?.duration ?? DEFAULT_VALUES.transition.duration"
          @update:model-value="handleTransitionDurationChange"
          type="number"
          min="0"
          max="2"
          step="0.1"
          :disabled="!movieParams?.transition?.type"
        />
      </div>
      <MulmoError :mulmoError="mulmoError" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MulmoError from "./mulmo_error.vue";
import type { MulmoPresentationStyle } from "mulmocast";

type MovieParams = MulmoPresentationStyle["movieParams"];

const props = defineProps<{
  movieParams?: MovieParams;
  mulmoError: string[];
}>();

const emit = defineEmits<{
  update: [movieParams: MovieParams];
}>();

const DEFAULT_VALUES: MovieParams = {
  provider: "google",
  model: "",
  transition: {
    type: undefined,
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
  const params = {
    ...currentParams.value,
    ...partial,
    transition: partial.transition
      ? {
          ...currentParams.value.transition,
          ...partial.transition,
        }
      : currentParams.value.transition,
  };
  if (params.transition.type === undefined) {
    delete params.transition;
  }
  emit("update", params);
};

const handleProviderChange = (value: string) => {
  updateParams({ provider: value as "google" | "openai" });
};

const handleModelChange = (value: string | number) => {
  updateParams({ model: String(value) });
};

const handleTransitionTypeChange = (value: string) => {
  updateParams({
    transition: { type: value as "fade" | "slideout_left", duration: currentParams.value.transition.duration },
  });
};

const handleTransitionDurationChange = (value: string | number) => {
  updateParams({ transition: { type: currentParams.value.transition.type, duration: Number(value) } });
};
</script>
