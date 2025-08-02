<template>
  <div class="flex items-center justify-between font-bold text-gray-700">
    <span>Beat {{ index + 1 }}</span>
    <Badge variant="outline">{{ t("beat.badge." + getBadge(beat)) }}</Badge>
  </div>
  <div>
    <Label>Speaker</Label>
    <Input
      :model-value="beat?.speaker"
      @update:model-value="(value) => update(index, 'speaker', String(value))"
      placeholder="e.g. Alice"
      class="h-8"
    />
  </div>
  <div>
    <Label>Text</Label>
    <Input
      :model-value="beat.text"
      @update:model-value="(value) => update(index, 'text', String(value))"
      placeholder="e.g. What is AI?"
      class="h-8"
    />
  </div>
  <Button variant="outline" size="sm" @click="generateAudio(index)" class="w-fit">generate audio</Button>
  <span v-if="mulmoEventStore.sessionState?.[projectId]?.['beat']?.['audio']?.[index]">generating</span>
  <audio :src="audioFile" v-if="!!audioFile" controls />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { type MulmoBeat } from "mulmocast/browser";

import { Button, Label, Input, Badge } from "@/components/ui";
import { getBadge } from "@/lib/beat_util.js";

import { useMulmoEventStore } from "../../../store";

const { t } = useI18n();
const mulmoEventStore = useMulmoEventStore();

interface Props {
  index: number;
  beat: MulmoBeat;
  audioFile?: string;
  projectId: string;
}
defineProps<Props>();

const emit = defineEmits(["generateAudio", "update"]);

const update = (index: number, path: string, value: unknown) => {
  emit("update", index, path, value);
};

const generateAudio = (index: number) => {
  emit("generateAudio", index);
};
</script>
