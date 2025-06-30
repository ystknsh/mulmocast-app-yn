<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Audio Parameters</h4>
    <div class="space-y-3">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-gray-600 mb-1">Padding</label>
          <input
            :value="audioParams?.padding ?? DEFAULT_VALUES.padding"
            @input="handleUpdate('padding', Number(($event.target as HTMLInputElement).value))"
            type="number"
            step="0.1"
            class="w-full p-2 border rounded text-sm"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Intro Padding</label>
          <input
            :value="audioParams?.introPadding ?? DEFAULT_VALUES.introPadding"
            @input="handleUpdate('introPadding', Number(($event.target as HTMLInputElement).value))"
            type="number"
            step="0.1"
            class="w-full p-2 border rounded text-sm"
          />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-gray-600 mb-1">Closing Padding</label>
          <input
            :value="audioParams?.closingPadding ?? DEFAULT_VALUES.closingPadding"
            @input="handleUpdate('closingPadding', Number(($event.target as HTMLInputElement).value))"
            type="number"
            step="0.1"
            class="w-full p-2 border rounded text-sm"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Outro Padding</label>
          <input
            :value="audioParams?.outroPadding ?? DEFAULT_VALUES.outroPadding"
            @input="handleUpdate('outroPadding', Number(($event.target as HTMLInputElement).value))"
            type="number"
            step="0.1"
            class="w-full p-2 border rounded text-sm"
          />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-gray-600 mb-1">BGM Volume</label>
          <input
            :value="audioParams?.bgmVolume ?? DEFAULT_VALUES.bgmVolume"
            @input="handleUpdate('bgmVolume', Number(($event.target as HTMLInputElement).value))"
            type="number"
            step="0.05"
            min="0"
            max="1"
            class="w-full p-2 border rounded text-sm"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Audio Volume</label>
          <input
            :value="audioParams?.audioVolume ?? DEFAULT_VALUES.audioVolume"
            @input="handleUpdate('audioVolume', Number(($event.target as HTMLInputElement).value))"
            type="number"
            step="0.05"
            min="0"
            max="1"
            class="w-full p-2 border rounded text-sm"
          />
        </div>
      </div>
      <div v-if="audioParams?.bgm">
        <label class="block text-sm text-gray-600 mb-1">Background Music</label>
        <div class="p-2 border rounded text-sm">
          <span class="text-xs text-gray-500">{{ audioParams.bgm.kind }}:</span>
          {{ (audioParams.bgm as any)[audioParams.bgm.kind] }}
        </div>
      </div>
      <MulmoError :mulmoError="mulmoError" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Card } from "@/components/ui/card";
import type { MulmoPresentationStyle } from "mulmocast";
import MulmoError from "./mulmo_error.vue";

type AudioParams = MulmoPresentationStyle["audioParams"];

const props = defineProps<{
  audioParams?: AudioParams;
  mulmoError: string[];
}>();

const emit = defineEmits<{
  update: [audioParams: AudioParams];
}>();

const DEFAULT_VALUES = {
  padding: 0.3,
  introPadding: 1.0,
  closingPadding: 0.8,
  outroPadding: 1.0,
  bgmVolume: 0.2,
  audioVolume: 1.0,
} as const;

const handleUpdate = (field: keyof typeof DEFAULT_VALUES, value: number) => {
  const currentParams = props.audioParams || {};
  emit("update", {
    ...DEFAULT_VALUES,
    ...currentParams,
    [field]: value,
  });
};
</script>
