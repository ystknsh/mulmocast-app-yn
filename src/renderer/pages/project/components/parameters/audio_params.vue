<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Audio Parameters</h4>
    <div class="space-y-3">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-gray-600 mb-1">Padding</label>
          <input
            :value="audioParams?.padding ?? 0.3"
            @input="$emit('update', Number(($event.target as HTMLInputElement).value), 'padding')"
            type="number"
            step="0.1"
            class="w-full p-2 border rounded text-sm"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Intro Padding</label>
          <input
            :value="audioParams?.introPadding ?? 1.0"
            @input="$emit('update', Number(($event.target as HTMLInputElement).value), 'introPadding')"
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
            :value="audioParams?.closingPadding ?? 0.8"
            @input="$emit('update', Number(($event.target as HTMLInputElement).value), 'closingPadding')"
            type="number"
            step="0.1"
            class="w-full p-2 border rounded text-sm"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Outro Padding</label>
          <input
            :value="audioParams?.outroPadding ?? 1.0"
            @input="$emit('update', Number(($event.target as HTMLInputElement).value), 'outroPadding')"
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
            :value="audioParams?.bgmVolume ?? 0.2"
            @input="$emit('update', Number(($event.target as HTMLInputElement).value), 'bgmVolume')"
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
            :value="audioParams?.audioVolume ?? 1.0"
            @input="$emit('update', Number(($event.target as HTMLInputElement).value), 'audioVolume')"
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
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Card } from "@/components/ui/card";

interface Bgm {
  kind: string;
  [key: string]: unknown;
}

interface AudioParams {
  padding?: number;
  introPadding?: number;
  closingPadding?: number;
  outroPadding?: number;
  bgmVolume?: number;
  audioVolume?: number;
  bgm?: Bgm;
}

defineProps<{
  audioParams?: AudioParams;
}>();

defineEmits<{
  update: [
    value: number,
    field: "padding" | "introPadding" | "closingPadding" | "outroPadding" | "bgmVolume" | "audioVolume",
  ];
}>();
</script>
