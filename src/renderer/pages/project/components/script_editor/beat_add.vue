<template>
  <div class="template-dropdown-container flex items-center gap-4">
    <Select v-model="selectedBeat">
      <SelectTrigger class="w-auto">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="(template, k) in templates" :key="k" :value="k">
          {{ template.name }}
        </SelectItem>
      </SelectContent>
    </Select>
    <Button size="sm" @click="addBeat"> Insert </Button>
  </div>
</template>
<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ref } from "vue";
import { setRandomBeatId } from "@/lib/beat_util.js";

const emit = defineEmits(["addBeat"]);

const selectedBeat = ref(0);

const templates = ref([
  {
    name: "Html prompt",
    beat: {
      speaker: "",
      text: "",
      htmlPrompt: {
        prompt: "",
      },
    },
  },
  {
    name: "Image prompt",
    beat: {
      speaker: "",
      text: "",
      imagePrompt: "",
      moviePrompt: "",
    },
  },
  {
    name: "remote image",
    beat: {
      text: "",
      speaker: "",
      image: {
        type: "image",
        source: {
          kind: "url",
          url: "",
        },
      },
    },
  },
  {
    name: "remote movie",
    beat: {
      text: "",
      speaker: "",
      image: {
        type: "movie",
        source: {
          kind: "url",
          url: "",
        },
      },
    },
  },
  {
    name: "local media file",
    beat: {
      text: "",
      speaker: "",
      image: {
        type: "image",
        source: {
          kind: "path",
          path: "",
        },
      },
    },
  },
  {
    name: "Text Slide",
    beat: {
      text: "",
      speaker: "",
      image: {
        type: "textSlide",
        slide: {
          title: "No Audio",
          bullets: ["0.5 seconds"],
        },
      },
    },
  },
  {
    name: "Markdown",
    beat: {
      text: "",
      speaker: "",
      image: {
        type: "markdown",
        markdown: [],
      },
    },
  },
  {
    name: "Chart",
    beat: {
      text: "",
      speaker: "",
      image: {
        type: "chart",
        title: "",
        chartData: {},
      },
    },
  },
  {
    name: "Mermaid",
    beat: {
      text: "",
      speaker: "",
      image: {
        type: "mermaid",
        title: "",
        code: {
          kind: "text",
          text: "",
        },
      },
    },
  },
  {
    name: "Tailwind html",
    beat: {
      text: "",
      speaker: "",
      image: {
        type: "html_tailwind",
        html: [],
      },
    },
  },
]);

const addBeat = () => {
  const beat = { ...templates.value[selectedBeat.value].beat };
  setRandomBeatId(beat);

  emit("addBeat", beat);
};
</script>
