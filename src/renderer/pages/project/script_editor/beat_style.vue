<template>
  <Collapsible v-model:open="open">
    <CollapsibleTrigger as-child>
      <Button variant="ghost" size="icon" class="transition-transform duration-200" :class="{ 'rotate-180': open }">
        ^
      </Button>
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
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui";
import { type MulmoBeat, type MulmoImageParams } from "mulmocast";

interface Props {
  beat: MulmoBeat;
  imageParams: MulmoImageParams;
}

defineProps<Props>();

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

const open = ref(false);
</script>
