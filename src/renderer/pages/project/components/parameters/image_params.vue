<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Image Parameters</h4>
    <div class="space-y-3">
      <div>
        <label class="block text-sm text-gray-600 mb-1">Model</label>
        <input
          :value="modelValue?.imageParams?.model || ''"
          @input="$emit('update', 'imageParams.model', ($event.target as HTMLInputElement).value)"
          placeholder="e.g. dall-e-3, gpt-image-1"
          class="w-full p-2 border rounded text-sm"
        />
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Style</label>
        <input
          :value="modelValue?.imageParams?.style || ''"
          @input="$emit('update', 'imageParams.style', ($event.target as HTMLInputElement).value)"
          placeholder="e.g. vivid, natural"
          class="w-full p-2 border rounded text-sm"
        />
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Moderation</label>
        <input
          :value="modelValue?.imageParams?.moderation || ''"
          @input="$emit('update', 'imageParams.moderation', ($event.target as HTMLInputElement).value)"
          placeholder="e.g. low, auto"
          class="w-full p-2 border rounded text-sm"
        />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Card } from "@/components/ui/card";
import type { MulmoScript } from "mulmocast";

defineProps<{
  modelValue: MulmoScript;
}>();

defineEmits<{
  update: [path: string, value: unknown];
}>();
</script>
