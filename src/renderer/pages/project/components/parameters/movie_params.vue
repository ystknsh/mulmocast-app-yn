<template>
  <Card class="p-4" v-if="modelValue?.movieParams">
    <h4 class="font-medium mb-3">Movie Parameters</h4>
    <div class="space-y-3">
      <div>
        <label class="block text-sm text-gray-600 mb-1">FPS</label>
        <input
          :value="modelValue.movieParams.fps || 30"
          @input="$emit('update', 'movieParams.fps', Number($event.target.value))"
          type="number"
          class="w-full p-2 border rounded text-sm"
        />
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Codec</label>
        <input
          :value="modelValue.movieParams.codec || 'libx264'"
          @input="$emit('update', 'movieParams.codec', $event.target.value)"
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
