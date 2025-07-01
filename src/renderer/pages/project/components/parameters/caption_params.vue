<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Caption Parameters</h4>
    <div class="space-y-3">
      <div>
        <label class="block text-sm text-gray-600 mb-1">Language</label>
        <div class="text-xs text-gray-500 mb-2">Caption language</div>
        <select
          :value="props.captionParams?.lang || ''"
          @change="handleLangInput(($event.target as HTMLSelectElement).value)"
          class="w-full p-2 border rounded text-sm"
        >
          <option value="">None</option>
          <option v-for="language in LANGUAGES" :key="language.id" :value="language.id">
            {{ language.name }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Styles</label>
        <div class="text-xs text-gray-500 mb-2">Enter CSS styles (one per line)</div>
        <textarea
          v-model="styles"
          placeholder="e.g. color: #FF6B6B;&#10;font-family: 'Arial Black', sans-serif;&#10;text-shadow: 2px 2px 4px rgba(0,0,0,0.5);"
          :class="[
            'w-full p-2 border rounded text-sm font-mono',
            { 'bg-gray-100 text-gray-400 cursor-not-allowed': !props.captionParams?.lang },
          ]"
          rows="6"
          :disabled="!props.captionParams?.lang"
          @change="handleStylesInput"
        />
      </div>
      <MulmoError :mulmoError="mulmoError" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Card } from "@/components/ui/card";
import type { MulmoPresentationStyle } from "mulmocast";
import { LANGUAGES } from "../../../../../shared/constants";
import MulmoError from "./mulmo_error.vue";

const props = defineProps<{
  captionParams?: MulmoPresentationStyle["captionParams"];
  mulmoError: string[];
}>();

const emit = defineEmits<{
  update: [value: Partial<MulmoPresentationStyle["captionParams"]>];
}>();

const styles = ref("");

const handleLangInput = (value: string) => {
  if (value) {
    emit("update", {
      ...props.captionParams,
      lang: value,
    });
  } else {
    emit("update", undefined);
  }
};

const handleStylesInput = () => {
  emit("update", {
    ...props.captionParams,
    styles: styles.value.split("\n").filter((line) => line.trim() !== ""),
  });
};

watch(
  () => props.captionParams,
  (newVal) => {
    // Only set styles if first time
    if (styles.value) return;
    styles.value = newVal?.styles?.join("\n") || "";
  },
  { immediate: true },
);
</script>
