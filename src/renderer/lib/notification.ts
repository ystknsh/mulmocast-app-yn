import { Component } from "vue";
import { toast } from "vue-sonner";

export const notifySuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
  });
};

export const notifyError = (message: string, description?: string) => {
  toast.error(message, {
    description,
  });
};

export const notifyProgress = <T>(
  promise: Promise<T>,
  {
    loadingMessage,
    successMessage,
    errorMessage,
  }: { loadingMessage: string | Component; successMessage: string; errorMessage: string },
) => {
  toast.promise(promise, {
    loading: loadingMessage,
    success: successMessage,
    error: errorMessage,
  });
  return promise;
};
