<template>
  <div class="flex items-start space-x-3">
    <div class="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-blue-100">
      <component :is="icon" :size="16" class="text-blue-600" @click="isOpen = !isOpen" />
    </div>
    <div class="flex-1">
      <div
        class="mb-2 max-w-md rounded-lg bg-blue-100 px-2 py-1 text-xs font-semibold break-words whitespace-pre-wrap text-blue-700"
        v-if="data && isOpen"
      >
        {{ data?.func }}({{ argments }})
      </div>
      <div
        class="mb-2 max-w-md rounded-lg bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700"
        v-if="data && !isOpen"
      >
        {{ data?.func }}({{ argments }})
      </div>
      <div
        v-if="!isOpen"
        class="block max-w-md rounded-lg bg-gray-100 p-3 text-sm break-words whitespace-pre-wrap text-gray-800"
      >
        {{ message.split("\n").slice(0, 3).join("\n") }}...
      </div>
      <div
        v-else
        class="block max-w-md rounded-lg bg-gray-100 p-3 text-sm break-words whitespace-pre-wrap text-gray-800"
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
import { Search, ScrollText, Globe } from "lucide-vue-next";
import { computed, ref } from "vue";
import dayjs from "dayjs";

const props = defineProps<{
  message: string;
  time?: number;
  data?: {
    agent: string;
    func: string;
    arg: unknown;
  };
}>();

const isOpen = ref(false);

const icon = (() => {
  const table = {
    exaToolsAgent: Search,
    mulmoScriptValidatorAgent: ScrollText,
    puppeteerAgent: Globe,
  };
  console.log(props.data.agent);
  return table[props.data.agent] ?? Search;
})();

const argments = computed(() => {
  if (!props.data?.arg) return "";
  const text = JSON.stringify(props.data?.arg);

  if (isOpen.value || text.length < 30) {
    return text;
  }
  return text.slice(0, 30) + "...";
});
const formatedTime = computed(() => dayjs(props.time ?? Date.now()).format("MM/DD HH:mm"));
</script>
