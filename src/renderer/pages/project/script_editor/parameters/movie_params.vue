<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">{{ t("project.scriptEditor.movieParams.title") }}</h4>
    <div class="space-y-3">
      <div>
        <Label>{{ t("project.scriptEditor.movieParams.provider") }}</Label>
        <Select
          :model-value="movieParams?.provider || DEFAULT_VALUES.provider"
          @update:model-value="handleProviderChange"
        >
          <SelectTrigger>
            <SelectValue :placeholder="t('project.scriptEditor.movieParams.providerNone')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="undefined">{{ t("project.scriptEditor.movieParams.providerNone") }}</SelectItem>
            <SelectItem v-for="provider in PROVIDERS" :key="provider.value" :value="provider.value">
              {{ provider.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>{{ t("project.scriptEditor.movieParams.model") }}</Label>
        <Select
          :model-value="movieParams?.model || DEFAULT_VALUES.model"
          @update:model-value="handleModelChange"
          :disabled="!movieParams?.provider"
        >
          <SelectTrigger>
            <SelectValue :placeholder="t('project.scriptEditor.movieParams.modelAuto')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="undefined">{{ t("project.scriptEditor.movieParams.modelAuto") }}</SelectItem>
            <SelectItem
              v-for="model in PROVIDERS.find((p) => p.value === movieParams?.provider)?.models || []"
              :key="model"
              :value="model"
            >
              {{ model }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>{{ t("project.scriptEditor.movieParams.transitionType") }}</Label>
        <Select
          :model-value="movieParams?.transition?.type || DEFAULT_VALUES.transition.type"
          @update:model-value="handleTransitionTypeChange"
          :disabled="!movieParams?.provider"
        >
          <SelectTrigger>
            <SelectValue :placeholder="t('project.scriptEditor.movieParams.providerNone')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="undefined">{{ t("project.scriptEditor.movieParams.providerNone") }}</SelectItem>
            <SelectItem value="fade">{{ t("project.scriptEditor.movieParams.transitionFade") }}</SelectItem>
            <SelectItem value="slideout_left">{{
              t("project.scriptEditor.movieParams.transitionSlideoutLeft")
            }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>{{ t("project.scriptEditor.movieParams.transitionDuration") }}</Label>
        <Input
          :model-value="movieParams?.transition?.duration ?? DEFAULT_VALUES.transition.duration"
          @update:model-value="handleTransitionDurationChange"
          type="number"
          min="0"
          max="2"
          step="0.1"
          :disabled="!movieParams?.transition?.type || !movieParams?.provider"
        />
      </div>
      <MulmoError :mulmoError="mulmoError" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MulmoError from "./mulmo_error.vue";
import { provider2MovieAgent, type MulmoPresentationStyle } from "mulmocast/browser";

type MovieParams = MulmoPresentationStyle["movieParams"];

const PROVIDERS = Object.entries(provider2MovieAgent).map(([provider, agent]) => {
  return {
    name: provider,
    value: provider,
    models: agent.models,
  };
});

const { t } = useI18n();

const props = defineProps<{
  movieParams?: MovieParams;
  mulmoError: string[];
}>();

const emit = defineEmits<{
  update: [movieParams: MovieParams];
}>();

const DEFAULT_VALUES: MovieParams = {
  provider: provider2MovieAgent.replicate.agentName,
  model: "",
  transition: {
    type: undefined,
    duration: 0.3,
  },
};

const currentParams = computed((): MovieParams => {
  return {
    provider: props.movieParams?.provider || DEFAULT_VALUES.provider,
    model: props.movieParams?.model || DEFAULT_VALUES.model,
    transition: {
      type: props.movieParams?.transition?.type || DEFAULT_VALUES.transition.type,
      duration: props.movieParams?.transition?.duration ?? DEFAULT_VALUES.transition.duration,
    },
  };
});

const updateParams = (partial: Partial<MovieParams>) => {
  const params = {
    ...currentParams.value,
    ...partial,
    transition: partial.transition
      ? {
          ...currentParams.value.transition,
          ...partial.transition,
        }
      : currentParams.value.transition,
  };
  if (params.transition.type === undefined) {
    delete params.transition;
  }
  emit("update", params);
};

const handleProviderChange = (value: MovieParams["provider"]) => {
  updateParams({ provider: value, model: undefined });
};

const handleModelChange = (value: MovieParams["model"]) => {
  updateParams({ model: value });
};

const handleTransitionTypeChange = (value: MovieParams["transition"]["type"]) => {
  updateParams({
    transition: { type: value as "fade" | "slideout_left", duration: currentParams.value.transition.duration },
  });
};

const handleTransitionDurationChange = (value: MovieParams["transition"]["duration"]) => {
  updateParams({ transition: { type: currentParams.value.transition.type, duration: value } });
};
</script>
