<template>
  <Card class="p-4">
    <h4 class="mb-3 font-medium">Canvas Size</h4>
    <div class="space-y-3">
      <div>
        <Label>Size Preset</Label>
        <Select :model-value="selectedPreset" @update:model-value="handlePresetChange">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="(size, key) in PRESET_CANVAS_SIZE" :key="key" :value="key">
              {{ size.width }}×{{ size.height }}
            </SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div v-if="showCustom" class="grid grid-cols-2 gap-4">
        <div>
          <Label>Width</Label>
          <Input
            :model-value="canvasSize?.width || 1280"
            @update:model-value="(value) => handleCustomChange(value, 'width')"
            type="number"
          />
        </div>
        <div>
          <Label>Height</Label>
          <Input
            :model-value="canvasSize?.height || 720"
            @update:model-value="(value) => handleCustomChange(value, 'height')"
            type="number"
          />
        </div>
      </div>
      <MulmoError :mulmoError="mulmoError" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MulmoError from "./mulmo_error.vue";
import type { MulmoPresentationStyle } from "mulmocast/browser";

const PRESET_CANVAS_SIZE = {
  "1792x1024": { width: 1792, height: 1024 },
  "1024x1792": { width: 1024, height: 1792 },
  "1024x1024": { width: 1024, height: 1024 },
  "1536x1024": { width: 1536, height: 1024 },
  "1024x1536": { width: 1024, height: 1536 },
} as const;

const props = defineProps<{
  canvasSize?: MulmoPresentationStyle["canvasSize"];
  mulmoError: string[];
}>();

const showCustom = ref(false);
const selectedPreset = ref<keyof typeof PRESET_CANVAS_SIZE | "custom">("1024x1024");

const emit = defineEmits<{
  update: [value: { width: number; height: number }];
}>();

const handlePresetChange = (value: keyof typeof PRESET_CANVAS_SIZE | "custom") => {
  selectedPreset.value = value;
  if (value !== "custom" && value in PRESET_CANVAS_SIZE) {
    showCustom.value = false;
    const preset = PRESET_CANVAS_SIZE[value];
    emit("update", { width: preset.width, height: preset.height });
  } else {
    showCustom.value = true;
  }
};

const handleCustomChange = (value: string | number, key: "width" | "height") => {
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
