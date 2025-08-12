<template>
  <Card class="p-4">
    <h4 class="mb-3 font-medium">{{ t("parameters.audioParams.title") }}</h4>
    <div class="space-y-3">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <Label>{{ t("parameters.audioParams.padding") }}</Label>
          <Input
            :model-value="audioParams?.padding ?? DEFAULT_VALUES.padding"
            @update:model-value="(value) => handleUpdate('padding', Number(value))"
            type="number"
            step="0.1"
          />
        </div>
        <div>
          <Label>{{ t("parameters.audioParams.introPadding") }}</Label>
          <Input
            :model-value="audioParams?.introPadding ?? DEFAULT_VALUES.introPadding"
            @update:model-value="(value) => handleUpdate('introPadding', Number(value))"
            type="number"
            step="0.1"
          />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <Label>{{ t("parameters.audioParams.closingPadding") }}</Label>
          <Input
            :model-value="audioParams?.closingPadding ?? DEFAULT_VALUES.closingPadding"
            @update:model-value="(value) => handleUpdate('closingPadding', Number(value))"
            type="number"
            step="0.1"
          />
        </div>
        <div>
          <Label>{{ t("parameters.audioParams.outroPadding") }}</Label>
          <Input
            :model-value="audioParams?.outroPadding ?? DEFAULT_VALUES.outroPadding"
            @update:model-value="(value) => handleUpdate('outroPadding', Number(value))"
            type="number"
            step="0.1"
          />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <Label>{{ t("parameters.audioParams.bgmVolume") }}</Label>
          <Input
            :model-value="audioParams?.bgmVolume ?? DEFAULT_VALUES.bgmVolume"
            @update:model-value="(value) => handleUpdate('bgmVolume', Number(value))"
            type="number"
            step="0.05"
            min="0"
            max="1"
          />
        </div>
        <div>
          <Label>{{ t("parameters.audioParams.audioVolume") }}</Label>
          <Input
            :model-value="audioParams?.audioVolume ?? DEFAULT_VALUES.audioVolume"
            @update:model-value="(value) => handleUpdate('audioVolume', Number(value))"
            type="number"
            step="0.05"
            min="0"
            max="1"
          />
        </div>
      </div>
      <div v-if="audioParams?.bgm">
        <Label>{{ t("parameters.audioParams.bgm") }}</Label>
        <div class="rounded border p-2 text-sm">
          <span class="text-xs text-gray-500">{{ audioParams.bgm.kind }}:</span>
          {{ (audioParams.bgm as any)[audioParams.bgm.kind] }}
        </div>
      </div>
      <MulmoError :mulmoError="mulmoError" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Card, Label, Input } from "@/components/ui";
import type { MulmoPresentationStyle } from "mulmocast/browser";
import MulmoError from "./mulmo_error.vue";

type AudioParams = MulmoPresentationStyle["audioParams"];

const { t } = useI18n();

const props = defineProps<{
  audioParams?: AudioParams;
  mulmoError: string[];
}>();

const emit = defineEmits<{
  update: [audioParams: AudioParams];
}>();

const DEFAULT_VALUES = {
  padding: 0.3,
  introPadding: 1.0,
  closingPadding: 0.8,
  outroPadding: 1.0,
  bgmVolume: 0.2,
  audioVolume: 1.0,
} as const;

const handleUpdate = (field: keyof typeof DEFAULT_VALUES, value: number) => {
  const currentParams = props.audioParams || ({} as AudioParams);
  emit("update", {
    ...DEFAULT_VALUES,
    ...currentParams,
    [field]: value,
  });
};
</script>
