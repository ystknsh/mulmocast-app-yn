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
        <div v-if="beat.image">
          <label class="text-sm font-medium block mb-1">
            {{ getPromptLabel(beat) }}
          </label>

          <!-- image/movie: URL or  path -->
          <template v-if="beat.image.type === 'image' || beat.image.type === 'movie'">
            <input
              v-if="beat.image.source.kind === 'url'"
              :value="beat.image.source.url"
              @input="update(index, 'image.source.url', $event.target.value)"
              class="w-full p-2 border rounded text-sm"
              type="text"
            />
            <input
              v-else-if="beat.image.source.kind === 'path'"
              :value="beat.image.source.path"
              @input="update(index, 'image.source.path', $event.target.value)"
              class="w-full p-2 border rounded text-sm"
              type="text"
            />
            <div
              v-if="beat.image.source.kind === 'path'"
              @dragover.prevent
              @drop.prevent="(e) => handleDrop(e, index, beat.image.type)"
              draggable="true"
              class="bg-white border border-gray-300 text-gray-600 p-6 rounded-md text-center shadow-sm cursor-pointer"
            >
              Drop file here
            </div>
          </template>

          <!-- textSlide: title & bullets -->
          <template v-else-if="beat.image.type === 'textSlide'">
            <input
              :value="beat.image.slide.title"
              @input="update(index, 'image.slide.title', $event.target.value)"
              class="w-full p-2 border rounded text-sm mb-2"
            />
            <textarea
              :value="beat.image.slide.bullets.join('\n')"
              @input="update(index, 'image.slide.bullets', $event.target.value.split('\n'))"
              class="w-full p-2 border rounded text-sm"
              rows="4"
            />
          </template>

          <!-- markdown -->
          <template v-else-if="beat.image.type === 'markdown'">
            <textarea
              class="w-full p-2 border rounded font-mono text-sm"
              rows="6"
              :value="Array.isArray(beat.image.markdown) ? beat.image.markdown.join('\n') : beat.image.markdown"
              @input="update(index, 'image.markdown', $event.target.value.split('\n'))"
            ></textarea>
          </template>

          <!-- chart -->
          <template v-else-if="beat.image.type === 'chart'">
            <textarea
              :value="JSON.stringify(beat.image.chartData, null, 2)"
              @input="
                (() => {
                  try {
                    update(index, 'image.chartData', JSON.parse($event.target.value));
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
              :value="beat.image.code.text"
              @input="update(index, 'image.code.text', $event.target.value)"
              class="w-full p-2 border rounded font-mono text-sm"
              rows="6"
            ></textarea>
          </template>

          <!-- html_tailwind -->
          <template v-else-if="beat.image.type === 'html_tailwind'">
            <textarea
              :value="Array.isArray(beat.image.html) ? beat.image.html.join('\n') : beat.image.html"
              @input="update(index, 'image.html', $event.target.value.split('\n'))"
              class="w-full p-2 border rounded font-mono text-sm"
              rows="10"
            ></textarea>
          </template>
          <!-- reference -->
          <template v-else-if="beat.image.type === 'beat'">
            reference

            <input
              :value="beat.image.id"
              @input="update(index, 'image.id', $event.target.value)"
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
              :value="beat.htmlPrompt.prompt"
              @input="update(index, 'htmlPrompt.prompt', $event.target.value)"
              class="w-full p-2 border rounded font-mono text-sm"
              rows="6"
            ></textarea>
          </template>
          <template v-else>
            Image Promot:
            <input
              :value="beat.imagePrompt"
              @input="update(index, 'imagePrompt', $event.target.value)"
              class="w-full p-2 border rounded text-sm"
              type="text"
            />
            Movie Promot:
            <input
              :value="beat.moviePrompt"
              @input="update(index, 'moviePrompt', $event.target.value)"
              class="w-full p-2 border rounded text-sm"
              type="text"
            />
          </template>
        </div>
        <!-- end of beat.image -->
        <template
          v-if="
            beat?.image?.type !== 'beat' &&
            !(['image', 'movie'].includes(beat?.image?.type) && beat.image.source.kind === 'path')
          "
        >
          <Button
            variant="outline"
            size="sm"
            @click="generateImage(index)"
            v-if="!store.sessionState?.[projectId]?.['beat']['image']?.[index]"
            >Generate image</Button
          >
          <div v-else class="inline-flex items-center whitespace-nowrap">
            <Loader2 class="w-4 h-4 mr-1 animate-spin" />Generating...
          </div>
        </template>
      </div>

      <!-- right: preview -->
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <template v-if="beat?.image?.type === 'beat'"> Reference<!-- Todo --> </template>
        <template v-else-if="imageFiles[index]">
          <template v-if="beat?.image?.type === 'movie'">
            <video :size="64" class="mx-auto text-gray-400 mb-4" controls :src="imageFiles[index]" />
          </template>
          <template v-else>
            <img :src="imageFiles[index]" />
          </template>
        </template>
        <template v-else>
          <component :is="getMediaIcon(beat?.image?.type)" :size="32" class="mx-auto text-gray-400 mb-2" />
          <p class="text-sm text-gray-500">{{ beat.image.type }} Preview</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileImage, Video, Loader2 } from "lucide-vue-next";

import { useStore } from "../../../store";
import { useRoute } from "vue-router";

interface Props {
  beat: MulmoBeat;
  index: number;
  imageFiles: (ArrayBuffer | null)[];
}

const props = defineProps<Props>();
const emit = defineEmits(["update", "generateImage"]);

const route = useRoute();
const store = useStore();
const projectId = computed(() => route.params.id as string);

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

const handleDrop = (event, index, imageType) => {
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
        index,
        [...uint8Array],
        extention,
      );
      update(index, "image.source.path", "./" + path);
      generateImage(index);
    };
    reader.readAsArrayBuffer(file);
  }
};

const generateImage = (index: number) => {
  emit("generateImage", index);
};

const update = (index: number, path: string, value: unknown) => {
  emit("update", index, path, value);
};
</script>
