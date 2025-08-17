<template>
  <Card class="p-4">
    <h4 class="mb-3 font-medium">{{ t("parameters.audioParams.title") }}</h4>
    <div class="space-y-3">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <Label>{{ t("parameters.audioParams.padding") }}</Label>
          <Input
            :model-value="audioParams?.padding ?? AUDIO_PARAMS_DEFAULT_VALUES.padding"
            @update:model-value="(value) => handleUpdate('padding', Number(value))"
            type="number"
            step="0.1"
          />
        </div>
        <div>
          <Label>{{ t("parameters.audioParams.introPadding") }}</Label>
          <Input
            :model-value="audioParams?.introPadding ?? AUDIO_PARAMS_DEFAULT_VALUES.introPadding"
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
            :model-value="audioParams?.closingPadding ?? AUDIO_PARAMS_DEFAULT_VALUES.closingPadding"
            @update:model-value="(value) => handleUpdate('closingPadding', Number(value))"
            type="number"
            step="0.1"
          />
        </div>
        <div>
          <Label>{{ t("parameters.audioParams.outroPadding") }}</Label>
          <Input
            :model-value="audioParams?.outroPadding ?? AUDIO_PARAMS_DEFAULT_VALUES.outroPadding"
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
            :model-value="audioParams?.bgmVolume ?? AUDIO_PARAMS_DEFAULT_VALUES.bgmVolume"
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
            :model-value="audioParams?.audioVolume ?? AUDIO_PARAMS_DEFAULT_VALUES.audioVolume"
            @update:model-value="(value) => handleUpdate('audioVolume', Number(value))"
            type="number"
            step="0.05"
            min="0"
            max="1"
          />
        </div>
      </div>
      <div>
        <Label>{{ t("parameters.audioParams.bgm") }}</Label>
        <Select :model-value="currentBgmUrl" @update:model-value="handleBgmUpdate">
          <SelectTrigger>
            <SelectValue :placeholder="t('parameters.audioParams.bgmSelect')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">
              {{ t("parameters.audioParams.noBgm") }}
            </SelectItem>
            <SelectItem v-for="bgm in bgmAssets.bgms" :key="bgm.name" :value="bgm.url">
              {{ bgm.title }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <MulmoError :mulmoError="mulmoError" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import { Card, Label, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import type { MulmoPresentationStyle } from "mulmocast/browser";
import { bgmAssets } from "mulmocast/data";
import MulmoError from "./mulmo_error.vue";
import { AUDIO_PARAMS_DEFAULT_VALUES } from "@/../shared/constants";

type AudioParams = MulmoPresentationStyle["audioParams"];

const { t } = useI18n();

const props = defineProps<{
  audioParams?: AudioParams;
  mulmoError: string[];
}>();

const emit = defineEmits<{
  update: [audioParams: AudioParams];
}>();

const handleUpdate = (field: keyof typeof AUDIO_PARAMS_DEFAULT_VALUES, value: number) => {
  const currentParams = props.audioParams || ({} as AudioParams);
  emit("update", {
    ...AUDIO_PARAMS_DEFAULT_VALUES,
    ...currentParams,
    [field]: value,
  });
};

const currentBgmUrl = computed(() => {
  if (props.audioParams?.bgm && props.audioParams.bgm.kind === "url") {
    return props.audioParams.bgm.url;
  }
  return "__none__";
});

const handleBgmUpdate = (bgmUrl: string) => {
  const currentParams = props.audioParams || ({} as AudioParams);
  if (bgmUrl === "__none__") {
    const { bgm: __bgm, ...paramsWithoutBgm } = currentParams;
    emit("update", {
      ...AUDIO_PARAMS_DEFAULT_VALUES,
      ...paramsWithoutBgm,
    });
  } else {
    emit("update", {
      ...AUDIO_PARAMS_DEFAULT_VALUES,
      ...currentParams,
      bgm: {
        kind: "url",
        url: bgmUrl,
      },
    });
  }
};
</script>
