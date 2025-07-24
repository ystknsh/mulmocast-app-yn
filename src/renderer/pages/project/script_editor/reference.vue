<template>
  <Button @click="reference">Reference</Button>

  <div v-for="(imageKey, key) in Object.keys(images).sort()" :key="`${imageKey}_${key}`">
    <div class="grid grid-cols-2 gap-4">
      <div>
        Key: {{ imageKey }}
        <template v-if="images[imageKey].type === 'imagePrompt'">
          <Label class="block mb-1"> Image Prompt: </Label>

          <Textarea
            :placeholder="t('beat.form.imagePrompt.contents')"
            :model-value="images[imageKey].prompt"
            @update:model-value="(value) => update('imagePrompt', String(value))"
            class="mb-2 h-20 overflow-y-auto"
          />
        </template>
        <template v-if="images[imageKey].type === 'image' && images[imageKey].source.kind === 'path'">
          <Label class="block mb-1"> Image</Label>

          <div
            @dragover.prevent
            @drop.prevent="(e) => handleDrop(e)"
            draggable="true"
            class="bg-white border-2 border-dashed border-gray-300 text-gray-600 p-6 rounded-md text-center shadow-sm cursor-pointer mt-4"
          >
            Drop file here
          </div>
          or
          <div class="flex">
            <Input :placeholder="t('beat.form.image.url')" v-model="mediaUrl" :invalid="!validateURL" /><Button
              @click="submitUrlImage"
              :disabled="!fetchEnable"
              >Fetch</Button
            >
          </div>

          {{ images[imageKey].source.kind }}
        </template>
      </div>
      <div>
        <img :src="imageRefs[imageKey]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { useI18n } from "vue-i18n";

import { Button, Label, Textarea, Input } from "@/components/ui";

import { bufferToUrl } from "@/lib/utils";
import { type MulmoImageParamsImages } from "mulmocast";

interface Props {
  projectId: string;
  images: MulmoImageParamsImages;
}

const { t } = useI18n();

const props = defineProps<Props>();

const imageRefs = ref<Record<string, string>>({});

const loadReference = async () => {
  imageRefs.value = await window.electronAPI.mulmoHandler("mulmoReferenceImagesFiles", props.projectId);
  Object.keys(imageRefs.value).forEach((key) => {
    imageRefs.value[key] = bufferToUrl(imageRefs.value[key], "image/png");
  });
};
loadReference();

const reference = async () => {
  await window.electronAPI.mulmoHandler("mulmoReferenceImages", props.projectId);
  await loadReference();
};

const update = () => {};
</script>
