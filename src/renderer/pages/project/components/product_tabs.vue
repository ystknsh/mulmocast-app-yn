<template>
  <Tabs default-value="movie" class="w-full">
    <TabsList class="grid w-full grid-cols-5">
      <TabsTrigger value="movie">Movie</TabsTrigger>
      <TabsTrigger value="pdf">PDF</TabsTrigger>
      <TabsTrigger value="html">HTML</TabsTrigger>
      <TabsTrigger value="podcast">Podcast</TabsTrigger>
      <TabsTrigger value="slide">Slide</TabsTrigger>
    </TabsList>

    <TabsContent value="movie" class="mt-4">
      <div class="border rounded-lg p-8 text-center bg-gray-50">
        <video :size="64" class="mx-auto text-gray-400 mb-4" controls :src="videoUrl" />
        <p class="text-lg font-medium mb-2">Movie Preview</p>
        <p class="text-sm text-gray-600 mb-4">Video content playback and preview</p>
        <div class="flex justify-center space-x-4">
          <Button @click="playVideo">
            <Play :size="16" class="mr-2" />
            Play
          </Button>
          <Button variant="outline" @click="downloadMp4">
            <Video :size="16" class="mr-2" />
            Download MP4
          </Button>
        </div>
        <div class="mt-4 text-sm text-gray-500">Duration: 12:34 | Resolution: 1920x1080 | Size: 145 MB</div>
      </div>
    </TabsContent>

    <TabsContent value="pdf" class="mt-4">
      <div class="border rounded-lg p-8 text-center bg-gray-50">
        <FileText :size="64" class="mx-auto text-gray-400 mb-4" />
        <p class="text-lg font-medium mb-2">PDF Preview</p>
        <p class="text-sm text-gray-600 mb-4">PDF document display and download</p>
        <div class="flex justify-center space-x-4">
          <Button>
            <FileText :size="16" class="mr-2" />
            View PDF
          </Button>
          <Button variant="outline">
            <FileText :size="16" class="mr-2" />
            Download PDF
          </Button>
        </div>
        <div class="mt-4 text-sm text-gray-500">8 pages | A4 format | Size: 2.1 MB</div>
      </div>
    </TabsContent>

    <TabsContent value="html" class="mt-4">
      <div class="border rounded-lg p-8 text-center bg-gray-50">
        <Globe :size="64" class="mx-auto text-gray-400 mb-4" />
        <p class="text-lg font-medium mb-2">HTML Preview</p>
        <p class="text-sm text-gray-600 mb-4">Interactive web format display</p>
        <div class="flex justify-center space-x-4">
          <Button>
            <Eye :size="16" class="mr-2" />
            View HTML
          </Button>
          <Button variant="outline">
            <Download :size="16" class="mr-2" />
            Download HTML
          </Button>
        </div>
        <div class="mt-4 text-sm text-gray-500">Interactive content | Responsive design</div>
      </div>
    </TabsContent>

    <TabsContent value="podcast" class="mt-4">
      <div class="border rounded-lg p-8 text-center bg-gray-50">
        <Volume2 :size="64" class="mx-auto text-gray-400 mb-4" />
        <p class="text-lg font-medium mb-2">Podcast Preview</p>
        <p class="text-sm text-gray-600 mb-4">Audio content playback and preview</p>
        <div class="flex justify-center space-x-4">
          <Button>
            <Play :size="16" class="mr-2" />
            Play
          </Button>
          <Button variant="outline" @click="downloadMp3">
            <Volume2 :size="16" class="mr-2" />
            Download MP3
          </Button>
        </div>
        <div class="mt-4 text-sm text-gray-500">Duration: 12:34 | Size: 8.2 MB</div>
      </div>
    </TabsContent>

    <TabsContent value="slide" class="mt-4">
      <div class="border rounded-lg p-8 text-center bg-gray-50">
        <FileImage :size="64" class="mx-auto text-gray-400 mb-4" />
        <p class="text-lg font-medium mb-2">Slide Preview</p>
        <p class="text-sm text-gray-600 mb-4">Slide format display and navigation</p>
        <div class="flex justify-center space-x-4">
          <Button>
            <Play :size="16" class="mr-2" />
            Start Slideshow
          </Button>
          <Button variant="outline">
            <FileImage :size="16" class="mr-2" />
            Export Images
          </Button>
        </div>
        <div class="mt-4 text-sm text-gray-500">8 slides | 1920x1080 resolution</div>
      </div>
    </TabsContent>
  </Tabs>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Video, FileText, Globe, Volume2, FileImage, Play, Eye, Download } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRoute } from "vue-router";

const route = useRoute();
const projectId = computed(() => route.params.id as string);

const downloadMp4 = async () => {
  return downloadFile("movie", "video/mp4", projectId.value + "_video.mp4");
};
const downloadMp3 = async () => {
  return downloadFile("audio", "audio/mp3", projectId.value + "_audio.mp3");
};

const videoUrl = ref("");
const playVideo = async () => {
  // const path = await window.electronAPI.mulmoHandler("mediaFilePath", projectId.value, "movie");
  const buffer = await window.electronAPI.mulmoHandler("downloadFile", projectId.value, "movie");
  const blob = new Blob([buffer], { type: "video/mp4" });
  const url = URL.createObjectURL(blob);
  
  videoUrl.value = url;
};

const downloadFile = async (fileType: string, mimeType: string, fileName: string) => {
  const buffer = await window.electronAPI.mulmoHandler("downloadFile", projectId.value, fileType);
  const blob = new Blob([buffer], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
};
</script>
