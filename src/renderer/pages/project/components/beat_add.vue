<template>
  <div class="template-dropdown-container flex items-center gap-4">
    <select
      v-model="selectedBeat"
      class="template-dropdown border-2 border-gray-300 rounded-full px-4 py-2 text-sm text-gray-700 hover:border-gray-500 hover:bg-gray-50 transition-all duration-200"
    >
      <option v-for="(template, k) in templates" :key="k" :value="k">
        {{ template.name }}
      </option>
    </select>
    <Button size="sm" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full" @click="addBeat">
      Add
    </Button>
  </div>
</template>
<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { ref } from "vue";

const emit = defineEmits(["addBeat"]);

const selectedBeat = ref(0);

const templates = ref([
  {
    name: "Html prompt",
    beat: {
      text: "",
      htmlPrompt: {
        prompt: "",
      },
    },
  },
  {
    name: "Image prompt",
    beat: {
      text: "",
      imagePrompt: "",
      moviePrompt: "",
    },
  },
  {
    name: "remote image",
    beat: {
      text: "",
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
    name: "local image",
    beat: {
      text: "",
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
    name: "local movie",
    beat: {
      text: "",
      image: {
        type: "movie",
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
      image: {
        type: "html_tailwind",
        html: [],
      },
    },
  },
]);

const addBeat = () => {
  emit("addBeat", templates.value[selectedBeat.value].beat);
};
</script>
