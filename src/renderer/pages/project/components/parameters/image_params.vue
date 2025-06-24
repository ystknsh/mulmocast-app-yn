<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Image Parameters</h4>
    <div class="space-y-3">
      <div>
        <label class="block text-sm text-gray-600 mb-1">Provider</label>
        <select
          :value="imageParams?.provider || 'openai'"
          @change="$emit('updateProvider', ($event.target as HTMLSelectElement).value)"
          class="w-full p-2 border rounded text-sm"
        >
          <option value="openai">OpenAI</option>
          <option value="google">Google</option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Model</label>
        <input
          :value="imageParams?.model || ''"
          @input="$emit('update', ($event.target as HTMLInputElement).value, 'model')"
          placeholder="e.g. dall-e-3, gpt-image-1"
          class="w-full p-2 border rounded text-sm"
        />
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Style</label>
        <input
          :value="imageParams?.style || ''"
          @input="$emit('update', ($event.target as HTMLInputElement).value, 'style')"
          placeholder="e.g. vivid, natural"
          class="w-full p-2 border rounded text-sm"
        />
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Moderation</label>
        <input
          :value="imageParams?.moderation || ''"
          @input="$emit('update', ($event.target as HTMLInputElement).value, 'moderation')"
          placeholder="e.g. low, auto"
          class="w-full p-2 border rounded text-sm"
        />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Card } from "@/components/ui/card";

type ImageParams = {
  provider?: "openai" | "google";
  model?: string;
  style?: string;
  moderation?: string;
};

defineProps<{
  imageParams?: ImageParams;
}>();

defineEmits<{
  updateProvider: [provider: string];
  update: [value: string, field: "model" | "style" | "moderation"];
}>();
</script>
