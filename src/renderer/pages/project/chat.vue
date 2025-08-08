<template>
  <div class="flex h-full flex-col space-y-4">
    <!-- Chat history -->
    <div
      ref="chatHistoryRef"
      class="h-80 space-y-4 overflow-y-auto rounded-lg border bg-white p-4 lg:flex-1"
      v-show="messages.length > 0 || isRunning"
    >
      <div v-for="(message, key) in messages" :key="key">
        <BotMessage
          :message="message.content ?? ''"
          :time="message.time"
          v-if="message.role === 'assistant' && message.content"
        />
        <BotMessage
          :message="message.content ?? ''"
          :time="message.time"
          v-if="message.role === 'tool' && message.content"
        />
        <UserMessage
          :message="message.content"
          :time="message.time"
          v-if="message.role === 'user'"
          @editUser="() => editUser(key)"
        />
      </div>
      <UserMessage :message="userInput" v-if="userInput !== ''" />
      <BotMessage v-if="isStreaming['llm']" :message="streamData['llm'] ?? ''" />
      <BotMessage v-if="isStreaming['toolsResponseLLM']" :message="streamData['toolsResponseLLM'] ?? ''" />
    </div>

    <!-- Chat input area - Slack-style design -->
    <div class="space-y-4">
      <!-- Message input field -->
      <div class="chat-input-wrapper">
        <Label class="mb-2"
          >{{ t("project.chat.enterMessage") }}
          <span class="text-gray-400">({{ llmAgent }})</span>
        </Label>
        <div class="chat-input-container flex items-center justify-between transition-colors duration-200">
          <Textarea
            ref="textareaRef"
            autofocus
            v-model="userInput"
            :disabled="isRunning"
            placeholder="ex) Thank you very much! Please proceed with the creation."
            class="field-sizing-content max-h-48 min-h-0 min-w-0 flex-1 rounded-lg border-2 border-none border-gray-200 bg-transparent bg-white px-3 py-2 text-sm outline-none focus-within:border-2 focus-within:border-blue-500"
            @keydown="handleKeydown"
          />
          <Button size="sm" @click="run()" :disabled="isCreatingScript || isRunning || noChatText" class="ml-2">
            <Send :size="16" />
          </Button>
        </div>
      </div>

      <div>
        <Button @click="clearChat" variant="outline" size="xs"> {{ t("project.chat.clearChat") }} </Button>
      </div>

      <!-- Template selection section -->
      <div class="template-section">
        <div class="rounded-lg p-1">
          <Label class="mb-3 block">
            {{ t("project.chat.createButtonDescription") }}
          </Label>

          <!-- Template dropdown and create button -->
          <div class="template-dropdown-container flex items-center gap-4">
            <Select v-model="selectedTemplateIndex" :disabled="isRunning">
              <SelectTrigger class="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="(template, k) in promptTemplates" :key="k" :value="k">
                  {{ template.title }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button size="sm" @click="copyScript" :disabled="noChatMessages || isRunning" class="mt-2 mr-2">
              {{ t("project.chat.copyScript") }}
            </Button>
            <Button size="sm" @click="createScript" :disabled="noChatMessages || noChatText || isRunning" class="mt-2">
              {{ t(isCreatingScript ? "project.chat.creating" : "project.chat.createScript") }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// vue
import { ref, computed, useTemplateRef } from "vue";
import { Send } from "lucide-vue-next";
import { useI18n } from "vue-i18n";

// graphai
import { GraphAI } from "graphai";
import * as agents from "@graphai/vanilla";
import { openAIAgent, geminiAgent, anthropicAgent, groqAgent } from "@graphai/llm_agents";
import exaToolsAgent from "../../agents/exa_agent";

import { toolsAgent } from "@graphai/tools_agent";
// import toolsAgent from "../../tools_agent";

// mulmo
import { validateSchemaAgent } from "mulmocast/browser";
import type { MulmoScript } from "mulmocast/browser";
import { promptTemplates, templateDataSet } from "mulmocast/data";

// components
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ChatMessage } from "@/types";
import { useStreamData } from "@/lib/stream";
import { setRandomBeatId } from "@/lib/beat_util.js";

import { useAutoScroll } from "@/pages/project/composable/use_auto_scroll";
import { useMulmoGlobalStore } from "@/store";

import BotMessage from "./chat/bot_message.vue";
import UserMessage from "./chat/user_message.vue";
import { graphChat, graphGenerateMulmoScript, graphExa } from "./chat/graph";

const { t } = useI18n();
const globalStore = useMulmoGlobalStore();

const { messages = [] } = defineProps<{
  messages: ChatMessage[];
}>();

const llmAgent = globalStore.settings.CHAT_LLM || "openAIAgent";

const emit = defineEmits<{
  "update:updateMulmoScript": [value: MulmoScript];
  "update:updateChatMessages": [value: ChatMessage[]];
  resetMediaFiles: [];
}>();

const selectedTemplateIndex = ref(0);

const streamNodes = ["llm", "toolsResponseLLM"];

const userInput = ref("");
const textareaRef = useTemplateRef("textareaRef");

const { streamData, streamAgentFilter, streamPlugin, isStreaming } = useStreamData();
const agentFilters = [
  {
    name: "streamAgentFilter",
    agent: streamAgentFilter,
  },
];
const chatHistoryRef = useAutoScroll([streamData, userInput, messages]);

const clearChat = () => {
  emit("update:updateChatMessages", []);
};

const graphAIAgents = {
  ...agents,
  openAIAgent,
  ollamaAgent: openAIAgent,
  geminiAgent,
  anthropicAgent,
  groqAgent,
  validateSchemaAgent,
  exaToolsAgent,
  toolsAgent,
};
const filterMessage = (setTime = false) => {
  return (message) => {
    if (setTime) {
      return { role: message.role, content: message.content, time: message.time ?? Date.now() };
    }
    return { role: message.role, content: message.content };
  };
};

const isRunning = ref(false);

const getGraphConfig = async () => {
  const ollama = globalStore.settings?.llmConfigs?.ollama ?? {};
  const openaiApikey = globalStore.settings?.APIKEY?.OPENAI_API_KEY;
  const groqApikey = globalStore.settings?.APIKEY?.GROQ_API_KEY;
  const anthropicApikey = globalStore.settings?.APIKEY?.ANTHROPIC_API_KEY;
  const geminiApikey = globalStore.settings?.APIKEY?.GEMINI_API_KEY;
  const exaApikey = globalStore.settings?.APIKEY?.EXA_API_KEY;

  return {
    openAIAgent: {
      apiKey: openaiApikey,
    },
    groqAgent: {
      apiKey: groqApikey,
      model: "llama3-8b-8192",
    },
    geminiAgent: {
      apiKey: geminiApikey,
    },
    anthropicAgent: {
      apiKey: anthropicApikey,
    },
    ollamaAgent: {
      baseURL: ollama?.url ?? "http://localhost:11434/v1",
      model: ollama?.model ?? "gpt-oss:20b",
      apiKey: "not-needed",
    },
    exaToolsAgent: {
      apiKey: exaApikey,
    },
  };
};
const run = async () => {
  if (isRunning.value) {
    return;
  }
  isRunning.value = true;

  try {
    const config = await getGraphConfig();
    const graphai = new GraphAI(graphChat(llmAgent), graphAIAgents, {
      agentFilters,
      config,
    });
    console.log(exaToolsAgent.tools);
    graphai.registerCallback(streamPlugin(streamNodes));
    graphai.injectValue("messages", messages.map(filterMessage()));
    graphai.injectValue("prompt", userInput.value);
    graphai.injectValue("tools", exaToolsAgent.tools);
    const res = await graphai.run();

    const newMessages = [...res.llm.messages.map((message) => filterMessage(true)(message))];
    userInput.value = "";
    emit("update:updateChatMessages", newMessages);
  } catch (error) {
    console.log(error);
  }
  isRunning.value = false;
};

const isCreatingScript = ref(false);

const copyScript = async () => {
  userInput.value = templateDataSet[promptTemplates[selectedTemplateIndex.value].filename];
};

const createScript = async () => {
  if (isRunning.value) {
    return;
  }
  isRunning.value = true;
  try {
    const config = await getGraphConfig();
    const graphai = new GraphAI(graphGenerateMulmoScript(llmAgent), graphAIAgents, {
      agentFilters,
      config,
    });
    graphai.registerCallback(streamPlugin(streamNodes));
    graphai.injectValue("messages", messages.map(filterMessage()));
    graphai.injectValue("prompt", userInput.value);
    const res = await graphai.run();

    const script = res.mulmoScript.data;
    script.beats.map(setRandomBeatId);
    emit("update:updateMulmoScript", script);
    emit("resetMediaFiles");
    const newMessages = [
      ...messages.map((message) => filterMessage(true)(message)),
      { content: userInput.value, role: "user", time: Date.now() },
      { content: JSON.stringify(script ?? {}, null, 2), role: "assistant", time: Date.now() },
    ];
    userInput.value = "";
    emit("update:updateChatMessages", newMessages);
  } catch (error) {
    console.log(error);
  }
  isRunning.value = false;
};

const noChatMessages = computed(() => messages.length === 0);
const noChatText = computed(() => userInput.value.length === 0);

const handleKeydown = (e: KeyboardEvent) => {
  // Mac: command + enter, Win: ctrl + enter
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    if (userInput.value.length > 0 && !isRunning.value) {
      run();
    }
  }
};

const editUser = (index: number) => {
  textareaRef.value.focus();
  userInput.value = messages[index].content;

  const newMessages = [...messages];
  newMessages.length = index;
  emit("update:updateChatMessages", newMessages);
};
</script>
