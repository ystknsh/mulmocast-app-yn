<template>
  <Collapsible :open="!!beat?.imageParams" @update:open="updateBeatImageParams">
    <CollapsibleTrigger as-child>
      <div class="mb-3 flex items-center gap-2">
        <Checkbox variant="ghost" size="icon" :modelValue="!!beat?.imageParams" />
        <h4 class="font-medium" :class="!beat?.imageParams ? 'text-gray-500' : ''">Image Parameters</h4>
      </div>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <ImageParams
        :image-params="beat.imageParams"
        :images="imageParams.images"
        :beat="beat"
        :showTitle="false"
        @update="(value) => updateParam(value)"
        @updateImageNames="updateImageNames"
        :mulmoError="[]"
      />
    </CollapsibleContent>
  </Collapsible>
</template>

<script setup lang="ts">
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label, Checkbox } from "@/components/ui";
import { type MulmoBeat, type MulmoImageParams } from "mulmocast";
import { IMAGE_PARAMS_DEFAULT_VALUES } from "../../../../shared/constants";
import ImageParams from "./parameters/image_params.vue";

interface Props {
  beat: MulmoBeat;
  imageParams: MulmoImageParams;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  update: [key: string, imageParams: ImageParams | undefined];
  updateImageNames: [val: string[]];
}>();

const updateParam = (value: ImageParams | undefined) => {
  emit("update", "imageParams", value);
};

const updateImageNames = (value: string[]) => {
  emit("updateImageNames", value);
};

const updateBeatImageParams = (event) => {
  if (event) {
    const { images, ...newImageParams } = props?.imageParams ?? {};
    console.log(images, newImageParams);
    emit("update", "imageParams", { ...(newImageParams ?? IMAGE_PARAMS_DEFAULT_VALUES) });
    // emit("updateImageNames", Object.keys(images ?? {}));
  } else {
    emit("update", "imageParams", undefined);
    // emit("updateImageNames", []);
  }
};
</script>
