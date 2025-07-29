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
        @update="(value) => updateParam(value)"
        :enableCheckbox="true"
        :mulmoError="[]"
      />
    </CollapsibleContent>
  </Collapsible>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui";

interface Props {
  beat: MulmoBeat;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  update: [key: string, imageParams: ImageParams | undefined];
}>();

import ImageParams from "./parameters/image_params.vue";

const updateParam = (value: any) => {
  emit("update", "imageParams", value);
};

const open = ref(false);
</script>
