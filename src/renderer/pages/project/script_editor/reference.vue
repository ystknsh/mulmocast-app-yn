<template>
  <ReferenceSelector class="mt-4" @addReferenceImage="addReferenceImage" :referenceKeys="Object.keys(images) ?? []" />

  <div v-for="(imageKey, key) in Object.keys(images).sort()" :key="`${imageKey}_${key}`" class="relative">
    <Card class="mt-8 gap-2 space-y-1 p-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          {{ t("ui.common.key") }} : {{ imageKey }}
          <template v-if="images[imageKey].type === 'imagePrompt'">
            <Label class="mb-1 block">{{ t("beat.imagePrompt.label") }} : </Label>

            <Textarea
              :placeholder="t('beat.imagePrompt.placeholder')"
              :model-value="images[imageKey].prompt"
              @update:model-value="(value) => update('imagePrompt', imageKey, String(value))"
              class="mb-2 h-20 overflow-y-auto"
              :disabled="isGeneratings[imageKey]"
            />
          </template>
          <template v-if="images[imageKey].type === 'image' && images[imageKey].source.kind === 'path'">
            <Label class="mb-1 block">{{ t("ui.common.image") }}</Label>

            <div
              @dragover.prevent
              @drop.prevent="(e) => handleDrop(e, imageKey)"
              draggable="true"
              class="mt-4 cursor-pointer rounded-md border-2 border-dashed border-gray-300 bg-white p-6 text-center text-gray-600 shadow-sm"
            >
              {{ t("common.drophere") }}
            </div>
            {{ t("common.or") }}
            <div class="flex">
              <Input :placeholder="t('beat.image.placeholder')" v-model="mediaUrl" :invalid="!validateURL" /><Button
                @click="() => submitUrlImage(imageKey)"
                :disabled="!fetchEnable"
                class="ml-2"
              >
                {{ t("common.fetch") }}
              </Button>
            </div>
          </template>
          <div
            v-if="images[imageKey].type === 'image' && images[imageKey].source.kind === 'url'"
            class="break-words whitespace-pre-wrap"
          >
            {{ images[imageKey].source.url }}
          </div>
        </div>
        <div>
          <div class="relative rounded-lg border-2 border-dashed border-gray-300 p-4 text-center">
            <Button
              v-if="images[imageKey].type === 'imagePrompt'"
              variant="ghost"
              size="icon"
              class="absolute -top-3 -left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white shadow transition-colors hover:bg-gray-100"
              @click="() => submitImage(imageKey, key)"
              :disabled="isGeneratings[imageKey]"
            >
              <Loader2 v-if="isGeneratings[imageKey]" class="h-4 w-4 animate-spin" />
              <Sparkles v-else class="h-4 w-4" />
            </Button>
            <div v-if="imageRefs[imageKey]" class="flex items-center justify-center">
              <img :src="imageRefs[imageKey]" class="max-h-64" @click="openImage(imageKey)" />
            </div>
            <template v-else>
              <FileImage :size="32" class="mx-auto mb-2 text-gray-400" />
              <p class="text-sm text-gray-500">
                {{ t("beat.imagePreview") }}
              </p>
            </template>
          </div>
        </div>
      </div>
    </Card>
    <div
      class="absolute -top-5 right-0 z-10 flex items-center gap-3 rounded border border-gray-300 bg-white px-2 py-1 shadow-sm"
    >
      <Trash
        class="h-5 w-5 cursor-pointer text-gray-500 transition hover:text-red-500"
        @click="deleteReference(imageKey)"
      />
    </div>
    <MediaModal v-model:open="modalOpen" type="image" :src="modalSrc" />
  </div>
</template>

<script setup lang="ts">
import { Trash, Sparkles, FileImage, Loader2 } from "lucide-vue-next";
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

import type { MulmoImageMedia, MulmoImagePromptMedia, MulmoImageParamsImages } from "mulmocast";
import { z } from "zod";

import MediaModal from "@/components/media_modal.vue";
import { Card } from "@/components/ui/card";
import { Button, Label, Textarea, Input } from "@/components/ui";
import { bufferToUrl } from "@/lib/utils";

import ReferenceSelector from "./reference_selector.vue";

import { getConcurrentTaskStatusMessageComponent } from "../concurrent_task_status_message";
import { notifyProgress } from "@/lib/notification";

interface Props {
  projectId: string;
  images: MulmoImageParamsImages;
}

const { t } = useI18n();

const props = defineProps<Props>();
const emit = defineEmits(["updateImage", "updateImagePath", "addReferenceImage", "deleteReferenceImage"]);

const imageRefs = ref<Record<string, string>>({});

const loadReference = async () => {
  imageRefs.value = await window.electronAPI.mulmoHandler("mulmoReferenceImagesFiles", props.projectId);
  Object.keys(imageRefs.value).forEach((key) => {
    imageRefs.value[key] = bufferToUrl(imageRefs.value[key], "image/png");
  });
};
loadReference();

// modal
const modalOpen = ref(false);
const modalSrc = ref("");
const openImage = (imageKey: string) => {
  modalOpen.value = true;
  modalSrc.value = imageRefs.value[imageKey];
};

/*
const reference = async () => {
  await window.electronAPI.mulmoHandler("mulmoReferenceImages", props.projectId);
  await loadReference();
};
*/

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
      emit("saveMulmo");
      emit("formatAndPushHistoryMulmoScript");
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
const deleteReference = (key: string) => {
  emit("deleteReferenceImage", key);
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
    })();
    if (!imageType) {
      console.warn(`Unsupported file type: ${fileType}`);
      // TODO: Consider showing a toast notification or alert
      return;
    }
    const extension = fileType === "jpeg" ? "jpg" : fileType;

    const reader = new FileReader();
    reader.onload = async () => {
      const uint8Array = new Uint8Array(reader.result as ArrayBuffer);
      const path = await window.electronAPI.mulmoHandler(
        "mulmoReferenceImageUpload",
        props.projectId,
        imageKey,
        [...uint8Array],
        extension,
      );
      emit("updateImagePath", imageKey, "./" + path);
      const res = await window.electronAPI.mulmoHandler("mulmoReferenceImagesFile", props.projectId, imageKey);
      imageRefs.value[imageKey] = res ? bufferToUrl(res, "image/png") : null;
    };
    reader.readAsArrayBuffer(file);
  }
};

const ConcurrentTaskStatusMessageComponent = getConcurrentTaskStatusMessageComponent(props.projectId ?? "");

const isGeneratings = ref({});

const submitImage = async (imageKey: string, key: number) => {
  if (isGeneratings.value[imageKey]) {
    return;
  }

  isGeneratings.value[imageKey] = true;
  try {
    imageFetching.value = true;
    await notifyProgress(
      window.electronAPI.mulmoHandler("mulmoReferenceImage", props.projectId, key, imageKey, {
        type: "imagePrompt",
        prompt: props.images[imageKey].prompt,
      }),
      {
        loadingMessage: ConcurrentTaskStatusMessageComponent,
        successMessage: t("notify.image.successMessage"),
        errorMessage: t("notify.image.errorMessage"),
      },
    );

    const res = await window.electronAPI.mulmoHandler("mulmoReferenceImagesFile", props.projectId, imageKey);
    imageRefs.value[imageKey] = res ? bufferToUrl(res, "image/png") : null;
  } catch (error) {
    console.log(error);
  }
  isGeneratings.value[imageKey] = false;
};
</script>
