<template>
  <Layout>
    <TooltipProvider>
      <div :class="`max-w-7xl mx-auto ${getCardPadding} ${getContainerSpacing}`">
        <!-- Developer Mode Toggle - Always at the top -->
        <div class="bg-gray-50 dark:bg-gray-900 border rounded-lg p-3">
          <div class="flex items-center justify-between space-x-2 text-sm">
            <div class="flex items-center space-x-2">
              <Settings :size="16" />
              <span>Developer Mode</span>
            </div>
            <Switch v-model:checked="isDevMode" />
          </div>
          <div v-if="isDevMode" class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div class="space-y-2">
              <span class="text-sm font-medium">Design Theme</span>
              <RadioGroup v-model="selectedTheme" class="grid grid-cols-2 gap-2 text-sm">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label for="beginner">Beginner Mode</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="classic" id="classic" />
                  <Label for="classic">Classic Layout</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="compact" id="compact" />
                  <Label for="compact">Compact View</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="timeline-focus" id="timeline-focus" />
                  <Label for="timeline-focus">Timeline Focus</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="developer-debug" id="developer-debug" />
                  <Label for="developer-debug">Developer Debug</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        <!-- Header Section -->
        <div v-if="hasProjectData" class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <RouterLink to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft :size="16" class="mr-2" />
                Back
              </Button>
            </RouterLink>
            <div>
              <h1 :class="`font-bold ${getHeaderSize}`">
                {{ project?.title }}
              </h1>
              <p :class="`text-gray-600 ${selectedTheme === 'compact' ? 'text-sm' : ''}`">{{ project?.description }}</p>
            </div>
          </div>
        </div>

        <!-- AI Assistant Section -->
        <Card :class="`bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 ${getTimelineFocusClass}`">
          <CardHeader :class="selectedTheme === 'compact' ? 'pb-3' : ''">
            <CardTitle
              :class="`flex items-center space-x-2 text-blue-700 ${selectedTheme === 'compact' ? 'text-base' : ''}`"
            >
              <component :is="selectedTheme === 'beginner' ? Bot : Lightbulb" :size="20" />
              <span>
                {{ selectedTheme === "beginner" ? "AI Assistant Chat" : "AI-Powered MulmoScript Generation Guide" }}
              </span>
            </CardTitle>
            <p :class="`text-blue-600 ${selectedTheme === 'compact' ? 'text-xs' : 'text-sm'}`">
              {{
                selectedTheme === "beginner"
                  ? "Let's Create Scripts Through Conversation with AI Assistants"
                  : "Use ChatGPT or other AI tools to generate your Script content with these proven prompts"
              }}
            </p>
          </CardHeader>
          <CardContent :class="selectedTheme === 'compact' ? 'pt-0' : ''">
            <component
              :is="selectedTheme === 'beginner' ? BeginnerChat : PromptGuide"
              :selectedTheme="selectedTheme"
              @update:updateMulmoScript="handleUpdateScript"
            />
          </CardContent>
        </Card>

        <Separator v-if="hasProjectData" :class="getTimelineFocusClass" />

        <!-- MulmoScript Viewer Section -->
        <Collapsible v-if="hasProjectData" v-model:open="isScriptViewerOpen" :class="getTimelineFocusClass">
          <Card>
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle class="flex items-center space-x-2">
                  <Code2 :size="20" />
                  <span>Script</span>
                </CardTitle>
                <div class="flex items-center space-x-2">
                  <!-- Validation Status -->
                  <div class="flex items-center space-x-2">
                    <div v-if="validationStatus === 'valid'" class="group relative">
                      <CheckCircle :size="16" class="text-green-500 group-hover:text-green-600 cursor-pointer" />
                      <span
                        class="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap"
                      >
                        Validation Status
                      </span>
                    </div>
                    <AlertCircle v-if="validationStatus === 'warning'" :size="16" class="text-yellow-500" />
                    <XCircle v-if="validationStatus === 'error'" :size="16" class="text-red-500" />
                    <span v-if="validationStatus !== 'valid'" class="text-sm text-gray-600">
                      {{ validationMessage }}
                    </span>
                  </div>
                  <!-- Undo/Redo buttons -->
                  <Button variant="ghost" size="sm">
                    <Undo :size="16" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Redo :size="16" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Save :size="16" class="mr-2" />
                  </Button>
                  <!-- Collapse/Expand Button -->
                  <CollapsibleTrigger as-child>
                    <Button variant="ghost" size="sm">
                      <component :is="isScriptViewerOpen ? ChevronUp : ChevronDown" :size="16" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
            </CardHeader>
            <CollapsibleContent
              :class="`transition-all duration-300 overflow-hidden ${
                isScriptViewerOpen ? 'max-h-[800px]' : 'max-h-[180px]'
              }`"
            >
              <CardContent>
                <ScriptEditor :mulmoValue="mulmoScript" @update:mulmoValue="(val) => (mulmoScript = val)" />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <!-- Output Section -->
        <Card v-if="hasProjectData">
          <CardContent class="p-4">
            <div class="space-y-4">
              <!-- Select Presentation Style -->
              <PresentationStyleSelector v-model="selectedPresentationStyle" />

              <!-- Caption Toggle -->
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex flex-col">
                  <Label for="caption-toggle" class="text-sm font-medium"> Caption Display </Label>
                  <p class="text-xs text-gray-500 mt-1">Show captions in video and HTML outputs</p>
                </div>
                <Switch id="caption-toggle" v-model:checked="captionEnabled" />
              </div>

              <!-- Output Buttons -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button class="flex flex-col items-center space-y-2 h-auto py-4" @click="generateMovie">
                  <Monitor :size="24" />
                  <span>Generate Movie</span>
                </Button>
                <Button class="flex flex-col items-center space-y-2 h-auto py-4">
                  <FileText :size="24" />
                  <span>Generate PDF</span>
                </Button>
                <Button class="flex flex-col items-center space-y-2 h-auto py-4" @click="generateAudio">
                  <Globe :size="24" />
                  <span>Generate Podcast</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Beats Viewer Section -->
        <Collapsible v-if="beatsData.length > 0" v-model:open="isBeatsViewerOpen">
          <Card>
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle class="flex items-center space-x-2">
                  <Play :size="20" />
                  <span>Beats</span>
                  <Badge variant="secondary" class="ml-2"> {{ beatsData.length }} beats </Badge>
                </CardTitle>
                <CollapsibleTrigger as-child>
                  <Button variant="ghost" size="sm">
                    <component :is="isBeatsViewerOpen ? ChevronUp : ChevronDown" :size="16" />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <BeatsViewer
                  :beatsData="beatsData"
                  v-model:viewMode="beatsViewMode"
                  v-model:currentBeatIndex="currentBeatIndex"
                  v-model:timelinePosition="timelinePosition"
                  v-model:isPreviewAreaVisible="isPreviewAreaVisible"
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <!-- Product Section -->
        <Card v-if="hasProjectData" class="mb-8">
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <Play :size="20" />
              <span>Product</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProductTabs />
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { projectApi, type ProjectMetadata } from "@/lib/project_api";
import {
  ArrowLeft,
  Code2,
  FileText,
  Settings,
  Play,
  Save,
  Undo,
  Redo,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Monitor,
  Globe,
  Lightbulb,
  Bot,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Import sub-components (to be created)
import Layout from "@/components/layout.vue";
import BeginnerChat from "./components/beginner_chat.vue";
import PromptGuide from "./components/prompt_guide.vue";
import ScriptEditor from "./components/script_editor.vue";
import PresentationStyleSelector from "./components/presentation_style_selector.vue";
import BeatsViewer from "./components/beats_viewer.vue";
import ProductTabs from "./components/product_tabs.vue";

import dayjs from "dayjs";

import type { MulmoScript } from "mulmocast";

import { mulmoSample } from "./components/sample";
import { useDebounceFn } from "@vueuse/core";

// State
const route = useRoute();
const router = useRouter();

const projectId = computed(() => route.params.id as string);
const project = ref<ProjectMetadata | null>(null);

const mulmoScript = ref<MulmoScript | null>(null);

const hasProjectData = computed(() => true); // Todo

const isDevMode = ref(false);
const selectedTheme = ref<"classic" | "compact" | "timeline-focus" | "beginner" | "developer-debug">("beginner");
const validationStatus = ref<"valid" | "warning" | "error">("valid");
const validationMessage = ref("");
const selectedPresentationStyle = ref<"ghibli" | "dilbert" | "japanese">("ghibli");
const isScriptViewerOpen = ref(false);
const isBeatsViewerOpen = ref(false);
const beatsViewMode = ref<"list" | "timeline">("list");
const captionEnabled = ref(true);
const currentBeatIndex = ref(0);
const timelinePosition = ref(0);
const isPreviewAreaVisible = ref(false);

// Load project data on mount
onMounted(async () => {
  try {
    project.value = await projectApi.getProjectMetadata(projectId.value);
    mulmoScript.value = await projectApi.getProjectMulmoScript(projectId.value);
    // TODO: Load mulmo script data from project
  } catch (error) {
    console.error("Failed to load project:", error);
    router.push("/");
  }
});

const handleUpdateScript = (script: MulmoScript) => {
  mulmoScript.value = script;
};

const saveMulmoScript = useDebounceFn(async (data) => {
  console.log("saved", data);
  await projectApi.saveProjectScript(projectId.value, mulmoScript.value);
  project.value.updatedAt = dayjs().toISOString();
  await projectApi.saveProjectMetadata(projectId.value, project.value);
}, 1000);

watch(mulmoScript, () => {
  // Be careful not to save a page just by opening it.
  saveMulmoScript(mulmoScript.value);
});

const beatsData = ref(mulmoSample.beats);

const generateMovie = async () => {
  console.log("generateMovie");
  await window.electronAPI.mulmoHandler("mulmoActionRunner", projectId.value, "movie");
};

const generateAudio = async () => {
  console.log("generateMovie");
  await window.electronAPI.mulmoHandler("mulmoActionRunner", projectId.value, "audio");
};

// Sample beats data
/*
const beatsData = ref([
  {
    id: "intro",
    speaker: "Dr. Sarah Johnson",
    text: "Welcome to AI Fundamentals. Today we'll explore the fascinating world of artificial intelligence.",
    image: {
      status: "generating",
      prompt: "AI technology concept with neural networks",
    },
    audio: { status: "generating" },
    timestamp: "00:00",
  },
  {
    id: "conclusion",
    speaker: "Dr. Sarah Johnson",
    text: "Understanding AI is crucial for everyone in our increasingly digital world.",
    image: {
      status: "ready",
      prompt: "People collaborating with AI technology",
    },
    audio: { status: "ready" },
    timestamp: "01:45",
  },
]);
*/
// Theme change effect
watch(selectedTheme, (newTheme) => {
  if (newTheme === "beginner") {
    isScriptViewerOpen.value = true;
    isBeatsViewerOpen.value = true;
    beatsViewMode.value = "timeline";
  } else {
    isScriptViewerOpen.value = false;
    isBeatsViewerOpen.value = false;
    beatsViewMode.value = "list";
  }
});

// Computed properties
const getCardPadding = computed(() => {
  switch (selectedTheme.value) {
    case "compact":
      return "p-3";
    default:
      return "p-6";
  }
});

const getHeaderSize = computed(() => {
  switch (selectedTheme.value) {
    case "compact":
      return "text-lg";
    default:
      return "text-2xl";
  }
});

const getContainerSpacing = computed(() => {
  switch (selectedTheme.value) {
    case "compact":
      return "space-y-4";
    case "timeline-focus":
      return "space-y-8";
    default:
      return "space-y-6";
  }
});

const getTimelineFocusClass = computed(() => {
  if (selectedTheme.value === "timeline-focus") {
    return "hidden";
  }
  return "";
});
</script>
