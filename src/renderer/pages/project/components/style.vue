<template>
  <div class="space-y-4">
    <div class="flex flex-col text-sm font-medium mb-2">Presentation Style</div>

    <div class="grid grid-cols-3 md:grid-cols-6 gap-4">
      <div
        v-for="style in presentationStyles"
        :key="style.value"
        class="relative group cursor-pointer"
        @click="$emit('update:modelValue', style.value)"
      >
        <div
          :class="[
            'border-2 rounded-lg p-2 transition-all duration-200 bg-white',
            modelValue === style.value ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:bg-blue-50',
          ]"
        >
          <div class="aspect-video bg-gradient-to-br bg-gray-100 rounded-md mb-3 flex items-center justify-center">
            <div class="text-center">
              <FileImage :size="24" class="text-gray-400 mx-auto mb-2" />
              <p class="text-sm text-gray-600">Image placeholder</p>
              <p class="text-xs text-gray-500">- to be replaced</p>
            </div>
          </div>
          <h3 class="font-medium text-sm text-gray-900 mb-1">{{ style.label }}</h3>
        </div>
        <div
          :class="`absolute top-2 right-2 transition-opacity ${
            modelValue === style.value ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`"
        >
          <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileImage } from "lucide-vue-next";

interface PresentationStyle {
  label: string;
  value: string;
}

const presentationStyles: PresentationStyle[] = [
  { label: "Studio Ghibli Style", value: "ghibli" },
  { label: "Dilbert Comic Style", value: "dilbert" },
  { label: "Japanese Picture Book", value: "japanese" },
];

interface Props {
  modelValue: string;
}

defineProps<Props>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>
