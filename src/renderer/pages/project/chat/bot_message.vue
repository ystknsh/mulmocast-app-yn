<template>
  <div class="flex items-start space-x-3">
    <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
      <Bot :size="16" class="text-blue-600" />
    </div>

    <div class="flex-1">
      <div
        class="chat-markdown block max-w-md rounded-lg bg-gray-100 p-3 text-sm break-words whitespace-pre-wrap text-gray-800"
        v-html="safeHtml"
      />
      <p class="mt-1 text-xs text-gray-500">{{ formatedTime }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bot } from "lucide-vue-next";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { computed } from "vue";
import dayjs from "dayjs";

const props = defineProps<{
  message: string;
  time?: number;
}>();

const formatedTime = computed(() => {
  return dayjs(props.time ?? Date.now()).format("MM/DD HH:mm"); // TODO: format i18n
});

function markdownCodeBlocks(input: string): string {
  return input.replace(/```markdown\s*\n([\s\S]*?)\n```/g, (_, code) => {
    return marked.parse(code.trim());
  });
}

const safeHtml = computed(() => DOMPurify.sanitize(markdownCodeBlocks(props.message)));
</script>

<style>
.chat-markdown pre,
.chat-markdown code,
.chat-markdown pre code {
  white-space: pre-wrap !important;
  word-break: break-word !important;
  overflow-wrap: break-word !important;
  display: block !important;
}
</style>
