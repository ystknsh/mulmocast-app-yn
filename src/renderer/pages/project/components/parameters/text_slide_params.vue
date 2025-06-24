<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Text Slide Parameters</h4>
    <div class="space-y-3">
      <div>
        <label class="block text-sm text-gray-600 mb-1">CSS Styles</label>
        <div class="text-xs text-gray-500 mb-2">
          Enter CSS styles as a single string or multiple lines (each line becomes an array item)
        </div>
        <textarea
          :value="cssStylesText"
          @input="handleCssStylesInput(($event.target as HTMLTextAreaElement).value)"
          placeholder="e.g. font-size: 24px;&#10;color: #333;&#10;margin: 20px;"
          class="w-full p-2 border rounded text-sm font-mono"
          rows="6"
        />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Card } from "@/components/ui/card";

type CssStyles = string | string[];

type TextSlideParams = {
  cssStyles?: CssStyles;
};

const props = defineProps<{
  textSlideParams?: TextSlideParams;
}>();

const emit = defineEmits<{
  update: [value: CssStyles];
}>();

const cssStylesText = computed(() => {
  const styles = props.textSlideParams?.cssStyles;
  if (!styles) return "";
  if (typeof styles === "string") return styles;
  if (Array.isArray(styles)) return styles.join("\n");
  return "";
});

const handleCssStylesInput = (value: string) => {
  // If it contains newlines, convert to array
  if (value.includes("\n")) {
    const lines = value.split("\n").filter((line) => line.trim() !== "");
    emit("update", lines);
  } else {
    // Otherwise, keep as single string
    emit("update", value);
  }
};
</script>
