<template>
  <Layout>
    <TooltipProvider>
      <div class="mx-auto max-w-[95%] space-y-6 p-6">
        <!-- Header Section -->
        <ProjectHeader
          :mulmoScript="mulmoScriptHistoryStore.currentMulmoScript"
          :isDevelopment="isDevelopment"
          @openProjectFolder="openProjectFolder"
          @updateMulmoScript="handleUpdateMulmoScript"
        />

        <!-- 3 Split Layout -->
        <div class="relative grid h-auto grid-cols-1 gap-4 lg:h-[calc(100vh-180px)]" :class="gridLayoutClass">
          <!-- Left Column - AI Chat -->
          <div
            class="h-full overflow-y-auto pr-2"
            :class="{ 'lg:block': isLeftColumnOpen, 'lg:hidden': !isLeftColumnOpen }"
          >
            <Card class="flex h-full flex-col">
              <CardHeader class="flex-shrink-0">
                <div class="flex items-center justify-between">
                  <div>
                    <CardTitle class="text-primary flex items-center space-x-2">
                      <Bot :size="20" />
                      <span>
                        {{ t("project.chat.title") }}
                      </span>
                    </CardTitle>
                    <p class="text-primary/80 text-sm">
                      {{ t("project.chat.beginnerDescription") }}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" @click="isLeftColumnOpen = false" class="hidden lg:inline-flex">
                    <PanelLeftClose :size="16" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent class="-mt-6 flex flex-1 flex-col overflow-hidden" v-if="projectMetadata">
                <Chat
                  :mulmoScript="mulmoScriptHistoryStore.currentMulmoScript"
                  :messages="projectMetadata?.chatMessages"
                  @update:updateChatMessages="handleUpdateChatMessages"
                  @updateMulmoScript="handleUpdateMulmoScriptWithNotify"
                  @resetMediaFiles="resetMediaFiles"
                  class="flex h-full flex-col"
                />
              </CardContent>
            </Card>
          </div>

          <!-- Left Column - Collapsed State -->
          <div v-if="!isLeftColumnOpen" class="border-border bg-muted hidden h-full w-[48px] border-r lg:flex">
            <button
              @click="isLeftColumnOpen = true"
              class="hover:bg-muted-foreground/10 flex h-full w-full flex-col items-center p-2 transition-colors"
              :aria-label="t('project.chat.openPanel')"
              :title="t('project.chat.openPanel')"
            >
              <PanelLeftOpen :size="16" class="text-muted-foreground mt-2 mb-4" />
              <Bot :size="20" class="text-primary mb-2" />
              <span class="writing-mode-vertical text-muted-foreground text-sm">{{ t("project.chat.title") }}</span>
            </button>
          </div>

          <!-- Middle Column - Script Editor -->
          <div class="h-full">
            <Collapsible class="h-full">
              <Card class="flex h-full flex-col">
                <CardHeader class="flex-shrink-0">
                  <div class="flex items-center justify-between">
                    <CollapsibleTrigger as-child>
                      <CardTitle class="flex cursor-pointer items-center space-x-2">
                        <ScrollText :size="20" />
                        <span>{{ t("project.menu.script") }}</span>
                      </CardTitle>
                    </CollapsibleTrigger>
                    <div class="flex items-center space-x-2">
                      <!-- Validation Status -->
                      <div class="flex items-center space-x-2">
                        <div v-if="isValidScriptData" class="group relative">
                          <CheckCircle
                            :size="16"
                            class="cursor-pointer text-green-500 group-hover:text-green-600 dark:text-green-400 dark:group-hover:text-green-300"
                          />
                          <span
                            class="bg-popover text-popover-foreground border-border pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded border px-2 py-1 text-xs whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                          >
                            {{ t("project.scriptEditor.validationStatus") }}
                          </span>
                        </div>
                        <XCircle v-if="!isValidScriptData" :size="16" class="text-destructive" />
                      </div>
                      <!-- Undo/Redo buttons -->
                      <Button
                        variant="ghost"
                        size="sm"
                        :disabled="!mulmoScriptHistoryStore.undoable"
                        @click="mulmoScriptHistoryStore.undo"
                      >
                        <Undo
                          :size="16"
                          :class="mulmoScriptHistoryStore.undoable ? 'text-foreground' : 'text-muted-foreground'"
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        :disabled="!mulmoScriptHistoryStore.redoable"
                        @click="mulmoScriptHistoryStore.redo"
                      >
                        <Redo
                          :size="16"
                          :class="mulmoScriptHistoryStore.redoable ? 'text-foreground' : 'text-muted-foreground'"
                        />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent class="h-full">
                  <ScriptEditor
                    :mulmoScript="mulmoScriptHistoryStore.currentMulmoScript ?? {}"
                    :imageFiles="imageFiles"
                    :movieFiles="movieFiles"
                    :audioFiles="audioFiles"
                    :lipSyncFiles="lipSyncFiles"
                    :scriptEditorActiveTab="projectMetadata?.scriptEditorActiveTab"
                    :isValidScriptData="isValidScriptData"
                    @updateMulmoScript="handleUpdateMulmoScript"
                    @updateMulmoScriptAndPushToHistory="handleUpdateMulmoScriptAndPushToHistory"
                    @generateImage="generateImage"
                    @formatAndPushHistoryMulmoScript="formatAndPushHistoryMulmoScript"
                    @update:isValidScriptData="(val) => (isValidScriptData = val)"
                    @update:scriptEditorActiveTab="handleUpdateScriptEditorActiveTab"
                    :mulmoError="mulmoError"
                  />
                </CardContent>
              </Card>
            </Collapsible>
          </div>

          <!-- Right Column - Output & Product -->
          <div
            class="space-y-4 overflow-y-auto pl-2"
            :class="{ 'lg:block': isRightColumnOpen, 'lg:hidden': !isRightColumnOpen }"
          >
            <!-- Output Section -->
            <Card>
              <CardHeader>
                <div class="flex items-center justify-between">
                  <CardTitle class="flex items-center space-x-2">
                    <Settings :size="20" />
                    <span>{{ t("project.generate.outputSettingsGeneration") }}</span>
                  </CardTitle>
                  <Button variant="ghost" size="sm" @click="isRightColumnOpen = false" class="hidden lg:inline-flex">
                    <PanelRightClose :size="16" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent class="p-4">
                <Generate :projectId="projectId" />
              </CardContent>
            </Card>

            <!-- Product Section -->
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center space-x-2" @click="openModal">
                  <Play :size="20" />
                  <span>{{ t("project.menu.product") }}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MulmoViewer
                  v-if="project"
                  :project="project"
                  :mulmoViewerActiveTab="projectMetadata?.mulmoViewerActiveTab"
                  @update:mulmoViewerActiveTab="handleUpdateMulmoViewerActiveTab"
                />
              </CardContent>
            </Card>

            <!-- Debug Log Section -->
            <Card>
              <CardContent class="space-y-4 p-4">
                <!-- Debug Logs -->
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
                  >
                    <div v-for="(entry, i) in debugLog" :key="'debug-' + i" class="whitespace-pre-wrap">
                      {{ entry }}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Right Column - Collapsed State -->
          <div v-if="!isRightColumnOpen" class="border-border bg-muted hidden h-full w-[48px] border-l lg:flex">
            <button
              @click="isRightColumnOpen = true"
              class="hover:bg-muted-foreground/10 flex h-full w-full flex-col items-center p-2 transition-colors"
              :aria-label="t('project.generate.openPanel')"
              :title="t('project.generate.openPanel')"
            >
              <PanelRightOpen :size="16" class="text-muted-foreground mt-2 mb-4" />
              <Settings :size="20" class="text-foreground mb-2" />
              <span class="writing-mode-vertical text-muted-foreground text-sm">{{
                t("project.generate.outputProduct")
              }}</span>
            </button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import {
  ScrollText,
  Settings,
  Play,
  Undo,
  Redo,
  CheckCircle,
  XCircle,
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Copy,
} from "lucide-vue-next";
import dayjs from "dayjs";
import { mulmoScriptSchema, type MulmoScript } from "mulmocast/browser";

import { Button } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator"; // Will be used for mobile layout
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TooltipProvider } from "@/components/ui/tooltip";

// Import sub-components (to be created)
import Layout from "@/components/layout.vue";
import Chat from "./project/chat.vue";
import ScriptEditor from "./project/script_editor.vue";
import Generate from "./project/generate.vue";
import MulmoViewer from "../components/mulmo_viewer/mulmo_viewer.vue";
import ProjectHeader from "./project/project_header.vue";

import { getConcurrentTaskStatusMessageComponent } from "./project/concurrent_task_status_message";

import { projectApi, type ProjectMetadata } from "@/lib/project_api";
import { notifySuccess, notifyProgress, notifyError } from "@/lib/notification";
import { setRandomBeatId } from "@/lib/beat_util.js";
import { bufferToUrl } from "@/lib/utils";

import { useMulmoEventStore, useMulmoScriptHistoryStore, useGraphAIDebugLogStore, useMulmoGlobalStore } from "@/store";

import { isLeftColumnOpen, isRightColumnOpen, gridLayoutClass } from "./project/composable/style";
import { ChatMessage, MulmoError } from "@/types";
import { type ScriptEditorTab, type MulmoViewerTab } from "../../shared/constants";

import { zodError2MulmoError } from "../lib/error";
import { useImageFiles, useAudioFiles } from "./composable";

// State
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const mulmoEventStore = useMulmoEventStore();
const mulmoScriptHistoryStore = useMulmoScriptHistoryStore();
const globalStore = useMulmoGlobalStore();

const projectId = computed(() => route.params.id as string);
const projectMetadata = ref<ProjectMetadata | null>(null);
const project = computed(() => ({
  metadata: projectMetadata.value,
  script: mulmoScriptHistoryStore.currentMulmoScript,
}));

const isDevelopment = import.meta.env.DEV;

const graphAIDebugStore = useGraphAIDebugLogStore();

const { imageFiles, movieFiles, lipSyncFiles, resetImagesData, downloadImageFiles, downloadImageFile } =
  useImageFiles();

const { audioFiles, downloadAudioFiles, resetAudioData } = useAudioFiles();

// Load project data on mount
onMounted(async () => {
  downloadAudioFiles(projectId.value);
  downloadImageFiles(projectId.value);

  try {
    projectMetadata.value = await projectApi.getProjectMetadata(projectId.value);
    const data = await projectApi.getProjectMulmoScript(projectId.value);
    data.beats.map(setRandomBeatId);
    mulmoScriptHistoryStore.initMulmoScript(data);
  } catch (error) {
    console.error("Failed to load project:", error);
    router.push("/");
  }
});

onUnmounted(() => {
  mulmoScriptHistoryStore.resetMulmoScript();
});

// mulmoScript
// for only header
const handleUpdateMulmoScriptWithNotify = (script: MulmoScript) => {
  handleUpdateMulmoScriptAndPushToHistory(script);
  notifySuccess(t("settings.notifications.createSuccess"));
};
// Save to file and push to history
const handleUpdateMulmoScriptAndPushToHistory = (script: MulmoScript) => {
  mulmoScriptHistoryStore.updateMulmoScript(script);
  formatAndPushHistoryMulmoScript();
  saveMulmoScript();
};

// Just update mulmoScript Data
const handleUpdateMulmoScript = (script: MulmoScript) => {
  mulmoScriptHistoryStore.updateMulmoScript(script);
  saveMulmoScriptDebounced(script);
};
// internal use
const saveMulmoScript = async () => {
  console.log("saved", mulmoScriptHistoryStore.currentMulmoScript);
  await projectApi.saveProjectScript(projectId.value, mulmoScriptHistoryStore.currentMulmoScript);
  projectMetadata.value.updatedAt = dayjs().toISOString();
  await projectApi.saveProjectMetadata(projectId.value, projectMetadata.value);
};
// internal use
const saveMulmoScriptDebounced = useDebounceFn(saveMulmoScript, 1000);

// end of mulmoScript

const saveProjectMetadata = async (options: { updateTimestamp?: boolean } = {}) => {
  const { updateTimestamp = true } = options;
  if (updateTimestamp) {
    projectMetadata.value.updatedAt = dayjs().toISOString();
  }
  await projectApi.saveProjectMetadata(projectId.value, projectMetadata.value);
};

const saveProjectMetadataDebounced = useDebounceFn(saveProjectMetadata, 1000);

const handleUpdateChatMessages = (messages: ChatMessage[]) => {
  projectMetadata.value.chatMessages = messages;
  saveProjectMetadataDebounced();
};

const handleUpdateScriptEditorActiveTab = (tab: ScriptEditorTab) => {
  projectMetadata.value.scriptEditorActiveTab = tab;
  saveProjectMetadata({ updateTimestamp: false });
};

const handleUpdateMulmoViewerActiveTab = (tab: MulmoViewerTab) => {
  projectMetadata.value.mulmoViewerActiveTab = tab;
  saveProjectMetadata({ updateTimestamp: false });
};

const mulmoError = computed<MulmoError>(() => {
  const zodError = mulmoScriptSchema.safeParse(mulmoScriptHistoryStore.currentMulmoScript);
  if (!zodError.success) {
    return zodError2MulmoError(zodError.error);
  }
  return null;
});

const formatAndPushHistoryMulmoScript = () => {
  const data = mulmoScriptSchema.safeParse(mulmoScriptHistoryStore.currentMulmoScript);
  if (data.success) {
    data.data.beats.map(setRandomBeatId);
    mulmoScriptHistoryStore.updateMulmoScriptAndPushToHistory(data.data);
    // push store //
  }
  console.log(data);
};

const ConcurrentTaskStatusMessageComponent = getConcurrentTaskStatusMessageComponent(projectId.value ?? "");

const openProjectFolder = async () => {
  await projectApi.openProjectFolder(projectId.value);
};

const generateImage = async (index: number, target: string) => {
  // await saveMulmoScript();
  notifyProgress(window.electronAPI.mulmoHandler("mulmoImageGenerate", projectId.value, index, target), {
    loadingMessage: ConcurrentTaskStatusMessageComponent,
    successMessage: t("notify.image.successMessage"),
    errorMessage: t("notify.image.errorMessage"),
  });
};

const resetMediaFiles = () => {
  resetImagesData();
  resetAudioData();
};

const downloadAudioFile = async (index: number, beatId: string) => {
  const res = (await window.electronAPI.mulmoHandler("mulmoAudioFile", projectId.value, index)) as Buffer;
  if (res) {
    audioFiles.value[beatId] = bufferToUrl(res, "audio/mp3");
  }
};

const isValidScriptData = ref(true);

const logContainer = ref<HTMLElement | null>(null);

const openModal = () => {
  globalStore.setMulmoViewerProjectId(projectId.value);
};

// Gets the content generated by the callback. So, it processes only when inSession is false.
watch(
  () => mulmoEventStore.mulmoEvent[projectId.value],
  async (mulmoEvent) => {
    if (mulmoEvent?.inSession) {
      return;
    }
    // generate image
    if (mulmoEvent && mulmoEvent.kind === "session") {
      if (mulmoEvent.sessionType === "image") {
        downloadImageFiles(projectId.value);
      }
      if (mulmoEvent.sessionType === "audio") {
        downloadAudioFiles(projectId.value);
      }
      if (mulmoEvent.sessionType === "pdf") {
        // downloadAudioFiles();
      }
    }

    // beats
    if (mulmoEvent?.kind === "beatGenerate" && ["image"].includes(mulmoEvent.sessionType)) {
      const index = mulmoScriptHistoryStore.currentMulmoScript?.beats?.findIndex((beat) => beat.id === mulmoEvent.id);
      if (index === -1 || index === undefined) {
        return;
      }
      downloadImageFile(projectId.value, index, mulmoEvent.id);
    }
    if (mulmoEvent?.kind === "beat" && mulmoEvent.sessionType === "audio") {
      const index = mulmoScriptHistoryStore.currentMulmoScript?.beats?.findIndex((beat) => beat.id === mulmoEvent.id);
      if (index === -1 || index === undefined) {
        return;
      }
      downloadAudioFile(index, mulmoEvent.id);
    }
    console.log(mulmoEvent);
  },
);

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

<style scoped>
.writing-mode-vertical {
  writing-mode: vertical-rl;
  text-orientation: sideways;
}
</style>
