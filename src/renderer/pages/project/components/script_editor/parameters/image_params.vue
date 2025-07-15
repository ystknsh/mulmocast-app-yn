<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Image Parameters</h4>
    <div class="space-y-3">
      <div>
        <Label>Provider</Label>
        <Select
          :model-value="imageParams?.provider || DEFAULT_VALUES.provider"
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
          :model-value="imageParams?.model || DEFAULT_VALUES.model"
          @update:model-value="(value) => handleUpdate('model', String(value))"
        >
          <SelectTrigger>
            <SelectValue placeholder="Auto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="undefined">Auto</SelectItem>
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
          :model-value="imageParams?.style || DEFAULT_VALUES.style"
          @update:model-value="(value) => handleUpdate('style', String(value))"
          placeholder="e.g. vivid, natural"
        />
      </div>
      <div>
        <Label>Moderation</Label>
        <Input
          :model-value="imageParams?.moderation || DEFAULT_VALUES.moderation"
          @update:model-value="(value) => handleUpdate('moderation', String(value))"
          placeholder="e.g. low, auto"
        />
      </div>
      <MulmoError :mulmoError="mulmoError" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MulmoError from "./mulmo_error.vue";
import { provider2ImageAgent, type MulmoPresentationStyle } from "mulmocast/browser";

type ImageParams = MulmoPresentationStyle["imageParams"];
type ImageParamField = keyof ImageParams;

const PROVIDERS = Object.entries(provider2ImageAgent).map(([provider, agent]) => ({
  name: provider,
  value: provider,
  models: agent.models,
}));

const props = defineProps<{
  imageParams?: ImageParams;
  mulmoError: string[];
}>();

const emit = defineEmits<{
  update: [imageParams: ImageParams];
}>();

const DEFAULT_VALUES: ImageParams = {
  provider: "openai",
  model: undefined,
  style: undefined,
  moderation: undefined,
};

const handleProviderChange = (value: ImageParams["provider"]) => {
  if (value !== props.imageParams?.provider) {
    emit("update", { ...props.imageParams, provider: value, model: undefined });
  }
};

const handleUpdate = (field: ImageParamField, value: string) => {
  const currentParams = props.imageParams || {};
  emit("update", {
    ...DEFAULT_VALUES,
    ...currentParams,
    [field]: value,
  });
};
</script>
