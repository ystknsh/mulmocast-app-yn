<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <h4 class="font-medium">Beat: {{ index + 1 }}</h4>
      <Badge variant="outline">{{ $t("beat.badge." + getBadge(beat)) }}</Badge>
    </div>

    <p class="text-sm text-gray-600 mb-2">{{ beat.speaker }}: {{ beat.text }}</p>

    <div class="grid grid-cols-2 gap-4">
      <!-- left: Edit area -->
      <div>
        <div v-if="beat.image && beat.image.type">
          <!-- image/movie: URL or  path -->
          <template v-if="isMediaBeat(beat) && isLocalSourceMediaBeat(beat)">
            <Label class="block mb-1"> Image or Movie </Label>
            <div
              v-if="isLocalSourceMediaBeat(beat)"
              @dragover.prevent
              @drop.prevent="(e) => handleDrop(e)"
              draggable="true"
              class="bg-white border-2 border-dashed border-gray-300 text-gray-600 p-6 rounded-md text-center shadow-sm cursor-pointer mt-4"
            >
              Drop file here
            </div>
            or
            <div class="flex">
              <Input :placeholder="t('beat.form.image.url')" v-model="mediaUrl" /><Button @click="submitUrlImage"
                >Fetch</Button
              >
            </div>
          </template>

          <!-- image/movie: URL or  path -->
          <template v-else-if="isMediaBeat(beat)">
            <Label class="block mb-1"> Remote Media: </Label>
            <div v-if="isURLSourceMediaBeat(beat)" class="break-words whitespace-pre-wrap">
              {{ beat.image.source.url }}
            </div>
          </template>

          <!-- textSlide: title & bullets -->
          <template v-else-if="beat.image.type === 'textSlide'">
            <Label class="block mb-1"> SlideContent </Label>
            <Input
              :placeholder="t('beat.form.textSlide.title')"
              :model-value="beat.image?.slide?.title"
              @update:model-value="(value) => update('image.slide.title', String(value))"
              class="mb-2"
            />
            <Textarea
              :placeholder="t('beat.form.textSlide.contents')"
              :model-value="beat.image?.slide?.bullets?.join('\n')"
              @update:model-value="(value) => update('image.slide.bullets', String(value).split('\n'))"
              rows="4"
            />
          </template>

          <!-- markdown -->
          <template v-else-if="beat.image.type === 'markdown'">
            <Label class="block mb-1"> Markdown Text </Label>
            <Textarea
              :model-value="
                Array.isArray(beat.image?.markdown) ? beat.image?.markdown.join('\n') : beat.image?.markdown
              "
              @update:model-value="(value) => update('image.markdown', String(value).split('\n'))"
              class="font-mono"
              rows="6"
            />
          </template>

          <!-- chart -->
          <template v-else-if="beat.image.type === 'chart'">
            <Label class="block mb-1"> Chart JSON </Label>
            <Textarea
              :model-value="JSON.stringify(beat.image?.chartData, null, 2)"
              @update:model-value="
                (value) => {
                  try {
                    update('image.chartData', JSON.parse(String(value)));
                  } catch (_) {}
                }
              "
              class="font-mono"
              rows="8"
            />
          </template>

          <!-- mermaid -->
          <template v-else-if="beat.image.type === 'mermaid'">
            <Label class="block mb-1"> Mermaid Diagram </Label>
            <Textarea
              :model-value="beat?.image?.code?.text"
              @update:model-value="(value) => update('image.code.text', String(value))"
              class="font-mono"
              rows="6"
            />
          </template>

          <!-- html_tailwind -->
          <template v-else-if="beat.image.type === 'html_tailwind'">
            <Label class="block mb-1"> HTML(Tailwind) </Label>
            <Textarea
              :model-value="Array.isArray(beat.image?.html) ? beat.image?.html?.join('\n') : beat.image?.html"
              @update:model-value="(value) => update('image.html', String(value).split('\n'))"
              class="font-mono"
              rows="10"
            />
          </template>
          <!-- reference -->
          <template v-else-if="beat.image.type === 'beat'">
            <Label class="block mb-1"> Reference </Label>
            <Input
              :model-value="beat.image.id"
              @update:model-value="(value) => update('image.id', String(value))"
              type="text"
            />
          </template>
          <!-- Other -->
          <template v-else>
            <div class="text-sm text-red-500">Unsupported type: {{ beat.image.type }}</div>
          </template>
        </div>
        <div v-else>
          <template v-if="beat.htmlPrompt">
            <Label class="block mb-1"> HTML Prompt: </Label>
            <Textarea
              :model-value="beat.htmlPrompt?.prompt"
              @update:model-value="(value) => update('htmlPrompt.prompt', String(value))"
              class="font-mono"
              rows="6"
            />
          </template>
          <template v-else>
            <Label class="block mb-1"> Image Prompt: </Label>
            <Input
              :model-value="beat.imagePrompt"
              @update:model-value="(value) => update('imagePrompt', String(value))"
              type="text"
              class="mb-2"
            />
            <Label class="block mb-1"> Movie Prompt: </Label>
            <Input
              :model-value="beat.moviePrompt"
              @update:model-value="(value) => update('moviePrompt', String(value))"
              type="text"
              placeholder="Blank won't work, space will."
            />
          </template>
        </div>
        <!-- end of beat.image -->
        <template v-if="shouldShowGenerateButton">
          <template v-if="!isGenerating">
            <template v-if="shouldBeGeneratedWithPrompt">
              <Button variant="outline" size="sm" @click="generateImageOnlyImage()" class="mt-4">Generate image</Button>
              <Button
                variant="outline"
                size="sm"
                @click="generateImageOnlyMovie()"
                class="mt-4"
                :disabled="!enableMovieGenerate"
                >Generate movie</Button
              >
            </template>
            <Button variant="outline" size="sm" @click="generateImageOnlyImage()" class="mt-4" v-else
              >Generate image</Button
            >
          </template>
          <div v-else class="inline-flex items-center whitespace-nowrap">
            <Loader2 class="w-4 h-4 mr-1 animate-spin" />Generating...
          </div>
        </template>
      </div>

      <!-- right: preview -->
      <div>
        <BearPreview
          :beat="beat"
          :index="index"
          :isImageGenerating="isImageGenerating"
          :isHtmlGenerating="isHtmlGenerating"
          :isMovieGenerating="isMovieGenerating"
          :enableMovieGenerate="enableMovieGenerate"
          :imageFile="imageFile"
          :movieFile="movieFile"
          @openModal="openModal"
        />
      </div>
    </div>

    <div
      v-if="mulmoError && mulmoError.length > 0"
      class="w-full p-2 border border-red-500 bg-red-100 text-red-800 rounded text-sm mt-2"
    >
      <div v-for="(error, key) in mulmoError" :key="key">
        {{ error }}
      </div>
    </div>

    <MediaModal v-model:open="modalOpen" :type="modalType" :src="modalSrc" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { Loader2 } from "lucide-vue-next";
import type { MulmoBeat } from "mulmocast/browser";
import { useI18n } from "vue-i18n";

// components
import MediaModal from "@/components/media_modal.vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BearPreview from "./beat_preview.vue";

// lib
import { useMulmoEventStore } from "../../../../store";
import { getBadge, isMediaBeat, isURLSourceMediaBeat, isLocalSourceMediaBeat } from "@/lib/beat_util.js";
import { mediaUri } from "@/lib/utils";

interface Props {
  beat: MulmoBeat;
  index: number;
  imageFile: ArrayBuffer | string | null;
  movieFile: ArrayBuffer | string | null;
  isEnd: boolean;
  mulmoError: string[];
}

const props = defineProps<Props>();
const emit = defineEmits(["update", "generateImage"]);

const route = useRoute();
const { t } = useI18n();
const mulmoEventStore = useMulmoEventStore();
const projectId = computed(() => route.params.id as string);

const modalOpen = ref(false);
const modalType = ref<"image" | "video" | "audio" | "other">("image");
const modalSrc = ref("");
const mediaUrl = ref("");

const shouldBeGeneratedWithPrompt = computed(() => {
  return !props.beat.htmlPrompt && !props.beat.image;
});

const shouldShowGenerateButton = computed(() => {
  return (
    props.beat?.image?.type !== "beat" &&
    !(
      ["image", "movie"].includes(props.beat?.image?.type || "") &&
      props.beat?.image &&
      isLocalSourceMediaBeat(props.beat)
    )
  );
});

const enableMovieGenerate = computed(() => {
  return !!props.beat.moviePrompt;
});

const isImageGenerating = computed(() => {
  return mulmoEventStore.sessionState?.[projectId.value]?.["beat"]["image"]?.[props.index] ?? false;
});
const isMovieGenerating = computed(() => {
  return mulmoEventStore.sessionState?.[projectId.value]?.["beat"]["movie"]?.[props.index] ?? false;
});
const isHtmlGenerating = computed(() => {
  return mulmoEventStore.sessionState?.[projectId.value]?.["beat"]["html"]?.[props.index] ?? false;
});
const isGenerating = computed(() => {
  return isImageGenerating.value || isMovieGenerating.value || isHtmlGenerating.value;
});

const handleDrop = (event: DragEvent) => {
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
      if (["mov", "mp4", "mpg"].includes(fileType)) {
        return "movie";
      }
      return;
    })();
    if (!imageType) {
      console.warn(`Unsupported file type: ${fileType}`);
      // TODO: Consider showing a toast notification or alert
      return;
    }
    update("image.type", imageType);
    const extention = fileType === "jpeg" ? "jpg" : fileType;

    const reader = new FileReader();
    reader.onload = async () => {
      const uint8Array = new Uint8Array(reader.result as ArrayBuffer);
      const path = await window.electronAPI.mulmoHandler(
        "mulmoImageUpload",
        projectId.value,
        props.index,
        [...uint8Array],
        extention,
      );
      update("image.source.path", "./" + path);
      generateImageOnlyImage();
    };
    reader.readAsArrayBuffer(file);
  }
};

const submitUrlImage = async () => {
  try {
    const res = (await window.electronAPI.mulmoHandler(
      "mulmoImageFetchURL",
      projectId.value,
      props.index,
      mediaUrl.value,
    )) as { result: boolean; imageType: string; path: string };
    if (res.result) {
      update("image.type", res.imageType);
      update("image.source.path", "./" + res.path);
      generateImageOnlyImage();
      mediaUrl.value = "";
    }
  } catch (error) {
    console.log(error);
  }
};

const generateImageOnlyImage = () => {
  emit("generateImage", props.index, "image");
};
const generateImageOnlyMovie = () => {
  emit("generateImage", props.index, "movie");
};

const update = (path: string, value: unknown) => {
  emit("update", props.index, path, value);
};

const openModal = (type: "image" | "video" | "audio" | "other", src: ArrayBuffer | string | null) => {
  if (!src) return;
  modalType.value = type;
  modalSrc.value = mediaUri(src);
  modalOpen.value = true;
};
</script>
