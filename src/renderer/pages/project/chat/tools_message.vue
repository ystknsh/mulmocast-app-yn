<template>
  <div class="flex items-start space-x-3">
    <div class="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-blue-100">
      <Search :size="16" class="text-blue-600" @click="isOpen = !isOpen" />
    </div>
    <div class="flex-1">
      <div
        v-if="!isOpen"
        class="chat-markdown block max-w-md rounded-lg bg-gray-100 p-3 text-sm break-words whitespace-pre-wrap text-gray-800"
      >
        {{ message.split("\n").slice(0, 3).join("\n") }}...
      </div>
      <div
        v-else
        class="chat-markdown block max-w-md rounded-lg bg-gray-100 p-3 text-sm break-words whitespace-pre-wrap text-gray-800"
      >
        {{ message }}
      </div>

      <div class="mt-1 flex items-center gap-2">
        <p class="text-xs text-gray-500">{{ formatedTime }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from "lucide-vue-next";
import { computed, ref } from "vue";
import dayjs from "dayjs";

const props = defineProps<{
  message: string;
  time?: number;
}>();

const isOpen = ref(false);

const formatedTime = computed(() => dayjs(props.time ?? Date.now()).format("MM/DD HH:mm"));
</script>
