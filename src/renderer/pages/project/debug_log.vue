<template>
  <div class="bg-muted rounded-lg p-4">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-sm font-medium">{{ t("project.menu.debugLog") }}</h3>
      <Button
        @click="copyDebugLogs"
        size="sm"
        variant="outline"
        :disabled="!debugLog || debugLog.length === 0"
        class="gap-2"
      >
        <Copy class="h-3 w-3" />
        {{ t("ui.actions.copy") }}
      </Button>
    </div>
    <div
      class="border-border bg-card h-40 overflow-y-auto rounded border p-2 font-mono text-xs"
      ref="logContainer"
      v-if="false"
    >
      <div v-for="(entry, i) in debugLog" :key="'debug-' + i" class="whitespace-pre-wrap">
        {{ entry }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useGraphAIDebugLogStore } from "@/store";
import { Button } from "@/components/ui";
import { Copy } from "lucide-vue-next";
import { notifySuccess, notifyError } from "@/lib/notification";

const { t } = useI18n();
const route = useRoute();
const projectId = computed(() => route.params.id as string);

const graphAIDebugStore = useGraphAIDebugLogStore();
const logContainer = ref<HTMLElement | null>(null);

// for debug
const debugLog = computed(() => graphAIDebugStore.graphaiDebugLog[projectId.value]);

watch(
  () => debugLog,
  () => {
    logContainer.value?.scrollTo({ top: logContainer.value.scrollHeight });
  },
  { deep: true },
);

// Copy debug logs to clipboard
const copyDebugLogs = async () => {
  if (!debugLog.value || debugLog.value.length === 0) return;

  // Build logsText by mapping entries to strings, pretty-printing non-strings
  const logsText = debugLog.value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }
      // Pretty-print non-string entries
      return JSON.stringify(item, null, 2);
    })
    .join("\n");

  // Try multiple clipboard methods in order of preference
  let copySucceeded = false;

  // Method 1: Try navigator.clipboard.writeText (modern browsers)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(logsText);
      copySucceeded = true;
    } catch (error) {
      console.warn("navigator.clipboard.writeText failed:", error);
    }
  }

  // Method 2: Try Electron clipboard API if available
  if (!copySucceeded && window.electronAPI?.clipboard) {
    try {
      await window.electronAPI.clipboard.writeText(logsText);
      copySucceeded = true;
    } catch (error) {
      console.warn("Electron clipboard API failed:", error);
    }
  }

  // Method 3: Fallback to document.execCommand (older browsers, insecure contexts)
  if (!copySucceeded) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = logsText;
      textarea.style.position = "fixed";
      textarea.style.left = "-999999px";
      textarea.style.top = "-999999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      copySucceeded = document.execCommand("copy");

      document.body.removeChild(textarea);
    } catch (error) {
      console.error("document.execCommand('copy') failed:", error);
    }
  }

  // Show appropriate feedback
  if (copySucceeded) {
    notifySuccess(t("settings.notifications.copiedToClipboard"));
  } else {
    notifyError(t("settings.notifications.copyFailed"));
  }
};
</script>
