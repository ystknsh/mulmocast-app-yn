<template>
  <div class="flex h-full flex-col space-y-4">
    <SelectLanguage
      :mulmoScript="mulmoScript"
      @updateMulmoScript="(script) => emit('update:updateMulmoScript', script)"
    />
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
        <ToolsMessage
          :message="message.content ?? ''"
          :time="message.time"
          :data="message?.extra"
          v-if="message.role === 'tool' && message.content"
        />
        <UserMessage
          :message="message.content"
          :time="message.time"
          v-if="message.role === 'user'"
          @editUser="() => editUser(key)"
        />
      </div>
      <UserMessage :message="userInput" v-if="isRunning" />

      <ToolsMessage
        :message="liveToolsData.content ?? ''"
        :data="liveToolsData?.data"
        v-if="liveToolsData && isRunning"
      />
      <BotMessage v-if="isStreaming['llm'] && streamData['llm']" :message="streamData['llm'] ?? ''" />
      <BotMessage
        v-if="isStreaming['llmCallWithTools'] && streamData['llmCallWithTools']"
        :message="streamData['llmCallWithTools'] ?? ''"
      />
      <BotMessage
        v-if="isStreaming['toolsResponseLLM'] && streamData['toolsResponseLLM']"
        :message="streamData['toolsResponseLLM'] ?? ''"
      />
    </div>

    <!-- Chat input area - Slack-style design -->
    <div class="space-y-4">
      <!-- Message input field -->
      <div>
        <Label class="mb-2">
          {{ t("project.chat.enterMessage") }}
          <span class="text-gray-400">{{ `(${llmAgent}${hasExa ? " with Search" : ""})` }}</span>
        </Label>
        <div class="chat-input-container flex items-center justify-between transition-colors duration-200">
          <Textarea
            ref="textareaRef"
            autofocus
            v-model="userInput"
            :disabled="isRunning"
            :placeholder="t('project.chat.exampleMessage')"
            class="field-sizing-content max-h-48 min-h-0 min-w-0 flex-1 rounded-lg border-2 border-none border-gray-200 bg-transparent bg-white px-3 py-2 text-sm outline-none focus-within:border-2 focus-within:border-blue-500"
            @keydown="handleKeydown"
          />
          <Button size="sm" @click="run()" :disabled="isCreatingScript || isRunning || noChatText" class="ml-2">
            <Send :size="16" />
          </Button>
        </div>
      </div>

      <div>
        <Button @click="undoMessages" variant="outline" size="xs" class="mr-4" v-if="messageHistory.length > 0">
          {{ t("project.chat.undoChat") }}
        </Button>
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
            <Button size="sm" @click="copyScript" :disabled="noChatMessages || isRunning" class="mr-2">
              {{ t("project.chat.copyScript") }}
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
import puppeteerAgent from "../../agents/puppeteer_agent";
import toolsAgent from "../../agents/tools_agent";
// import { toolsAgent } from "@graphai/tools_agent";

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
import { useMulmoGlobalStore, useMulmoScriptHistoryStore } from "@/store";

import SelectLanguage from "./select_language.vue";
import BotMessage from "./chat/bot_message.vue";
import UserMessage from "./chat/user_message.vue";
import ToolsMessage from "./chat/tools_message.vue";
import { graphChatWithSearch } from "./chat/graph";
import mulmoScriptValidatorAgent from "../../agents/mulmo_script_validator";

import enLang from "../../i18n/en";
import { LLM_OLLAMA_DEFAULT_CONFIG, LLM_DEFAULT_AGENT, LLM_GROQ_DEFAULT_MODEL } from "../../../shared/constants";

const { t } = useI18n();
const globalStore = useMulmoGlobalStore();
const mulmoScriptHistoryStore = useMulmoScriptHistoryStore();

const { messages = [] } = defineProps<{
  messages: ChatMessage[];
  mulmoScript?: MulmoScript;
}>();

const llmAgent = globalStore.settings.CHAT_LLM || LLM_DEFAULT_AGENT;

const emit = defineEmits<{
  "update:updateMulmoScript": [value: MulmoScript];
  "update:updateChatMessages": [value: ChatMessage[]];
  resetMediaFiles: [];
}>();

const selectedTemplateIndex = ref(0);

const streamNodes = ["llm", "toolsResponseLLM", "llmCallWithTools"];

const userInput = ref("");
const textareaRef = useTemplateRef("textareaRef");

const liveToolsData = ref<null | Record<string, unknown>>(null);
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
  puppeteerAgent,
  toolsAgent,
  mulmoScriptValidatorAgent,
};
const filterMessage = (setTime = false) => {
  return (message) => {
    const { role, content, tool_calls, tool_call_id, name, extra } = message;
    if (setTime) {
      return { extra, role, content, tool_calls, tool_call_id, name, time: message.time ?? Date.now() };
    }
    return { extra, role, content, tool_calls, tool_call_id, name };
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
      model: LLM_GROQ_DEFAULT_MODEL,
    },
    geminiAgent: {
      apiKey: geminiApikey,
    },
    anthropicAgent: {
      apiKey: anthropicApikey,
    },
    ollamaAgent: {
      baseURL: ollama?.url ?? LLM_OLLAMA_DEFAULT_CONFIG.url,
      model: ollama?.model ?? LLM_OLLAMA_DEFAULT_CONFIG.model,
      apiKey: "not-needed",
    },
    exaToolsAgent: {
      apiKey: exaApikey,
    },
  };
};

const hasExa = !!globalStore.settings?.APIKEY?.EXA_API_KEY && llmAgent === "openAIAgent";

const run = async () => {
  if (isRunning.value) {
    return;
  }
  liveToolsData.value = null;
  isRunning.value = true;

  try {
    const config = await getGraphConfig();
    const tools = [...mulmoScriptValidatorAgent.tools, ...puppeteerAgent.tools];

    const postMessages = [
      {
        role: "system",
        content: `Always reply in ${scriptLang.value}, regardless of the language of the user's input or previous conversation.  If the user's message is in a different language, translate it into ${scriptLang.value} before replying.`,
      },
      ...messages.map(filterMessage()).filter((message) => message.role !== "system"),
    ];
    console.log(postMessages);
    const graphai = new GraphAI(graphChatWithSearch, graphAIAgents, {
      agentFilters,
      config,
    });
    graphai.registerCallback(streamPlugin(streamNodes));
    // graphai.registerCallback(console.log);
    graphai.registerCallback((data) => {
      const { agentId, nodeId, state, result, namedInputs } = data;
      if (nodeId === "toolCallAgent" && state === "completed") {
        liveToolsData.value = {
          content: result.content,
          data: {
            agent: agentId,
            arg: namedInputs.arguments,
            func: namedInputs.func,
          },
        };
      }
    });
    graphai.injectValue("messages", postMessages);
    graphai.injectValue("prompt", userInput.value);
    graphai.injectValue("llmAgent", llmAgent);
    if (hasExa) {
      tools.push(...exaToolsAgent.tools);
      graphai.injectValue("passthrough", {
        exaToolsAgent: {
          messages: messages.map(filterMessage()),
        },
      });
    }
    graphai.injectValue("tools", tools);

    const res = await graphai.run();
    console.log(res);
    const newMessages = [...res.llm.messages.map((message) => filterMessage(true)(message))];
    userInput.value = "";
    emit("update:updateChatMessages", newMessages);
    if (res?.llm?.data?.["mulmoScriptValidatorAgent--pushScript"]?.data?.isValid) {
      const { script } = res?.llm?.data?.["mulmoScriptValidatorAgent--pushScript"]?.data ?? {};
      script.beats.map(setRandomBeatId);
      emit("update:updateMulmoScript", script);
    }
  } catch (error) {
    console.log(error);
  }
  isRunning.value = false;
};

const isCreatingScript = ref(false);

const scriptLang = computed(() => {
  return enLang.languages[mulmoScriptHistoryStore.currentMulmoScript.lang ?? "en"];
});

const copyScript = async () => {
  const head = `Generate a ${scriptLang.value} script for a presentation of the given topic and pass it to tool 'pushScript.'`;
  // Generate a Japanese script for a presentation of the given topic and pass it to tool 'pushScript.'
  const template = templateDataSet[promptTemplates[selectedTemplateIndex.value].filename];
  userInput.value = head + " " + template;
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

const messageHistory = ref([]); // For undo when editUser.

const editUser = (index: number) => {
  textareaRef.value.focus();
  userInput.value = messages[index].content;

  messageHistory.value = [...messages];

  const newMessages = [...messages];
  newMessages.length = index;
  emit("update:updateChatMessages", newMessages);
};
const undoMessages = () => {
  userInput.value = "";
  emit("update:updateChatMessages", [...messageHistory.value]);
  messageHistory.value = [];
};
</script>
