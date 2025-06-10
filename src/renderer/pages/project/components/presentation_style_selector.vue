<template>
  <div class="space-y-4">
    <div class="flex flex-col text-sm font-medium mb-2">Presentation Style</div>

    <div class="grid grid-cols-3 md:grid-cols-6 gap-4">
      <!-- Studio Ghibli Style -->
      <div class="relative group cursor-pointer" @click="$emit('update:modelValue', 'ghibli')">
        <div
          :class="`border-2 rounded-lg p-2 hover:border-blue-400 transition-all duration-200 hover:shadow-md bg-white ${
            modelValue === 'ghibli' ? 'border-blue-400 shadow-md' : 'border-gray-200'
          }`"
        >
          <div class="aspect-video bg-gradient-to-br bg-gray-100 rounded-md mb-3 flex items-center justify-center">
            <div class="text-center">
              <FileImage :size="24" class="text-gray-400 mx-auto mb-2" />
              <p class="text-sm text-gray-600">Image placeholder</p>
              <p class="text-xs text-gray-500">- to be replaced</p>
            </div>
          </div>
          <h3 class="font-medium text-sm text-gray-900 mb-1">Studio Ghibli Style</h3>
        </div>
        <div
          :class="`absolute top-2 right-2 transition-opacity ${
            modelValue === 'ghibli' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`"
        >
          <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
        </div>
      </div>

      <!-- Dilbert Comic Style -->
      <div class="relative group cursor-pointer" @click="$emit('update:modelValue', 'dilbert')">
        <div
          :class="`border-2 rounded-lg p-2 hover:border-blue-400 transition-all duration-200 hover:shadow-md bg-white ${
            modelValue === 'dilbert' ? 'border-blue-400 shadow-md' : 'border-gray-200'
          }`"
        >
          <div class="aspect-video bg-gradient-to-br bg-gray-100 rounded-md mb-3 flex items-center justify-center">
            <div class="text-center">
              <FileImage :size="24" class="text-gray-400 mx-auto mb-2" />
              <p class="text-sm text-gray-600">Image placeholder</p>
              <p class="text-xs text-gray-500">- to be replaced</p>
            </div>
          </div>
          <h3 class="font-medium text-sm text-gray-900 mb-1">Dilbert Comic Style</h3>
        </div>
        <div
          :class="`absolute top-2 right-2 transition-opacity ${
            modelValue === 'dilbert' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`"
        >
          <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
        </div>
      </div>

      <!-- Japanese Picture Book Style -->
      <div class="relative group cursor-pointer" @click="$emit('update:modelValue', 'japanese')">
        <div
          :class="`border-2 rounded-lg p-2 hover:border-blue-400 transition-all duration-200 hover:shadow-md bg-white ${
            modelValue === 'japanese' ? 'border-blue-400 shadow-md' : 'border-gray-200'
          }`"
        >
          <div class="aspect-video bg-gradient-to-br bg-gray-100 rounded-md mb-3 flex items-center justify-center">
            <div class="text-center">
              <FileImage :size="24" class="text-gray-400 mx-auto mb-2" />
              <p class="text-sm text-gray-600">Image placeholder</p>
              <p class="text-xs text-gray-500">- to be replaced</p>
            </div>
          </div>
          <h3 class="font-medium text-sm text-gray-900 mb-1">Japanese Picture Book</h3>
        </div>
        <div
          :class="`absolute top-2 right-2 transition-opacity ${
            modelValue === 'japanese' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
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

interface Props {
  modelValue: "ghibli" | "dilbert" | "japanese";
}

defineProps<Props>();

defineEmits<{
  "update:modelValue": [value: "ghibli" | "dilbert" | "japanese"];
}>();
</script>
