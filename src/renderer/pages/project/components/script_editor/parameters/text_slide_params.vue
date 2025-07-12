<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Text Slide Parameters</h4>
    <div class="space-y-3">
      <div>
        <Label>CSS Styles</Label>
        <div class="text-xs text-gray-500 mb-2">Enter CSS styles as a single string or multiple lines.</div>
        <Textarea
          :model-value="cssStylesText"
          @update:model-value="handleCssStylesInput"
          placeholder="e.g. font-size: 24px;&#10;color: #333;&#10;margin: 20px;"
          class="font-mono"
          rows="6"
        />
      </div>
      <MulmoError :mulmoError="mulmoError" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MulmoError from "./mulmo_error.vue";
import type { MulmoPresentationStyle } from "mulmocast";

const props = defineProps<{
  textSlideParams?: MulmoPresentationStyle["textSlideParams"];
  mulmoError: string[];
}>();

const emit = defineEmits<{
  update: [value: string | string[]];
}>();

const cssStylesText = computed(() => {
  const styles = props.textSlideParams?.cssStyles;
  if (!styles) return "";
  if (typeof styles === "string") return styles;
  if (Array.isArray(styles)) return styles.join("\n");
  return "";
});

const handleCssStylesInput = (value: string | number) => {
  const stringValue = String(value);
  if (stringValue.includes("\n")) {
    const lines = stringValue.split("\n").filter((line) => line.trim() !== "");
    emit("update", lines);
  } else {
    emit("update", stringValue);
  }
};
</script>
