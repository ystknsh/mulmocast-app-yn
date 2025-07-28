<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Caption Parameters</h4>
    <div class="space-y-3">
      <div>
        <Label>Language</Label>
        <div class="text-xs text-gray-500 mb-2">Caption language</div>
        <Select :model-value="props.captionParams?.lang || ''" @update:model-value="handleLangInput">
          <SelectTrigger>
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__undefined__">None</SelectItem>
            <SelectItem v-for="language in LANGUAGES" :key="language.id" :value="language.id">
              {{ language.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Styles</Label>
        <div class="text-xs text-gray-500 mb-2">Enter CSS styles (one per line)</div>
        <Textarea
          v-model="styles"
          placeholder="e.g. color: #FF6B6B;&#10;font-family: 'Arial Black', sans-serif;&#10;text-shadow: 2px 2px 4px rgba(0,0,0,0.5);"
          :class="['font-mono', { 'bg-gray-100 text-gray-400 cursor-not-allowed': !props.captionParams?.lang }]"
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MulmoPresentationStyle } from "mulmocast/browser";
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
  if (value && value !== "__undefined__") {
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
