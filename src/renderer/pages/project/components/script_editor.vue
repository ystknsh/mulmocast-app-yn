<template>
  <Tabs default-value="plain" class="w-full">
    <TabsList class="grid w-full grid-cols-5">
      <TabsTrigger value="plain">Plain Text</TabsTrigger>
      <TabsTrigger value="yaml">YAML</TabsTrigger>
      <TabsTrigger value="json">JSON</TabsTrigger>
      <TabsTrigger value="media">Media</TabsTrigger>
      <TabsTrigger value="params">Parameters</TabsTrigger>
    </TabsList>

    <TabsContent value="plain" class="mt-4">
      <div class="border rounded-lg p-4 bg-gray-50 min-h-[400px]">
        <p class="text-sm text-gray-500 mb-2">Plain Text Mode - Speaker and dialogue editing only</p>
        <div class="font-mono text-sm space-y-2">
          <div>
            Dr. Sarah Johnson: Welcome to AI Fundamentals. Today we'll explore the fascinating world of artificial
            intelligence.
          </div>
          <div>Mike Chen: Thanks for having me, Sarah. Let's start with what AI actually means.</div>
          <div>
            Dr. Sarah Johnson: The history of AI dates back to the 1950s with Alan Turing's groundbreaking work.
          </div>
          <div>Mike Chen: There are three main types of AI: narrow AI, general AI, and superintelligence.</div>
          <div>Dr. Sarah Johnson: Today, AI is everywhere - from smartphones to self-driving cars.</div>
          <div>Mike Chen: Machine learning is a subset of AI that learns from data without explicit programming.</div>
          <div>Dr. Sarah Johnson: The future of AI holds incredible potential for solving global challenges.</div>
          <div>Mike Chen: Understanding AI is crucial for everyone in our increasingly digital world.</div>
        </div>
      </div>
    </TabsContent>

    <TabsContent value="yaml" class="mt-4">
      <div class="border rounded-lg p-4 bg-gray-50 min-h-[400px]">
        <p class="text-sm text-gray-500 mb-2">YAML Mode - Complete MulmoScript editing</p>
        <pre class="text-sm font-mono">{{ yamlContent }}</pre>
      </div>
    </TabsContent>

    <TabsContent value="json" class="mt-4">
      <div class="border rounded-lg p-4 bg-gray-50 min-h-[400px]">
        <p class="text-sm text-gray-500 mb-2">JSON Mode - Complete MulmoScript editing</p>
        <pre class="text-sm font-mono">{{ JSON.stringify(mulmoSample, null, 2) }}</pre>
      </div>
    </TabsContent>

    <TabsContent value="media" class="mt-4">
      <div class="border rounded-lg p-4 bg-gray-50 min-h-[400px] max-h-[600px] overflow-y-auto">
        <p class="text-sm text-gray-500 mb-2">Media Mode - Beat-by-beat media editing and preview</p>
        <div class="space-y-4">
          <Card v-for="(beat, index) in mediaBeats" :key="beat.id" class="p-4">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium">Beat: {{ beat.id }}</h4>
              <Badge variant="outline">{{ beat.mediaType }}</Badge>
            </div>
            <p class="text-sm text-gray-600 mb-2">{{ beat.speaker }}: {{ beat.text }}</p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium">
                  {{ beat.mediaType === "image" ? "Image" : beat.mediaType === "video" ? "Video" : "Chart" }} Prompt:
                </label>
                <component
                  :is="beat.mediaType === 'image' ? 'input' : 'textarea'"
                  class="w-full mt-1 p-2 border rounded text-sm"
                  :value="beat.prompt"
                  :rows="3"
                />
              </div>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <component :is="getMediaIcon(beat.mediaType)" :size="32" class="mx-auto text-gray-400 mb-2" />
                <p class="text-sm text-gray-500">{{ beat.mediaType }} Preview</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </TabsContent>

    <TabsContent value="params" class="mt-4">
      <div class="border rounded-lg p-4 bg-gray-50 min-h-[400px]">
        <p class="text-sm text-gray-500 mb-2">Parameters Mode - Image, Speech, and Audio parameter editing</p>
        <div class="grid grid-cols-3 gap-4">
          <Card class="p-4">
            <h4 class="font-medium mb-2">Image Parameters</h4>
            <div class="space-y-2 text-sm">
              <div>Style: Realistic</div>
              <div>Aspect Ratio: 16:9</div>
              <div>Quality: High</div>
            </div>
          </Card>
          <Card class="p-4">
            <h4 class="font-medium mb-2">Speech Parameters</h4>
            <div class="space-y-2 text-sm">
              <div>Speed: 1.0x</div>
              <div>Pitch: Normal</div>
              <div>Voice: Natural</div>
            </div>
          </Card>
          <Card class="p-4">
            <h4 class="font-medium mb-2">Audio Parameters</h4>
            <div class="space-y-2 text-sm">
              <div>Background Music: Soft</div>
              <div>Volume: 0.3</div>
              <div>Fade: Enabled</div>
            </div>
          </Card>
        </div>
      </div>
    </TabsContent>
  </Tabs>
</template>

<script setup lang="ts">
import { FileImage, Video } from "lucide-vue-next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import YAML from 'yaml'
import { mulmoSample } from "./sample";

interface Props {
  mockProject: {
    mulmoScript: string;
  };
}

defineProps<Props>();

const yamlContent = YAML.stringify(mulmoSample);

const mediaBeats = mulmoSample.beats;

const getMediaIcon = (type: string) => {
  switch (type) {
    case "video":
      return Video;
    default:
      return FileImage;
  }
};
</script>
