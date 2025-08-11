<template>
  <TabsContent value="slide" class="mt-4 max-h-[calc(90vh-7rem)] overflow-y-auto">
    <div class="rounded-lg border bg-gray-50 p-8 text-center">
      <FileImage :size="64" class="mx-auto mb-4 text-gray-400" />
      <p class="mb-2 text-lg font-medium">{{ t("project.productTabs.slide.title") }}</p>
      <p class="mb-4 text-sm text-gray-600">{{ t("project.productTabs.slide.description") }}</p>
      <div class="flex flex-wrap items-center justify-center gap-2">
        <Button>
          <Play :size="16" class="mr-2" />
          {{ t("project.productTabs.slide.start") }}
        </Button>
        <Button variant="outline">
          <FileImage :size="16" class="mr-2" />
          {{ t("project.productTabs.slide.export") }}
        </Button>
      </div>
      <div class="mt-4 text-sm text-gray-500">{{ t("project.productTabs.slide.details") }}</div>
    </div>
  </TabsContent>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { FileImage, Play } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";

const { t } = useI18n();

interface Props {
  projectId: string;
}

defineProps<Props>();
</script>
