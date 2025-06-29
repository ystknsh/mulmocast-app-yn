<template>
  <div class="relative flex-1" style="overflow: hidden">
    <div
      v-if="highlighted"
      v-html="highlighted"
      class="syntax-highlighted"
      ref="highlightRef"
      :style="{ minHeight: minHeight, maxHeight: maxHeight }"
    />
    <textarea
      :value="modelValue"
      class="code-textarea"
      ref="textareaRef"
      @input="handleInput"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
      @scroll="syncScroll"
      :style="{ minHeight: minHeight, maxHeight: maxHeight }"
      :spellcheck="false"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { createHighlighter } from "shiki";

const THEME = "github-dark";

interface Props {
  modelValue: string;
  language: "json" | "yaml";
  minHeight?: string;
  maxHeight?: string;
}

const props = withDefaults(defineProps<Props>(), {
  minHeight: "350px",
  maxHeight: "600px",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  focus: [];
  blur: [];
}>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const highlighter = ref<any>(null);
const highlighted = ref("");

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const highlightRef = ref<HTMLDivElement | null>(null);

onMounted(async () => {
  highlighter.value = await createHighlighter({
    themes: [THEME],
    langs: [props.language],
  });
  updateHighlight();
});

const updateHighlight = () => {
  if (highlighter.value) {
    try {
      highlighted.value = highlighter.value.codeToHtml(props.modelValue || "", {
        lang: props.language,
        theme: THEME,
      });
    } catch (e) {
      console.error("Highlighting error:", e);
    }
  }
};

watch(() => props.modelValue, updateHighlight);

watch(
  () => props.language,
  async (newLang) => {
    if (highlighter.value) {
      await highlighter.value.loadLanguage(newLang);
      updateHighlight();
    }
  },
);

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
  updateHighlight();
};

const syncScroll = () => {
  if (textareaRef.value && highlightRef.value) {
    highlightRef.value.scrollTop = textareaRef.value.scrollTop;
    highlightRef.value.scrollLeft = textareaRef.value.scrollLeft;
  }
};
</script>

<style scoped>
.syntax-highlighted,
.code-textarea {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  white-space: pre;
  word-wrap: break-word;
  overflow-wrap: break-word;
  border-radius: 8px;
  overflow: auto;
}

.code-textarea {
  position: absolute;
  inset: 0;
  width: 100%;
  background-color: transparent;
  outline: none;
  resize: none;
  border: none;
  letter-spacing: normal;
  color: transparent;
  caret-color: white;
  -webkit-text-fill-color: transparent;
  padding: 20px;
  padding-bottom: 6px;
}

.syntax-highlighted {
  overflow: auto;
}

:deep(.syntax-highlighted > pre) {
  padding: 20px;
  width: fit-content;
  min-width: 100%;
  min-height: 350px;
}
</style>
