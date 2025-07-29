<template>
  <Card class="p-4">
    <h4 class="mb-3 font-medium">Image Parameters</h4>

    <div class="space-y-3">
      <div>
        <Label>Provider</Label>
        <Select
          :model-value="imageParams?.provider || IMAGE_PARAMS_DEFAULT_VALUES.provider"
          @update:model-value="handleProviderChange"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="provider in PROVIDERS" :key="provider.value" :value="provider.value">
              {{ provider.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Model</Label>
        <Select
          :model-value="imageParams?.model || IMAGE_PARAMS_DEFAULT_VALUES.model"
          @update:model-value="(value) => handleUpdate('model', String(value))"
        >
          <SelectTrigger>
            <SelectValue placeholder="Auto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__undefined__">Auto</SelectItem>
            <SelectItem
              v-for="model in PROVIDERS.find((p) => p.value === imageParams?.provider)?.models || []"
              :key="model"
              :value="model"
            >
              {{ model }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Style</Label>
        <Input
          :model-value="imageParams?.style || IMAGE_PARAMS_DEFAULT_VALUES.style"
          @update:model-value="(value) => handleUpdate('style', String(value))"
          placeholder="e.g. vivid, natural"
        />
      </div>
      <div class="my-2">
        <Label>Moderation</Label>
        <Input
          :model-value="imageParams?.moderation || IMAGE_PARAMS_DEFAULT_VALUES.moderation"
          @update:model-value="(value) => handleUpdate('moderation', String(value))"
          placeholder="e.g. low, auto"
        />
      </div>
      <div v-if="enableCheckbox && mulmoImageParams.images" class="my-2">
        <Label>Images</Label>
        <div v-for="(imageKey, key) in Object.keys(mulmoImageParams.images)" :key="imageKey">
          <Checkbox
            :model-value="(beat?.imageNames ?? Object.keys(mulmoImageParams?.images ?? {})).includes(imageKey)"
            @update:modelValue="(val) => updateImageNames(imageKey, val)"
            class="m-2"
          />{{ imageKey }}
        </div>
      </div>
      <MulmoError :mulmoError="mulmoError" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Label, Input, Checkbox, Card } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MulmoError from "./mulmo_error.vue";
import { provider2ImageAgent, type MulmoImageParams, type MulmoBeat, type Text2ImageProvider } from "mulmocast/browser";

import { IMAGE_PARAMS_DEFAULT_VALUES } from "../../../../../shared/constants";

type ImageParamField = keyof MulmoImageParams;

const PROVIDERS = Object.entries(provider2ImageAgent).map(([provider, agent]) => ({
  name: provider,
  value: provider,
  models: agent.models,
}));

const props = defineProps<{
  imageParams?: MulmoImageParams;
  mulmoImageParams?: MulmoImageParams;
  mulmoError: string[];
  enableCheckbox?: boolean;
  beat?: MulmoBeat;
}>();

const emit = defineEmits<{
  update: [imageParams: MulmoImageParams];
  updateImageNames: [imageKey: string, val: string[]];
}>();

const updateImageNames = (imageKey: string, val: string[]) => {
  const current = props.beat?.imageNames ?? [];

  const newArray = val
    ? current.includes(imageKey)
      ? current
      : [...current, imageKey]
    : current.filter((key) => key !== imageKey);

  emit("updateImageNames", imageKey, newArray);
};

const handleProviderChange = (value: Text2ImageProvider) => {
  if (value !== props.imageParams?.provider) {
    emit("update", { ...props.imageParams, provider: value, model: undefined });
  }
};

const handleUpdate = (field: ImageParamField, value: string) => {
  const currentParams = props.imageParams || {};
  emit("update", {
    ...IMAGE_PARAMS_DEFAULT_VALUES,
    ...currentParams,
    [field]: value == "__undefined__" ? undefined : value,
  });
};
</script>
