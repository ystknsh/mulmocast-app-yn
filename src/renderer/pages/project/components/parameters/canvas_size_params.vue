<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Canvas Size</h4>
    <div class="space-y-3">
      <div>
        <label class="block text-sm text-gray-600 mb-1">Size Preset</label>
        <select :value="selectedPreset" @change="handlePresetChange" class="w-full p-2 border rounded text-sm">
          <option v-for="(size, key) in PRESET_CANVAS_SIZE" :key="key" :value="key">
            {{ size.width }}×{{ size.height }}
          </option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div v-if="showCustom" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-gray-600 mb-1">Width</label>
          <input
            :value="canvasSize?.width || 1280"
            @input="
              emit('update', {
                width: Number(($event.target as HTMLInputElement).value),
                height: canvasSize?.height || 720,
              })
            "
            type="number"
            class="w-full p-2 border rounded text-sm"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Height</label>
          <input
            :value="canvasSize?.height || 720"
            @input="
              emit('update', {
                width: canvasSize?.width || 1280,
                height: Number(($event.target as HTMLInputElement).value),
              })
            "
            type="number"
            class="w-full p-2 border rounded text-sm"
          />
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Card } from "@/components/ui/card";
import type { MulmoPresentationStyle } from "mulmocast";
import { PRESET_CANVAS_SIZE } from "../../../../../shared/constants";

const props = defineProps<{
  canvasSize?: MulmoPresentationStyle["canvasSize"];
}>();

const showCustom = ref(false);

const emit = defineEmits<{
  update: [value: { width: number; height: number }];
}>();

const selectedPreset = computed(() => {
  const currentSize = props.canvasSize;
  if (!currentSize) return "1024x1024";

  const width = Number(currentSize.width);
  const height = Number(currentSize.height);

  for (const [key, preset] of Object.entries(PRESET_CANVAS_SIZE)) {
    if (preset.width === width && preset.height === height) {
      return key;
    }
  }
  return "custom";
});

const handlePresetChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value;
  if (value !== "custom" && value in PRESET_CANVAS_SIZE) {
    showCustom.value = false;
    const preset = PRESET_CANVAS_SIZE[value as keyof typeof PRESET_CANVAS_SIZE];
    emit("update", { width: preset.width, height: preset.height });
  } else {
    showCustom.value = true;
  }
};
</script>
