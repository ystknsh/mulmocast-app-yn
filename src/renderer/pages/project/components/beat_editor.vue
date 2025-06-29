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
          <label class="text-sm font-medium block mb-1">
            {{ getPromptLabel(beat) }}
          </label>

          <!-- image/movie: URL or  path -->
          <template v-if="beat.image.type === 'image' || beat.image.type === 'movie'">
            <input
              v-if="beat.image?.source?.kind === 'url'"
              :value="beat.image?.source?.url"
              @input="update('image.source.url', $event.target.value)"
              class="w-full p-2 border rounded text-sm"
              type="text"
            />
            <input
              v-else-if="beat.image?.source?.kind === 'path'"
              :value="beat.image?.source?.path"
              @input="update('image.source.path', $event.target.value)"
              class="w-full p-2 border rounded text-sm"
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
            <input
              :value="beat.image?.slide?.title"
              @input="update('image.slide.title', $event.target.value)"
              class="w-full p-2 border rounded text-sm mb-2"
            />
            <textarea
              :value="beat.image?.slide?.bullets?.join('\n')"
              @input="update('image.slide.bullets', $event.target.value.split('\n'))"
              class="w-full p-2 border rounded text-sm"
              rows="4"
            />
          </template>

          <!-- markdown -->
          <template v-else-if="beat.image.type === 'markdown'">
            <textarea
              class="w-full p-2 border rounded font-mono text-sm"
              rows="6"
              :value="Array.isArray(beat.image?.markdown) ? beat.image?.markdown.join('\n') : beat.image?.markdown"
              @input="update('image.markdown', $event.target.value.split('\n'))"
            ></textarea>
          </template>

          <!-- chart -->
          <template v-else-if="beat.image.type === 'chart'">
            <textarea
              :value="JSON.stringify(beat.image?.chartData, null, 2)"
              @input="
                (() => {
                  try {
                    update('image.chartData', JSON.parse($event.target.value));
                  } catch (_) {}
                })()
              "
              class="w-full p-2 border rounded font-mono text-sm"
              rows="8"
            ></textarea>
          </template>

          <!-- mermaid -->
          <template v-else-if="beat.image.type === 'mermaid'">
            <textarea
              :value="beat?.image?.code?.text"
              @input="update('image.code.text', $event.target.value)"
              class="w-full p-2 border rounded font-mono text-sm"
              rows="6"
            ></textarea>
          </template>

          <!-- html_tailwind -->
          <template v-else-if="beat.image.type === 'html_tailwind'">
            <textarea
              :value="Array.isArray(beat.image?.html) ? beat.image?.html?.join('\n') : beat.image?.html"
              @input="update('image.html', $event.target.value.split('\n'))"
              class="w-full p-2 border rounded font-mono text-sm"
              rows="10"
            ></textarea>
          </template>
          <!-- reference -->
          <template v-else-if="beat.image.type === 'beat'">
            reference

            <input
              :value="beat.image.id"
              @input="update('image.id', $event.target.value)"
              class="w-full p-2 border rounded text-sm"
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
            <textarea
              :value="beat.htmlPrompt?.prompt"
              @input="update('htmlPrompt.prompt', $event.target.value)"
              class="w-full p-2 border rounded font-mono text-sm"
              rows="6"
            ></textarea>
          </template>
          <template v-else>
            Image Promot:
            <input
              :value="beat.imagePrompt"
              @input="update('imagePrompt', $event.target.value)"
              class="w-full p-2 border rounded text-sm"
              type="text"
            />
            Movie Promot:
            <input
              :value="beat.moviePrompt"
              @input="update('moviePrompt', $event.target.value)"
              class="w-full p-2 border rounded text-sm"
              type="text"
            />
          </template>
        </div>
        <!-- end of beat.image -->
        <template v-if="shouldShowGenerateButton">
          <Button variant="outline" size="sm" @click="generateImage()" v-if="!isGenerating">Generate image</Button>
          <div v-else class="inline-flex items-center whitespace-nowrap">
            <Loader2 class="w-4 h-4 mr-1 animate-spin" />Generating...
          </div>
        </template>
      </div>

      <!-- right: preview -->
      <div>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <template v-if="beat?.image?.type === 'beat'"> Reference<!-- Todo --> </template>
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
        <div class="flex justify-end pt-2">
          <div class="inline-flex gap-2">
            <ArrowUp v-if="index !== 0" @click="positionUp" class="cursor-pointer" />
            <ArrowDown v-if="!isEnd" @click="positionDown" class="cursor-pointer" />
            <Trash @click="trash" class="cursor-pointer" />
          </div>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileImage, Video, Loader2, ArrowUp, ArrowDown, Trash } from "lucide-vue-next";
import type { MulmoBeat } from "mulmocast";

import { useStore } from "../../../store";
import { useRoute } from "vue-router";

interface Props {
  beat: MulmoBeat;
  index: number;
  imageFile: ArrayBuffer | null;
  isEnd: boolean;
  mulmoError: unknown;
}

const props = defineProps<Props>();
const emit = defineEmits(["update", "generateImage", "positionUp", "deleteBeat"]);

const route = useRoute();
const store = useStore();
const projectId = computed(() => route.params.id as string);

const shouldShowGenerateButton = computed(() => {
  return (
    props.beat?.image?.type !== "beat" &&
    !(["image", "movie"].includes(props.beat?.image?.type) && props.beat.image.source.kind === "path")
  );
});

const isGenerating = computed(() => {
  return store.sessionState?.[projectId.value]?.["beat"]["image"]?.[props.index];
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
  emit("generateImage", props.index);
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
</script>
