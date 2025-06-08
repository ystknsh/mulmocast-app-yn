<template>
  <div class="flex items-start space-x-3 flex-row-reverse space-x-reverse">
    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
      <User :size="16" class="text-white" />
    </div>
    <div class="flex-1 text-right">
      <div class="bg-blue-500 text-white p-3 rounded-lg inline-block max-w-md">
        <p class="text-sm">{{ message }}</p>
      </div>
      <p class="text-xs text-gray-500 mt-1">{{ time }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { User } from "lucide-vue-next";
const props = defineProps(['message', 'time']);

</script>
