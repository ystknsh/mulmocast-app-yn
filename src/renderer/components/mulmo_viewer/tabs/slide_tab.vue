<template>
  <TabsContent value="slide" class="mt-4 max-h-[calc(90vh-7rem)] overflow-y-auto">
    <div class="border-border bg-muted/50 rounded-lg border p-8 text-center">
      <FileImage :size="64" class="text-muted-foreground mx-auto mb-4" />
      <p class="mb-2 text-lg font-medium">{{ t("project.productTabs.slide.title") }}</p>
      <p class="text-muted-foreground mb-4 text-sm">{{ t("project.productTabs.slide.description") }}</p>
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
      <div class="text-muted-foreground mt-4 text-sm">{{ t("project.productTabs.slide.details") }}</div>
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
