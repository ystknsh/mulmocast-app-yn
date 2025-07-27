<template>
  <Button @click="reference">{{ t("project.scriptEditor.reference.generateReference") }}</Button>

  <ReferenceSelector class="mt-4" @addReferenceImage="addReferenceImage" />

  <div v-for="(imageKey, key) in Object.keys(images).sort()" :key="`${imageKey}_${key}`">
    <div class="grid grid-cols-2 gap-4">
      <div>
        {{ t("project.scriptEditor.reference.key") }} : {{ imageKey }}
        <template v-if="images[imageKey].type === 'imagePrompt'">
          <Label class="block mb-1">{{ t("project.scriptEditor.reference.imagePrompt") }} : </Label>

          <Textarea
            :placeholder="t('beat.form.imagePrompt.contents')"
            :model-value="images[imageKey].prompt"
            @update:model-value="(value) => update('imagePrompt', imageKey, String(value))"
            class="mb-2 h-20 overflow-y-auto"
          />
        </template>
        <template v-if="images[imageKey].type === 'image' && images[imageKey].source.kind === 'path'">
          <Label class="block mb-1">{{ t("project.scriptEditor.reference.image") }}</Label>

          <div
            @dragover.prevent
            @drop.prevent="(e) => handleDrop(e, imageKey)"
            draggable="true"
            class="bg-white border-2 border-dashed border-gray-300 text-gray-600 p-6 rounded-md text-center shadow-sm cursor-pointer mt-4"
          >
            {{ t("common.drophere") }}
          </div>
          {{ t("common.or") }}
          <div class="flex">
            <Input :placeholder="t('beat.form.image.url')" v-model="mediaUrl" :invalid="!validateURL" /><Button
              @click="() => submitUrlImage(imageKey)"
              :disabled="!fetchEnable"
            >
              {{ t("common.fetch") }}
            </Button>
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
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

import type { MulmoImageMedia, MulmoImagePromptMedia, MulmoImageParamsImages } from "mulmocast";
import { z } from "zod";

import { Button, Label, Textarea, Input } from "@/components/ui";
import { bufferToUrl } from "@/lib/utils";

import ReferenceSelector from "./reference_selector.vue";

interface Props {
  projectId: string;
  images: MulmoImageParamsImages;
}

const { t } = useI18n();

const props = defineProps<Props>();
const emit = defineEmits(["updateImage", "updateImagePath", "addReferenceImage"]);

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

const update = (target: string, imageKey: string, prompt: string) => {
  emit("updateImage", imageKey, prompt);
};

const mediaUrl = ref("");
// image fetch
const imageFetching = ref(false);
const validateURL = computed(() => {
  const urlSchema = z.string().url();
  return mediaUrl.value === "" || urlSchema.safeParse(mediaUrl.value).success;
});
const fetchEnable = computed(() => {
  return mediaUrl.value !== "" && validateURL.value && !imageFetching.value;
});
const submitUrlImage = async (imageKey: string) => {
  try {
    imageFetching.value = true;
    const res = (await window.electronAPI.mulmoHandler(
      "mulmoReferenceImageFetchURL",
      props.projectId,
      imageKey,
      mediaUrl.value,
    )) as { result: boolean; imageType: string; path: string };
    if (res.result) {
      emit("updateImagePath", imageKey, "./" + res.path);
      mediaUrl.value = "";
      loadReference();
    }
  } catch (error) {
    console.log(error);
  }
  imageFetching.value = false;
};

const addReferenceImage = (key: string, data: MulmoImageMedia | MulmoImagePromptMedia) => {
  emit("addReferenceImage", key, data);
};

const handleDrop = (event: DragEvent, imageKey: string) => {
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    // console.log("File dropped:", file.name);
    const fileExtension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const mimeType = file.type.split("/")[1] ?? "";
    const fileType = mimeType || fileExtension;

    const imageType = (() => {
      if (["jpg", "jpeg", "png"].includes(fileType)) {
        return "image";
      }
      return;
    })();
    if (!imageType) {
      console.warn(`Unsupported file type: ${fileType}`);
      // TODO: Consider showing a toast notification or alert
      return;
    }
    const extention = fileType === "jpeg" ? "jpg" : fileType;

    const reader = new FileReader();
    reader.onload = async () => {
      const uint8Array = new Uint8Array(reader.result as ArrayBuffer);
      const path = await window.electronAPI.mulmoHandler(
        "mulmoReferenceImageUpload",
        props.projectId,
        imageKey,
        [...uint8Array],
        extention,
      );
      emit("updateImagePath", imageKey, "./" + path);
      setTimeout(() => {
        // TODO: fix
        loadReference();
      }, 10);
    };
    reader.readAsArrayBuffer(file);
  }
};
</script>
