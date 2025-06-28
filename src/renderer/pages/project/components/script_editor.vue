<template>
  <Tabs default-value="text" class="w-full">
    <TabsList class="grid w-full grid-cols-4">
      <TabsTrigger value="text">Text</TabsTrigger>
      <TabsTrigger value="yaml">YAML</TabsTrigger>
      <TabsTrigger value="json">JSON</TabsTrigger>
      <TabsTrigger value="media">Media</TabsTrigger>
    </TabsList>

    <TabsContent value="text" class="mt-4">
      <div
        class="border rounded-lg p-4 bg-gray-50 min-h-[400px] max-h-[600px] overflow-y-auto font-mono text-sm space-y-6"
      >
        <p class="text-sm text-gray-500 mb-2">Text Mode - Speaker and dialogue editing only</p>

        <div class="font-mono text-sm space-y-6 p-4 max-w-2xl mx-auto">
          <div v-for="(beat, index) in mulmoValue?.beats ?? []" :key="index" class="p-4 border rounded space-y-2">
            <div class="font-bold text-gray-700">Beat {{ index + 1 }}</div>

            <div>
              <label class="block mb-1 text-gray-500">Speaker</label>
              <input
                :value="beat.speaker"
                @input="update(index, 'speaker', $event.target.value)"
                type="text"
                class="w-full p-2 border rounded"
                placeholder="e.g. Alice"
              />
            </div>

            <div>
              <label class="block mb-1 text-gray-500">Text</label>
              <input
                :value="beat.text"
                @input="update(index, 'text', $event.target.value)"
                type="text"
                class="w-full p-2 border rounded"
                placeholder="e.g. What is AI?"
              />
            </div>

            <Button variant="outline" size="sm" @click="generateAudio(index)">generate audio</Button>
            {{ store.sessionState?.[projectId]?.["beat"]["audio"]?.[index] ? "generating" : "" }}
            <audio :src="audioFiles[index]" v-if="!!audioFiles[index]" controls />
          </div>
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
          <Card v-for="(beat, index) in mulmoValue?.beats ?? []" :key="index" class="p-4">
            <BeatEditor
              :beat="beat"
              :index="index"
              :isEnd="(mulmoValue?.beats ?? []).length === index + 1"
              :imageFile="imageFiles[index]"
              @update="update"
              @generateImage="generateImage"
              @deleteBeat="deleteBeat"
              @positionUp="positionUp"
            />
          </Card>
        </div>
      </div>
    </TabsContent>
  </Tabs>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BeatEditor from "./beat_editor.vue";

import YAML from "yaml";
import type { MulmoScript } from "mulmocast";
import { useStore } from "../../../store";
import { useRoute } from "vue-router";

interface Props {
  mulmoValue: MulmoScript;
  isValidScriptData: boolean;
  imageFiles: (ArrayBuffer | null)[];
  audioFiles: (ArrayBuffer | null)[];
}

const props = defineProps<Props>();
const emit = defineEmits(["update:mulmoValue", "update:isValidScriptData", "generateImage", "generateAudio"]);

const route = useRoute();
const store = useStore();
const projectId = computed(() => route.params.id as string);

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

const update = (index: number, path: string, value: unknown) => {
  const set = (obj: Record<string, unknown>, keys: string[], val: unknown): Record<string, unknown> =>
    keys.length === 1
      ? { ...obj, [keys[0]]: val }
      : {
          ...obj,
          [keys[0]]: set(obj[keys[0]] as Record<string, unknown>, keys.slice(1), val),
        };
  const newBeat = set(props.mulmoValue.beats[index], path.split("."), value);
  const newBeats = [...props.mulmoValue.beats.slice(0, index), newBeat, ...props.mulmoValue.beats.slice(index + 1)];

  emit("update:mulmoValue", {
    ...props.mulmoValue,
    beats: newBeats,
  });
};

// end of mulmo editor

const generateImage = (index: number) => {
  emit("generateImage", index);
  console.log(index);
};
const generateAudio = (index: number) => {
  emit("generateAudio", index);
  console.log(index);
};
const deleteBeat = (index: number) => {
  if (index >= 0 && index < props.mulmoValue.beats.length) {
    const newBeats = [...props.mulmoValue.beats];
    newBeats.splice(index, 1);
    emit("update:mulmoValue", {
      ...props.mulmoValue,
      beats: newBeats,
    });
  }
};
const positionUp = (index: number) => {
  if (index <= 0 || index >= props.mulmoValue.beats.length) return;
  const newBeats = [...props.mulmoValue.beats];
  const temp = newBeats[index - 1];
  newBeats[index - 1] = newBeats[index];
  newBeats[index] = temp;
  emit("update:mulmoValue", {
    ...props.mulmoValue,
    beats: newBeats,
  });
};
</script>
