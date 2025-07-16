<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <h4 class="font-medium">Beat: {{ index + 1 }}</h4>
      <Badge variant="outline">{{ getBadge(beat) }}</Badge>
    </div>

    <p class="text-sm text-gray-600 mb-2">{{ beat.speaker }}: {{ beat.text }}</p>

    <div class="grid grid-cols-2 gap-4">
      <!-- left: Edit area -->
      <div>
        <div v-if="beat.image && beat.image.type">
          <Label class="block mb-1">
            {{ getPromptLabel(beat) }}
          </Label>

          <!-- image/movie: URL or  path -->
          <template v-if="beat.image.type === 'image' || beat.image.type === 'movie'">
            <Input
              v-if="beat.image?.source?.kind === 'url'"
              :model-value="beat.image?.source?.url"
              @update:model-value="(value) => update('image.source.url', String(value))"
              type="text"
            />
            <Input
              v-else-if="beat.image?.source?.kind === 'path'"
              :model-value="beat.image?.source?.path"
              @update:model-value="(value) => update('image.source.path', String(value))"
              type="text"
            />
            <div
              v-if="beat.image?.source?.kind === 'path'"
              @dragover.prevent
              @drop.prevent="(e) => handleDrop(e, beat.image.type)"
              draggable="true"
              class="bg-white border-2 border-dashed border-gray-300 text-gray-600 p-6 rounded-md text-center shadow-sm cursor-pointer mt-4"
            >
              Drop file here
            </div>
          </template>

          <!-- textSlide: title & bullets -->
          <template v-else-if="beat.image.type === 'textSlide'">
            <Input
              :model-value="beat.image?.slide?.title"
              @update:model-value="(value) => update('image.slide.title', String(value))"
              class="mb-2"
            />
            <Textarea
              :model-value="beat.image?.slide?.bullets?.join('\n')"
              @update:model-value="(value) => update('image.slide.bullets', String(value).split('\n'))"
              rows="4"
            />
          </template>

          <!-- markdown -->
          <template v-else-if="beat.image.type === 'markdown'">
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
            <Textarea
              :model-value="beat?.image?.code?.text"
              @update:model-value="(value) => update('image.code.text', String(value))"
              class="font-mono"
              rows="6"
            />
          </template>

          <!-- html_tailwind -->
          <template v-else-if="beat.image.type === 'html_tailwind'">
            <Textarea
              :model-value="Array.isArray(beat.image?.html) ? beat.image?.html?.join('\n') : beat.image?.html"
              @update:model-value="(value) => update('image.html', String(value).split('\n'))"
              class="font-mono"
              rows="10"
            />
          </template>
          <!-- reference -->
          <template v-else-if="beat.image.type === 'beat'">
            reference

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
            <Textarea
              :model-value="beat.htmlPrompt?.prompt"
              @update:model-value="(value) => update('htmlPrompt.prompt', String(value))"
              class="font-mono"
              rows="6"
            />
          </template>
          <template v-else>
            <Label>Image Prompt:</Label>
            <Input
              :model-value="beat.imagePrompt"
              @update:model-value="(value) => update('imagePrompt', String(value))"
              type="text"
              class="mb-2"
            />
            <Label>Movie Prompt:</Label>
            <Input
              :model-value="beat.moviePrompt"
              @update:model-value="(value) => update('moviePrompt', String(value))"
              type="text"
            />
          </template>
        </div>
        <!-- end of beat.image -->
        <template v-if="shouldShowGenerateButton">
          <template v-if="!isGenerating">
            <template v-if="shouldBeGeneratedWithPrompt">
              <Button variant="outline" size="sm" @click="generateImageOnlyImage()" class="mt-4">Generate image</Button>
              <Button variant="outline" size="sm" @click="generateImageOnlyMovie()" class="mt-4">Generate movie</Button>
              <Button variant="outline" size="sm" @click="generateImage()" class="mt-4">Generate all</Button>
            </template>
            <Button variant="outline" size="sm" @click="generateImage()" class="mt-4" v-else>Generate image</Button>
          </template>
          <div v-else class="inline-flex items-center whitespace-nowrap">
            <Loader2 class="w-4 h-4 mr-1 animate-spin" />Generating...
          </div>
        </template>
      </div>

      <!-- right: preview -->
      <div>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <template v-if="beat?.image?.type === 'beat'"> Reference<!-- Todo --> </template>
          <template v-if="isGenerating">
            <!-- TODO update design -->
            <Loader2 class="w-4 h-4 mr-1 animate-spin" />Generating...
          </template>
          <template v-else-if="imageFile">
            <template v-if="beat?.image?.type === 'movie'">
              <video :size="64" class="mx-auto text-gray-400 mb-4" controls :src="imageFile" />
            </template>
            <template v-else>
              <img :src="imageFile" />
            </template>
          </template>
          <template v-else>
            <component :is="getMediaIcon(beat?.image?.type)" :size="32" class="mx-auto text-gray-400 mb-2" />
            <p class="text-sm text-gray-500">{{ beat?.image?.type }} Preview</p>
          </template>
        </div>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mt-2" v-if="movieFile">
          <video :size="64" class="mx-auto text-gray-400 mb-4" controls :src="movieFile" />
        </div>
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
    <div class="flex justify-between mt-2 py-1 rounded border border-gray-300">
      <div class="px-2 py-1">
        <BeatAdd @addBeat="addBeat" />
      </div>
      <div class="flex items-center gap-1 px-2 py-1 pr-3">
        <ArrowUp
          v-if="index !== 0"
          @click="positionUp"
          class="w-5 h-5 text-gray-500 hover:text-blue-500 cursor-pointer transition"
        />
        <ArrowDown
          v-if="!isEnd"
          @click="positionDown"
          class="w-5 h-5 text-gray-500 hover:text-blue-500 cursor-pointer transition"
        />
        <Trash @click="trash" class="w-5 h-5 text-gray-500 hover:text-red-500 cursor-pointer transition" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileImage, Video, Loader2, ArrowUp, ArrowDown, Trash } from "lucide-vue-next";
import type { MulmoBeat } from "mulmocast/browser";

import { useMulmoEventStore } from "../../../../store";
import { useRoute } from "vue-router";
import BeatAdd from "./beat_add.vue";

interface Props {
  beat: MulmoBeat;
  index: number;
  imageFile: ArrayBuffer | null;
  movieFile: ArrayBuffer | null;
  isEnd: boolean;
  mulmoError: string[];
}

const props = defineProps<Props>();
const emit = defineEmits(["update", "generateImage", "positionUp", "deleteBeat", "addBeat"]);

const route = useRoute();
const mulmoEventStore = useMulmoEventStore();
const projectId = computed(() => route.params.id as string);

const shouldBeGeneratedWithPrompt = computed(() => {
  return !props.beat.htmlPrompt && !props.beat.image;
});

const shouldShowGenerateButton = computed(() => {
  return (
    props.beat?.image?.type !== "beat" &&
    !(["image", "movie"].includes(props.beat?.image?.type) && props.beat.image.source.kind === "path")
  );
});

const isGenerating = computed(() => {
  return mulmoEventStore.sessionState?.[projectId.value]?.["beat"]["image"]?.[props.index];
});
const getPromptLabel = (beat: MulmoBeat) => {
  if (beat.image.type) {
    switch (beat.image.type) {
      case "image":
        return "Image Prompt (URL or path)";
      case "movie":
        return "Movie Source";
      case "textSlide":
        return "Slide Content";
      case "markdown":
        return "Markdown Text";
      case "chart":
        return "Chart JSON";
      case "mermaid":
        return "Mermaid Diagram";
      case "html_tailwind":
        return "HTML (Tailwind)";
      default:
        return "Prompt";
    }
  }
  if (beat.htmlPrompt) {
    return "Html Prompt";
  }
  return "Image Prompt";
};

const getBadge = (beat: MulmoBeat) => {
  if (beat?.image) {
    return beat?.image?.type;
  }
  if (beat.htmlPrompt) {
    return "Html Prompt";
  }
  return "Image Prompt";
};

const getMediaIcon = (type: string) => {
  switch (type) {
    case "video":
      return Video;
    default:
      return FileImage;
  }
};

const handleDrop = (event: DragEvent, imageType: string) => {
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    // console.log("File dropped:", file.name);
    const fileType = (file.type ?? "").split("/")[1] ?? "";

    if (!(imageType === "image" ? ["jpg", "jpeg", "png"] : ["mov", "mp4", "mpg"]).includes(fileType)) {
      return;
    }
    const extention = fileType === "jpeg" ? "jpg" : fileType;

    const reader = new FileReader();
    reader.onload = async () => {
      const uint8Array = new Uint8Array(reader.result);
      const path = await window.electronAPI.mulmoHandler(
        "mulmoImageUpload",
        projectId.value,
        props.index,
        [...uint8Array],
        extention,
      );
      update("image.source.path", "./" + path);
      generateImage();
    };
    reader.readAsArrayBuffer(file);
  }
};

const generateImage = () => {
  emit("generateImage", props.index, "all");
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

const positionUp = () => {
  emit("positionUp", props.index);
};
const positionDown = () => {
  emit("positionUp", props.index + 1);
};
const trash = () => {
  emit("deleteBeat", props.index);
};

const addBeat = (beat: MulmoBeat) => {
  emit("addBeat", beat, props.index);
};
</script>
