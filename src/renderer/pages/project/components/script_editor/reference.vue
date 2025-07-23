<template>
  <Button @click="reference">Reference</Button>
  <div v-for="(imageKey, key) in Object.keys(imageRefs)" :key="key">
    <img :src="imageRefs[imageKey]" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { bufferToUrl } from "@/lib/utils";

interface Props {
  projectId: string;
}

const props = defineProps<Props>();

const imageRefs = ref<Record<string, ArrayBuffer>>({});

const loadReference = async () => {
  imageRefs.value = await window.electronAPI.mulmoHandler("mulmoReferenceImagesFiles", props.projectId);
  Object.keys(imageRefs.value).map((key) => {
    imageRefs.value[key] = bufferToUrl(imageRefs.value[key], "image/png");
  });
};
loadReference();

const reference = async () => {
  await window.electronAPI.mulmoHandler("mulmoReferenceImages", props.projectId);
  await loadReference;
};
</script>
