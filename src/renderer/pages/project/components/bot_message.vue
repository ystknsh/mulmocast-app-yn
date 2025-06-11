<template>
  <div class="flex items-start space-x-3">
    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
      <Bot :size="16" class="text-blue-600" />
    </div>
    <div class="flex-1">
      <div class="bg-gray-100 text-gray-800 p-3 rounded-lg inline-block max-w-md">
        <p class="text-sm">{{ message }}</p>
      </div>
      <p class="text-xs text-gray-500 mt-1">{{ time }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Bot } from "lucide-vue-next";
defineProps<{
  message: string;
  time: string;
}>();
</script>
