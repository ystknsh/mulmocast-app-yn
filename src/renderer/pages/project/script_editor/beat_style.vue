<template>
  <Collapsible :open="!!beat?.imageParams" @update:open="openEvent">
    <CollapsibleTrigger as-child>
      <Checkbox variant="ghost" size="icon" />
    </CollapsibleTrigger>
    <CollapsibleContent>
      <ImageParams
        :image-params="beat.imageParams"
        :mulmo-image-params="imageParams"
        :beat="beat"
        @update="(value) => updateParam(value)"
        @updateImageNames="updateImageNames"
        :enable-checkbox="true"
        :mulmoError="[]"
      />
    </CollapsibleContent>
  </Collapsible>

  <div class="space-y-2 text-sm text-gray-300" v-if="!beat?.imageParams && imageParams">
    <h4 class="mb-3 font-medium text-gray-500">Image Parameters</h4>
    <div>
      <Label class="block font-medium text-gray-500">Provider</Label>
      <p>{{ imageParams.provider }}</p>
    </div>
    <div>
      <Label class="block font-medium text-gray-500" v-if="imageParams.model">Model</Label>
      <p>{{ imageParams.model }}</p>
    </div>
    <div>
      <Label class="block font-medium text-gray-500" v-if="imageParams.style">Style</Label>
      <p>{{ imageParams.style }}</p>
    </div>
    <div>
      <Label class="block font-medium text-gray-500" v-if="imageParams.moderation">Moderation</Label>
      <p>{{ imageParams.moderation }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button, Label, Checkbox } from "@/components/ui";
import { type MulmoBeat, type MulmoImageParams } from "mulmocast";
import { IMAGE_PARAMS_DEFAULT_VALUES } from "../../../../shared/constants";

interface Props {
  beat: MulmoBeat;
  imageParams: MulmoImageParams;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  update: [key: string, imageParams: ImageParams | undefined];
  updateImageNames: [imageKey: string, val: string[]];
}>();

import ImageParams from "./parameters/image_params.vue";

const updateParam = (value: ImageParams | undefined) => {
  emit("update", "imageParams", value);
};

const updateImageNames = (imageKey: string, value: string[]) => {
  emit("updateImageNames", imageKey, value);
};

const openEvent = (event) => {
  if (event) {
    emit("update", "imageParams", props.imageParams ?? IMAGE_PARAMS_DEFAULT_VALUES);
  } else {
    emit("update", "imageParams", undefined);
  }
};
</script>
