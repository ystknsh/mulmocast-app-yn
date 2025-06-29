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
            @input="handleCustomChange($event, 'width')"
            type="number"
            class="w-full p-2 border rounded text-sm"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Height</label>
          <input
            :value="canvasSize?.height || 720"
            @input="handleCustomChange($event, 'height')"
            type="number"
            class="w-full p-2 border rounded text-sm"
          />
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Card } from "@/components/ui/card";
import type { MulmoPresentationStyle } from "mulmocast";

const PRESET_CANVAS_SIZE = {
  "1792x1024": { width: 1792, height: 1024 },
  "1024x1792": { width: 1024, height: 1792 },
  "1024x1024": { width: 1024, height: 1024 },
  "1536x1024": { width: 1536, height: 1024 },
  "1024x1536": { width: 1024, height: 1536 },
} as const;

const props = defineProps<{
  canvasSize?: MulmoPresentationStyle["canvasSize"];
}>();

const showCustom = ref(false);
const selectedPreset = ref<keyof typeof PRESET_CANVAS_SIZE | "custom">("1024x1024");

const emit = defineEmits<{
  update: [value: { width: number; height: number }];
}>();

const handlePresetChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value as keyof typeof PRESET_CANVAS_SIZE | "custom";
  selectedPreset.value = value;
  if (value !== "custom" && value in PRESET_CANVAS_SIZE) {
    showCustom.value = false;
    const preset = PRESET_CANVAS_SIZE[value as keyof typeof PRESET_CANVAS_SIZE];
    emit("update", { width: preset.width, height: preset.height });
  } else {
    showCustom.value = true;
  }
};

const handleCustomChange = (event: Event, key: "width" | "height") => {
  const value = (event.target as HTMLInputElement).value;
  const currentSize = props.canvasSize;
  emit("update", { ...currentSize, [key]: Number(value) });
};

watch(
  () => props.canvasSize,
  (newSize) => {
    if (!newSize) return;
    if (
      Object.values(PRESET_CANVAS_SIZE).some(
        (preset) => preset.width === newSize.width && preset.height === newSize.height,
      )
    ) {
      showCustom.value = false;
      selectedPreset.value = `${newSize.width}x${newSize.height}` as keyof typeof PRESET_CANVAS_SIZE;
    } else {
      showCustom.value = true;
      selectedPreset.value = "custom";
    }
  },
  { immediate: true },
);
</script>
