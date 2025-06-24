<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Audio Parameters</h4>
    <div class="space-y-3">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-gray-600 mb-1">Padding</label>
          <input
            :value="modelValue?.audioParams?.padding || 0.3"
            @input="$emit('update', 'audioParams.padding', Number($event.target.value))"
            type="number"
            step="0.1"
            class="w-full p-2 border rounded text-sm"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Intro Padding</label>
          <input
            :value="modelValue?.audioParams?.introPadding || 1.0"
            @input="$emit('update', 'audioParams.introPadding', Number($event.target.value))"
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
            :value="modelValue?.audioParams?.closingPadding || 0.8"
            @input="$emit('update', 'audioParams.closingPadding', Number($event.target.value))"
            type="number"
            step="0.1"
            class="w-full p-2 border rounded text-sm"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Outro Padding</label>
          <input
            :value="modelValue?.audioParams?.outroPadding || 1.0"
            @input="$emit('update', 'audioParams.outroPadding', Number($event.target.value))"
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
            :value="modelValue?.audioParams?.bgmVolume || 0.2"
            @input="$emit('update', 'audioParams.bgmVolume', Number($event.target.value))"
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
            :value="modelValue?.audioParams?.audioVolume || 1.0"
            @input="$emit('update', 'audioParams.audioVolume', Number($event.target.value))"
            type="number"
            step="0.05"
            min="0"
            max="1"
            class="w-full p-2 border rounded text-sm"
          />
        </div>
      </div>
      <div v-if="modelValue?.audioParams?.bgm">
        <label class="block text-sm text-gray-600 mb-1">Background Music</label>
        <div class="p-2 border rounded text-sm">
          <span class="text-xs text-gray-500">{{ modelValue.audioParams.bgm.kind }}:</span>
          {{ modelValue.audioParams.bgm[modelValue.audioParams.bgm.kind] }}
        </div>
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
