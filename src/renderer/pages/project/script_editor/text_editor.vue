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
    <Label>Text({{ t("languages." + lang) }})</Label>
    <Input
      :model-value="beat.text"
      @update:model-value="(value) => update(index, 'text', String(value))"
      @blur="saveMulmo"
      placeholder="e.g. What is AI?"
      class="h-8"
    />
  </div>
  <!-- multi lingal -->
  <div v-for="(lang, key) in supporLanguages" :key="key">
    {{ t("languages." + lang) }}
    <Input
      :model-value="multiLingualDataset[lang]"
      @blur="saveMultiLingual"
      @update:model-value="(val) => (multiLingualDataset[lang] = val)"
    />
  </div>
  <Button variant="outline" size="sm" @click="generateAudio(index)" class="w-fit">{{ t("form.generateAudio") }}</Button>
  <div v-if="supporLanguages.length > 0">
    <Button variant="outline" size="sm" @click="translateBeat(index)" class="w-fit">{{
      t("form.translateBeat")
    }}</Button>
  </div>
  <span v-if="mulmoEventStore.sessionState?.[projectId]?.['beat']?.['audio']?.[index]">{{ t("form.generating") }}</span>
  <audio :src="audioFile" v-if="!!audioFile" controls />
</template>

<script setup lang="ts">
import { computed, watch, ref } from "vue";
import { useI18n } from "vue-i18n";
import { type MulmoBeat, type MultiLingualTexts, languages } from "mulmocast/browser";

import { Button, Label, Input, Badge } from "@/components/ui";
import { getBadge } from "@/lib/beat_util.js";

import { useMulmoEventStore, useMulmoGlobalStore } from "../../../store";
import { notifyProgress } from "@/lib/notification";
import { getConcurrentTaskStatusMessageComponent } from "../concurrent_task_status_message";

const { t } = useI18n();
const mulmoEventStore = useMulmoEventStore();
const globalStore = useMulmoGlobalStore();

interface Props {
  index: number;
  beat: MulmoBeat;
  audioFile?: string;
  projectId: string;
  lang: string;
  mulmoMultiLingual: MultiLingualTexts;
}
const props = defineProps<Props>();

const emit = defineEmits(["update", "saveMulmo"]);

const supporLanguages = computed(() => {
  const data = (globalStore.settings ?? {})?.USE_LANGUAGES ?? {};
  return Object.keys(data).reduce((tmp, current) => {
    if (data[current]) {
      tmp.push(current);
    }
    return tmp;
  }, []);
});

const update = (index: number, path: string, value: unknown) => {
  emit("update", index, path, value);
};
const saveMulmo = () => {
  emit("saveMulmo");
};
const ConcurrentTaskStatusMessageComponent = getConcurrentTaskStatusMessageComponent(props.projectId);

const generateAudio = async (index: number) => {
  notifyProgress(window.electronAPI.mulmoHandler("mulmoAudioGenerate", props.projectId, index), {
    loadingMessage: ConcurrentTaskStatusMessageComponent,
    successMessage: t("notify.audio.successMessage"),
    errorMessage: t("notify.audio.errorMessage"),
  });
};

const translateBeat = async (index: number) => {
  notifyProgress(window.electronAPI.mulmoHandler("mulmoTranslateBeat", props.projectId, index, supporLanguages.value), {
    loadingMessage: ConcurrentTaskStatusMessageComponent,
    successMessage: t("notify.translate.successMessage"),
    errorMessage: t("notify.translate.errorMessage"),
  });
};

const multiLingualDataset = ref({});

const saveMultiLingual = () => {
  // todo updat and save multiLingual
  console.log(multiLingualDataset.value);
};

const convMultiLincalData = (mulmoMultiLingual?: MultiLingualTexts) => {
  const newData = {};
  languages.forEach((lang) => {
    if (mulmoMultiLingual?.[lang]?.text) {
      newData[lang] = mulmoMultiLingual?.[lang]?.text;
    }
  });
  return newData;
};

watch(
  () => props.mulmoMultiLingual,
  (mulmoMultiLingual) => {
    multiLingualDataset.value = convMultiLincalData(mulmoMultiLingual);
  },
  { deep: true, immediate: true },
);

watch(
  () => mulmoEventStore.mulmoEvent[props.projectId],
  async (mulmoEvent) => {
    if (
      mulmoEvent &&
      mulmoEvent.kind === "beat" &&
      mulmoEvent.sessionType === "multiLingual" &&
      !mulmoEvent.inSession
    ) {
      const mulmoMultiLinguals = await window.electronAPI.mulmoHandler("mulmoMultiLinguals", props.projectId);
      const mulmoMultiLingual = mulmoMultiLinguals?.[props.index]?.multiLingualTexts;
      multiLingualDataset.value = convMultiLincalData(mulmoMultiLingual);
    }
  },
);
</script>
