import { ref } from "vue";
import { bufferToUrl } from "@/lib/utils";

export const useImageFiles = () => {
  const imageFiles = ref<Record<string, string | null>>({});
  const movieFiles = ref<Record<string, string | null>>({});
  const lipSyncFiles = ref<Record<string, string | null>>({});

  const downloadImageFiles = async (projectId: string) => {
    const res = await window.electronAPI.mulmoHandler("mulmoImageFiles", projectId);
    Object.keys(res).forEach((id) => {
      const data = res[id];
      if (data.imageData) {
        imageFiles.value[id] = bufferToUrl(data.imageData, "image/png");
      }
      if (data.movieData) {
        movieFiles.value[id] = bufferToUrl(data.movieData, "video/mp4");
      }
      if (data.lipSyncData) {
        lipSyncFiles.value[id] = bufferToUrl(data.lipSyncData, "video/mp4");
      }
    });
  };
  const downloadImageFile = async (projectId: string, index: number, beatId: string) => {
    const data = await window.electronAPI.mulmoHandler("mulmoImageFile", projectId, index);
    if (data?.imageData) {
      imageFiles.value[beatId] = bufferToUrl(data.imageData, "image/png");
    }
    if (data?.movieData) {
      movieFiles.value[beatId] = bufferToUrl(data.movieData, "video/mp4");
    }
    if (data?.lipSyncData) {
      lipSyncFiles.value[beatId] = bufferToUrl(data.lipSyncData, "video/mp4");
    }
  };
  return {
    imageFiles,
    movieFiles,
    lipSyncFiles,
    downloadImageFiles,
    downloadImageFile,
  };
};
