<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Canvas Size</h4>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm text-gray-600 mb-1">Width</label>
        <input
          :value="canvasSize?.width || 1280"
          @input="$emit('update', Number(($event.target as HTMLInputElement).value), 'width')"
          type="number"
          class="w-full p-2 border rounded text-sm"
        />
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Height</label>
        <input
          :value="canvasSize?.height || 720"
          @input="$emit('update', Number(($event.target as HTMLInputElement).value), 'height')"
          type="number"
          class="w-full p-2 border rounded text-sm"
        />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Card } from "@/components/ui/card";

type CanvasSize = {
  width?: number;
  height?: number;
};

defineProps<{
  canvasSize?: CanvasSize;
}>();

defineEmits<{
  update: [value: number, field: "width" | "height"];
}>();
</script>
