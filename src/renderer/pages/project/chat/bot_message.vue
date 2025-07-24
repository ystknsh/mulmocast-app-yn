<template>
  <div class="flex items-start space-x-3">
    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
      <Bot :size="16" class="text-blue-600" />
    </div>
    <div class="flex-1">
      <div
        class="bg-gray-100 text-gray-800 p-3 rounded-lg block max-w-md text-sm break-words whitespace-pre-wrap chat-markdown"
        v-html="safeHtml"
      />
      <p class="text-xs text-gray-500 mt-1">{{ formatedTime }}</p>
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
  return dayjs(props.time ?? Date.now()).format("MM/DD hh:mm"); // TODO: format i18n
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
