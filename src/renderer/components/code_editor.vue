<template>
  <div ref="editorContainer" class="code-editor-container" :style="{ minHeight: minHeight }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, shallowRef } from "vue";
import loader from "@monaco-editor/loader";
import type { editor } from "monaco-editor";

interface Props {
  modelValue: string;
  language: "json" | "yaml";
  minHeight?: string;
}

const props = withDefaults(defineProps<Props>(), {
  minHeight: "560px",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  focus: [];
  blur: [];
}>();

const editorContainer = ref<HTMLDivElement | null>(null);
const editorInstance = shallowRef<editor.IStandaloneCodeEditor | null>(null);
const monacoRef = shallowRef<typeof import("monaco-editor") | null>(null);

let isUpdatingModel = false;

onMounted(async () => {
  const monaco = await loader.init();
  monacoRef.value = monaco;

  if (editorContainer.value) {
    editorInstance.value = monaco.editor.create(editorContainer.value as unknown as HTMLElement, {
      value: props.modelValue || "",
      language: props.language,
      theme: "vs-dark",
      minimap: {
        enabled: false,
      },
      fontSize: 13,
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
      lineHeight: 1.5,
      padding: {
        top: 15,
        bottom: 15,
      },
      wordWrap: "on",
      wrappingStrategy: "advanced",
      renderLineHighlight: "all",
      contextmenu: true,
      smoothScrolling: true,
      cursorBlinking: "blink",
      cursorSmoothCaretAnimation: "on",
      tabSize: 2,
      insertSpaces: true,
      formatOnPaste: true,
      scrollBeyondLastLine: false,
      quickSuggestions: {
        other: true,
        strings: true,
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnCommitCharacter: true,
      guides: {
        bracketPairs: true,
        indentation: true,
      },
    });

    editorInstance.value.onDidChangeModelContent(() => {
      if (!isUpdatingModel) {
        const value = editorInstance.value?.getValue() || "";
        emit("update:modelValue", value);
      }
    });

    editorInstance.value.onDidFocusEditorText(() => {
      emit("focus");
    });

    editorInstance.value.onDidBlurEditorText(() => {
      emit("blur");
    });
  }
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (editorInstance.value && editorInstance.value.getValue() !== newValue) {
      isUpdatingModel = true;
      editorInstance.value.setValue(newValue || "");
      isUpdatingModel = false;
    }
  },
);

watch(
  () => props.language,
  (newLanguage) => {
    if (editorInstance.value && monacoRef.value) {
      const model = editorInstance.value.getModel();
      if (model) {
        monacoRef.value.editor.setModelLanguage(model, newLanguage);
      }
    }
  },
);

onUnmounted(() => {
  editorInstance.value?.dispose();
});
</script>

<style scoped>
.code-editor-container {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background-color: #1e1e1e;
}

.code-editor-container :deep(.monaco-editor) {
  border-radius: 8px;
}

.code-editor-container :deep(.monaco-editor .margin) {
  background-color: #1e1e1e;
}

.code-editor-container :deep(.monaco-editor .monaco-editor-background) {
  background-color: #1e1e1e;
}
</style>
