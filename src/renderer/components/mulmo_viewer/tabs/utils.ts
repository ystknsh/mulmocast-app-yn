export const downloadFile = async (projectId: string, mediaType: string, mimeType: string, fileSuffix: string) => {
  const buffer = (await window.electronAPI.mulmoHandler("downloadFile", projectId, mediaType)) as ArrayBuffer;
  if (buffer && buffer.byteLength > 0) {
    const blob = new Blob([buffer], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = projectId + "_" + fileSuffix;
    a.click();

    URL.revokeObjectURL(url);
  }
};
