<template>
  <Card class="p-4">
    <h4 class="font-medium mb-3">Image Parameters</h4>
    <div class="space-y-3">
      <div>
        <Label>Provider</Label>
        <Select
          :model-value="imageParams?.provider || DEFAULT_VALUES.provider"
          @update:model-value="(value) => handleUpdate('provider', value)"
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="google">Google</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Model</Label>
        <Input
          :model-value="imageParams?.model || DEFAULT_VALUES.model"
          @update:model-value="(value) => handleUpdate('model', String(value))"
          placeholder="e.g. dall-e-3, gpt-image-1"
        />
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
import type { MulmoPresentationStyle } from "mulmocast";

type ImageParams = MulmoPresentationStyle["imageParams"];
type ImageParamField = "provider" | "model" | "style" | "moderation";

const props = defineProps<{
  imageParams?: ImageParams;
  mulmoError: MulmoError | null;
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
