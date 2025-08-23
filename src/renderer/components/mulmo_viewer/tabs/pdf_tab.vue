<template>
  <TabsContent value="pdf" class="mt-4 max-h-[calc(90vh-7rem)] overflow-y-auto">
    <div class="rounded-lg border border-border bg-muted/50 p-8 text-center">
      <div class="mx-auto" v-if="pdfData.value">
        <VuePDF :pdf="pdfData.value" :page="pdfCurrentPage" :scale="0.8" :fit-parent="true" />
      </div>
      <template v-else>
        <FileText :size="64" class="mx-auto mb-4 text-muted-foreground" />
        <p class="mb-2 text-lg font-medium">{{ t("project.productTabs.pdf.title") }}</p>
        <p class="mb-4 text-sm text-muted-foreground">{{ t("project.productTabs.pdf.description") }}</p>
      </template>
      <div v-if="pages === 0">{{ t("project.productTabs.pdf.empty") }}</div>
      <div v-if="pages > 0" class="flex flex-col items-center justify-center gap-2">
        <div class="flex items-center justify-center gap-4">
          <div>
            <Button :disabled="pdfCurrentPage < 2" @click="pdfCurrentPage = pdfCurrentPage - 1">< </Button>
            {{ pdfCurrentPage }}/{{ pages }}
            <Button @click="pdfCurrentPage = pdfCurrentPage + 1" :disabled="pdfCurrentPage >= pages">></Button>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-2">
            <Button variant="outline" @click="downloadPdf">
              <FileText :size="16" class="mr-2" />
              {{ t("project.productTabs.pdf.download") }}
            </Button>
          </div>
        </div>
      </div>
      <div class="mt-2 text-xs text-muted-foreground" v-if="pdfData.value">
        {{
          t("project.productTabs.pdf.details", {
            pages: pages || "-",
            size: pdfMetadata.fileSize || "-",
          })
        }}
      </div>
    </div>
  </TabsContent>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { FileText } from "lucide-vue-next";
import { VuePDF, usePDF } from "@tato30/vue-pdf";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { formatFileSize } from "@/lib/format";

import { downloadFile } from "./utils";

const { t } = useI18n();

interface Props {
  projectId: string;
}

const props = defineProps<Props>();

const pdfData = ref();
const pdfCurrentPage = ref(1);
const pdfMetadata = ref({
  pageSize: "",
  fileSize: "",
});

const pdfBuffer = ref();
const { pdf, pages } = usePDF(pdfBuffer);
pdfData.value = pdf;

const downloadPdf = async () => {
  downloadFile(props.projectId, "pdf", "application/pdf", "handout.pdf");
};

const updateResources = async () => {
  const bufferPdf = (await window.electronAPI.mulmoHandler("downloadFile", props.projectId, "pdf")) as Buffer;
  if (bufferPdf && bufferPdf.byteLength > 0) {
    pdfBuffer.value = new Uint8Array(bufferPdf);
    pdfMetadata.value.fileSize = formatFileSize(bufferPdf.byteLength);
  }
};

watch(
  () => props.projectId,
  async (newProjectId, oldProjectId) => {
    if (newProjectId && newProjectId !== oldProjectId) {
      await updateResources();
    }
  },
  { immediate: true },
);
</script>
