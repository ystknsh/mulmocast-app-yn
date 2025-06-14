<template>
  <Tabs default-value="plain" class="w-full">
    <TabsList class="grid w-full grid-cols-5">
      <TabsTrigger value="plain">Plain Text</TabsTrigger>
      <TabsTrigger value="yaml">YAML</TabsTrigger>
      <TabsTrigger value="json">JSON</TabsTrigger>
      <TabsTrigger value="media">Media</TabsTrigger>
      <TabsTrigger value="params">Parameters</TabsTrigger>
    </TabsList>

    <TabsContent value="plain" class="mt-4">
      <div class="border rounded-lg p-4 bg-gray-50 min-h-[400px]">
        <p class="text-sm text-gray-500 mb-2">Plain Text Mode - Speaker and dialogue editing only</p>
        <div class="font-mono text-sm space-y-2">
          <div>Mike Chen: Understanding AI is crucial for everyone in our increasingly digital world.</div>
        </div>
      </div>
    </TabsContent>
    <TabsContent value="yaml" class="mt-4">
      <div
        :class="[
          'border rounded-lg p-4 bg-gray-50 min-h-[400px] flex flex-col',
          { 'border-red-200': !isValidScriptData },
        ]"
      >
        <p class="text-sm text-gray-500 mb-2">YAML Mode - Complete MulmoScript editing</p>
        <textarea
          v-model="yamlText"
          class="text-sm font-mono w-full flex-1 bg-transparent outline-none resize-none"
          @input="onYamlInput"
          @focus="onFocus"
          @blur="onBlur"
        ></textarea>
      </div>
    </TabsContent>

    <TabsContent value="json" class="mt-4">
      <div
        :class="[
          'border rounded-lg p-4 bg-gray-50 min-h-[400px] flex flex-col',
          { 'border-red-200': !isValidScriptData },
        ]"
      >
        <p class="text-sm text-gray-500 mb-2">JSON Mode - Complete MulmoScript editing</p>
        <textarea
          v-model="jsonText"
          class="text-sm font-mono w-full flex-1 bg-transparent outline-none resize-none"
          @input="onJsonInput"
          @focus="onFocus"
          @blur="onBlur"
        ></textarea>
      </div>
    </TabsContent>

    <TabsContent value="media" class="mt-4">
      <div class="border rounded-lg p-4 bg-gray-50 min-h-[400px] max-h-[600px] overflow-y-auto">
        <p class="text-sm text-gray-500 mb-2">Media Mode - Beat-by-beat media editing and preview</p>

        <div class="space-y-4">
          <Card v-for="(beat, index) in mulmoValue.beats" :key="beat.id" class="p-4">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium">Beat: {{ beat.id }}</h4>
              <Badge variant="outline">{{ beat.image.type }}</Badge>
            </div>

            <p class="text-sm text-gray-600 mb-2">{{ beat.speaker }}: {{ beat.text }}</p>

            <div class="grid grid-cols-2 gap-4">
              <!-- left: Edit area -->
              <div>
                <label class="text-sm font-medium block mb-1">
                  {{ getPromptLabel(beat.image.type) }}
                </label>

                <!-- image/movie: URL or  path -->
                <template v-if="beat.image.type === 'image' || beat.image.type === 'movie'">
                  <input
                    v-if="beat.image.source.kind === 'url'"
                    v-model="beat.image.source.url"
                    class="w-full p-2 border rounded text-sm"
                    type="text"
                  />
                  <input
                    v-else-if="beat.image.source.kind === 'path'"
                    v-model="beat.image.source.path"
                    class="w-full p-2 border rounded text-sm"
                    type="text"
                  />
                </template>

                <!-- textSlide: title & bullets -->
                <template v-else-if="beat.image.type === 'textSlide'">
                  <input
                    v-model="beat.image.slide.title"
                    class="w-full p-2 border rounded text-sm mb-2"
                    placeholder="Slide Title"
                  />
                  <textarea
                    :value="beat.image.slide.bullets.join('\n')"
                    class="w-full p-2 border rounded text-sm"
                    rows="4"
                    @input="beat.image.slide.bullets = $event.target.value.split('\n')"
                  ></textarea>
                </template>

                <!-- markdown -->
                <template v-else-if="beat.image.type === 'markdown'">
                  <textarea
                    :value="beat.image.markdown.join('\n')"
                    class="w-full p-2 border rounded font-mono text-sm"
                    rows="6"
                    @input="beat.image.markdown = $event.target.value.split('\n')"
                  ></textarea>
                </template>

                <!-- chart -->
                <template v-else-if="beat.image.type === 'chart'">
                  <textarea
                    :value="JSON.stringify(beat.image.chartData, null, 2)"
                    class="w-full p-2 border rounded font-mono text-sm"
                    rows="8"
                    @input="
                      (() => {
                        try {
                          beat.image.chartData = JSON.parse($event.target.value);
                        } catch (e) {}
                      })()
                    "
                  ></textarea>
                </template>

                <!-- mermaid -->
                <template v-else-if="beat.image.type === 'mermaid'">
                  <textarea
                    v-model="beat.image.code.text"
                    class="w-full p-2 border rounded font-mono text-sm"
                    rows="6"
                  ></textarea>
                </template>

                <!-- html_tailwind -->
                <template v-else-if="beat.image.type === 'html_tailwind'">
                  <textarea
                    :value="beat.image.html.join('\n')"
                    class="w-full p-2 border rounded font-mono text-sm"
                    rows="10"
                    @input="beat.image.html = $event.target.value.split('\n')"
                  ></textarea>
                </template>

                <!-- Other -->
                <template v-else>
                  <div class="text-sm text-red-500">Unsupported type: {{ beat.image.type }}</div>
                </template>
              </div>

              <!-- right: preview -->
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <component :is="getMediaIcon(beat.image.type)" :size="32" class="mx-auto text-gray-400 mb-2" />
                <p class="text-sm text-gray-500">{{ beat.image.type }} Preview</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </TabsContent>

    <TabsContent value="params" class="mt-4">
      <div class="border rounded-lg p-4 bg-gray-50 min-h-[400px]">
        <p class="text-sm text-gray-500 mb-2">Parameters Mode - Image, Speech, and Audio parameter editing</p>
        <div class="grid grid-cols-3 gap-4">
          <Card class="p-4">
            <h4 class="font-medium mb-2">Image Parameters</h4>
            <div class="space-y-2 text-sm">
              <div>Style: Realistic</div>
              <div>Aspect Ratio: 16:9</div>
              <div>Quality: High</div>
            </div>
          </Card>
          <Card class="p-4">
            <h4 class="font-medium mb-2">Speech Parameters</h4>
            <div class="space-y-2 text-sm">
              <div>Speed: 1.0x</div>
              <div>Pitch: Normal</div>
              <div>Voice: Natural</div>
            </div>
          </Card>
          <Card class="p-4">
            <h4 class="font-medium mb-2">Audio Parameters</h4>
            <div class="space-y-2 text-sm">
              <div>Background Music: Soft</div>
              <div>Volume: 0.3</div>
              <div>Fade: Enabled</div>
            </div>
          </Card>
        </div>
      </div>
    </TabsContent>
  </Tabs>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { FileImage, Video } from "lucide-vue-next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import YAML from "yaml";
import { mulmoSample } from "./sample";
import type { MulmoScript } from "mulmocast";

interface Props {
  mulmoValue: MulmoScript;
  isValidScriptData: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:mulmoValue", "update:isValidScriptData"]);

const jsonText = ref("");
const yamlText = ref("");
const internalValue = ref({});

const syncTextFromInternal = () => {
  jsonText.value = JSON.stringify(internalValue.value, null, 2);
  yamlText.value = YAML.stringify(internalValue.value);
};

const isEditing = ref(false);
const onFocus = () => {
  isEditing.value = true;
};
const onBlur = () => {
  isEditing.value = false;
};
watch(isEditing, () => {
  if (isEditing.value) {
    syncTextFromInternal();
  }
});

watch(
  () => props.mulmoValue,
  (newVal) => {
    internalValue.value = { ...newVal };
    if (!isEditing.value) {
      syncTextFromInternal();
    }
  },
  { deep: true, immediate: true },
);

const onJsonInput = () => {
  try {
    const parsed = JSON.parse(jsonText.value);
    internalValue.value = parsed;
    yamlText.value = YAML.stringify(parsed);
    emit("update:mulmoValue", parsed);
    emit("update:isValidScriptData", true);
  } catch (err) {
    console.log(err);
    emit("update:isValidScriptData", false);
  }
};

const onYamlInput = () => {
  try {
    const parsed = YAML.parse(yamlText.value);
    internalValue.value = parsed;
    jsonText.value = JSON.stringify(parsed, null, 2);
    emit("update:mulmoValue", parsed);
    emit("update:isValidScriptData", true);
  } catch (err) {
    console.log(err);
    emit("update:isValidScriptData", false);
  }
};

// end of mulmo editor

const getMediaIcon = (type: string) => {
  switch (type) {
    case "video":
      return Video;
    default:
      return FileImage;
  }
};

function getPromptLabel(type) {
  switch (type) {
    case "image":
      return "Image Prompt (URL or path)";
    case "movie":
      return "Movie Source";
    case "textSlide":
      return "Slide Content";
    case "markdown":
      return "Markdown Text";
    case "chart":
      return "Chart JSON";
    case "mermaid":
      return "Mermaid Diagram";
    case "html_tailwind":
      return "HTML (Tailwind)";
    default:
      return "Prompt";
  }
}
</script>
