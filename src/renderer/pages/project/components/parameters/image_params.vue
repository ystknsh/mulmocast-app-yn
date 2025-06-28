<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Image Parameters</h4>
    <div class="space-y-3">
      <div>
        <label class="block text-sm text-gray-600 mb-1">Provider</label>
        <select
          :value="imageParams?.provider || DEFAULT_VALUES.provider"
          @change="handleUpdate('provider', ($event.target as HTMLSelectElement).value)"
          class="w-full p-2 border rounded text-sm"
        >
          <option value="openai">OpenAI</option>
          <option value="google">Google</option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Model</label>
        <input
          :value="imageParams?.model || DEFAULT_VALUES.model"
          @input="handleUpdate('model', ($event.target as HTMLInputElement).value)"
          placeholder="e.g. dall-e-3, gpt-image-1"
          class="w-full p-2 border rounded text-sm"
        />
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Style</label>
        <input
          :value="imageParams?.style || DEFAULT_VALUES.style"
          @input="handleUpdate('style', ($event.target as HTMLInputElement).value)"
          placeholder="e.g. vivid, natural"
          class="w-full p-2 border rounded text-sm"
        />
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Moderation</label>
        <input
          :value="imageParams?.moderation || DEFAULT_VALUES.moderation"
          @input="handleUpdate('moderation', ($event.target as HTMLInputElement).value)"
          placeholder="e.g. low, auto"
          class="w-full p-2 border rounded text-sm"
        />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Card } from "@/components/ui/card";
import type { MulmoPresentationStyle } from "mulmocast";

type ImageParams = MulmoPresentationStyle["imageParams"];
type ImageParamField = "provider" | "model" | "style" | "moderation";

const props = defineProps<{
  imageParams?: ImageParams;
}>();

const emit = defineEmits<{
  update: [imageParams: ImageParams];
}>();

const DEFAULT_VALUES: ImageParams = {
  provider: "openai",
  model: "",
  style: "",
  moderation: "",
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
