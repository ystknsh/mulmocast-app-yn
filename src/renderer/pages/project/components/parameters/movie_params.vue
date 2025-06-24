<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Movie Parameters</h4>
    <div class="space-y-3">
      <div>
        <label class="block text-sm text-gray-600 mb-1">Provider</label>
        <select
          :value="movieParams?.provider || 'google'"
          @change="$emit('update', ($event.target as HTMLSelectElement).value, 'provider')"
          class="w-full p-2 border rounded text-sm"
        >
          <option value="openai">OpenAI</option>
          <option value="google">Google</option>
          <option value="replicate">Replicate</option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Model</label>
        <input
          :value="movieParams?.model || ''"
          @input="$emit('update', ($event.target as HTMLInputElement).value, 'model')"
          placeholder="Provider specific model (optional)"
          class="w-full p-2 border rounded text-sm"
        />
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Transition Type</label>
        <select
          :value="movieParams?.transition?.type || 'fade'"
          @change="$emit('updateTransition', ($event.target as HTMLSelectElement).value, 'type')"
          class="w-full p-2 border rounded text-sm"
        >
          <option value="fade">Fade</option>
          <option value="slideout_left">Slide Out Left</option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Transition Duration (seconds)</label>
        <input
          :value="movieParams?.transition?.duration ?? 0.3"
          @input="$emit('updateTransition', Number(($event.target as HTMLInputElement).value), 'duration')"
          type="number"
          min="0"
          max="2"
          step="0.1"
          class="w-full p-2 border rounded text-sm"
        />
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Fill Option</label>
        <select
          :value="movieParams?.fillOption?.style || 'aspectFit'"
          @change="$emit('updateFillOption', ($event.target as HTMLSelectElement).value)"
          class="w-full p-2 border rounded text-sm"
        >
          <option value="aspectFit">Aspect Fit</option>
          <option value="aspectFill">Aspect Fill</option>
        </select>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Card } from "@/components/ui/card";

type Provider = "openai" | "google" | "replicate";
type TransitionType = "fade" | "slideout_left";
type FillStyle = "aspectFit" | "aspectFill";

interface Transition {
  type: TransitionType;
  duration: number;
}

interface FillOption {
  style: FillStyle;
}

interface MovieParams {
  provider?: Provider;
  model?: string;
  transition?: Transition;
  fillOption?: FillOption;
}

defineProps<{
  movieParams?: MovieParams;
}>();

defineEmits<{
  update: [value: string, field: "provider" | "model"];
  updateTransition: [value: string | number, field: "type" | "duration"];
  updateFillOption: [value: string];
}>();
</script>
