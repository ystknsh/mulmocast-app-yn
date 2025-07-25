<template>
  <div class="h-full flex flex-col space-y-4">
    <!-- Chat history -->
    <div
      ref="chatHistoryRef"
      class="bg-white border rounded-lg p-4 h-80 lg:flex-1 overflow-y-auto space-y-4"
      v-show="messages.length > 0"
    >
      <div v-for="(message, key) in messages" :key="key">
        <BotMessage :message="message.content" :time="message.time" v-if="message.role === 'assistant'" />
        <UserMessage :message="message.content" :time="message.time" v-if="message.role === 'user'" />
      </div>
      <UserMessage :message="userInput" v-if="userInput !== ''" />
      <BotMessage v-if="isStreaming['llm']" :message="streamData['llm'] ?? ''" />
    </div>

    <!-- Chat input area - Slack-style design -->
    <div class="space-y-4">
      <!-- Message input field -->
      <div class="chat-input-wrapper">
        <Label class="mb-2"> Enter your message: </Label>
        <div
          class="chat-input-container border-2 border-gray-200 rounded-lg bg-white focus-within:border-blue-500 focus-within:border-2 transition-colors duration-200 flex justify-between"
        >
          <Textarea
            v-model="userInput"
            :disabled="isRunning"
            placeholder="ex) Thank you very much! Please proceed with the creation."
            class="flex-1 border-none outline-none px-3 py-2 text-sm bg-transparent min-w-0 field-sizing-content min-h-0"
            @keydown="handleKeydown"
          />
          <Button size="sm" @click="run()" :disabled="isCreatingScript || isRunning">
            <Send :size="16" />
          </Button>
        </div>
      </div>

      <div>
        <Button @click="clearChat" variant="outline" size="xs"> clear chat </Button>
      </div>

      <!-- Template selection section -->
      <div class="template-section">
        <div class="rounded-lg p-1">
          <Label class="mb-3 block">
            To create a script with the content so far, please select a template and press the Create button.
          </Label>

          <!-- Template dropdown and create button -->
          <div class="template-dropdown-container flex items-center gap-4">
            <Select v-model="selectedTemplateIndex" :disabled="isCreatingScript">
              <SelectTrigger class="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="(template, k) in templates" :key="k" :value="k">
                  {{ template.title }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" @click="copyScript" :disabled="!canCreateScript">
              <Loader2 v-if="isCreatingScript" class="w-4 h-4 mr-1 animate-spin" />
              copy script
            </Button>
            <Button size="sm" @click="createScript" :disabled="!canCreateScript">
              <Loader2 v-if="isCreatingScript" class="w-4 h-4 mr-1 animate-spin" />
              {{ isCreatingScript ? "Creating..." : "Create Script" }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import { ref, onMounted, computed } from "vue";
import { Send } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { GraphAI, agentInfoWrapper } from "graphai";
import { useStreamData } from "@/lib/stream";

import BotMessage from "./chat/bot_message.vue";
import UserMessage from "./chat/user_message.vue";

import * as agents from "@graphai/vanilla";
import { openAIAgent } from "@graphai/llm_agents";
import { validateSchemaAgent } from "mulmocast/browser";
// import validateSchemaAgent from "@/lib/validate_schema_agent"; // TODO
import type { MulmoScript, MulmoScriptTemplateFile } from "mulmocast/browser";
import { ChatMessage } from "@/types";
import { useAutoScroll } from "@/pages/project/composable/use_auto_scroll";

// import { notifyError } from "@/lib/notification";
import { setRandomBeatId } from "@/lib/beat_util.js";

import { graphChat, graphGenerateMulmoScript } from "./chat/graph";

const { messages = [] } = defineProps<{
  messages: ChatMessage[];
}>();

const emit = defineEmits<{
  "update:updateMulmoScript": [value: MulmoScript];
  "update:updateChatMessages": [value: ChatMessage[]];
}>();

const selectedTemplateIndex = ref(0);

const streamNodes = ["llm"];

const userInput = ref("");

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
  validateSchemaAgent: agentInfoWrapper(validateSchemaAgent),
};
const filterMessage = (message, setTime = false) => {
  if (setTime) {
    return { role: message.role, content: message.content, time: message.time ?? Date.now() };
  }
  return { role: message.role, content: message.content };
};

const isRunning = ref(false);
const run = async () => {
  if (isRunning.value) {
    return;
  }
  isRunning.value = true;

  try {
    const env = await window.electronAPI.getEnv();
    const graphai = new GraphAI(graphChat, graphAIAgents, {
      agentFilters,
      config: {
        openAIAgent: {
          apiKey: env.OPENAI_API_KEY,
        },
      },
    });
    graphai.registerCallback(streamPlugin(streamNodes));
    graphai.injectValue("messages", messages.map(filterMessage));
    graphai.injectValue("prompt", userInput.value);
    const res = await graphai.run();

    const newMessages = [
      ...messages.map((message) => filterMessage(message, true)),
      { content: userInput.value, role: "user", time: Date.now() },
      filterMessage(res.llm.message, true),
    ];
    //console.log(newMessages);
    userInput.value = "";
    emit("update:updateChatMessages", newMessages);
  } catch (error) {
    console.log(error);
  }
  isRunning.value = false;
};

const isCreatingScript = ref(false);

/*
const template = {
  "$mulmocast": {
    "version": "1.0",
    "credit": "closing"
  },
  "title": "[TITLE: Brief, engaging title for the topic]",
  "lang": "en",
  "references": [
    {
      "url": "[SOURCE_URL: URL of the source material]",
      "title": "[SOURCE_TITLE: Title of the referenced article, or paper]",
      "type": "[SOURCE_TYPE: article, paper]"
    }
  ],
  "beats": [
    {
      "text": "[OPENING_BEAT: Introduce the topic with a hook. Reference the source material and set up why this topic matters. Usually 2-3 sentences that grab attention and provide context.]",
      "imagePrompt": "[IMAGE_PROMPT: A prompt for the image to be generated for this beat.]"
    },
    {
      "text": "[MAIN_CONCEPT: Define or explain the core concept/idea. This should be the central focus of your narrative. Keep it clear and accessible.]",
      "imagePrompt": "[IMAGE_PROMPT: A prompt for the image to be generated for this beat.]"
    },
    {
      "text": "[SUPPORTING_DETAIL_1: Additional context, examples, or elaboration that helps illustrate the main concept. This could include how it works, why it's important, or real-world applications.]",
      "imagePrompt": "[IMAGE_PROMPT: A prompt for the image to be generated for this beat.]"
    },
    {
      "text": "[SUPPORTING_DETAIL_2: Continue with more examples, deeper explanation, or different aspects of the topic if needed.]",
      "imagePrompt": "[IMAGE_PROMPT: A prompt for the image to be generated for this beat.]"
    },
    {
      "text": "[ADDITIONAL_BEATS: Add more beats as necessary to fully explore the topic. Complex topics may require 6-10+ beats to cover adequately. Each beat should advance the narrative or provide valuable information.]",
      "imagePrompt": "[IMAGE_PROMPT: A prompt for the image to be generated for this beat.]"
    },
    {
      "text": "[CONCLUSION/IMPACT: Wrap up with the significance, implications, or key takeaway. Help the audience understand why this matters to them.]",
      "imagePrompt": "[IMAGE_PROMPT: A prompt for the image to be generated for this beat.]"
    }
  ]
}
*/

const specificOutputPrompt = `The output should follow the JSON schema specified below. Please provide your response as valid JSON within \`\`\`json code blocks for clarity..`;

const copyScript = async () => {
  const scriptTemplatePrompt = await window.electronAPI.mulmoHandler(
    "readTemplatePrompt",
    templates.value[selectedTemplateIndex.value].filename,
  );

  // userInput.value = templates.value[selectedTemplateIndex.value].systemPrompt;
  userInput.value = scriptTemplatePrompt;
};
const createScript = async () => {
  if (isRunning.value) {
    return;
  }
  isRunning.value = true;
  userInput.value = templates.value[selectedTemplateIndex.value].systemPrompt;

  try {
    const env = await window.electronAPI.getEnv();
    const graphai = new GraphAI(graphGenerateMulmoScript, graphAIAgents, {
      agentFilters,
      config: {
        openAIAgent: {
          apiKey: env.OPENAI_API_KEY,
        },
      },
    });
    graphai.registerCallback(streamPlugin(streamNodes));
    graphai.injectValue("messages", messages.map(filterMessage));
    graphai.injectValue("prompt", userInput.value);
    // graphai.injectValue("systemPrompt", scriptTemplatePrompt);
    graphai.injectValue("systemPrompt", specificOutputPrompt);
    const res = await graphai.run();

    const script = res.mulmoScript.data;
    script.beats.map(setRandomBeatId);
    emit("update:updateMulmoScript", script);

    const newMessages = [
      ...messages.map((message) => filterMessage(message, true)),
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

const templates = ref<MulmoScriptTemplateFile[]>([]);
onMounted(async () => {
  templates.value = (await window.electronAPI.mulmoHandler("getAvailableTemplates")) as MulmoScriptTemplateFile[];
});

const canCreateScript = computed(() => messages.length > 0 && !isCreatingScript.value);

const handleKeydown = (e: KeyboardEvent) => {
  // Mac: command + enter, Win: ctrl + enter
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    if (userInput.value.length > 0 && !isRunning.value) {
      run();
    }
  }
};
</script>

<style scoped>
.chat-input-container {
  display: flex;
  align-items: flex-end;
}
</style>
