import { computed } from "vue";
import { useMulmoGlobalStore } from "@/store";

import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/ja";
import "dayjs/locale/en";
import dayjs from "dayjs";

dayjs.extend(localizedFormat);

export const useFormatedDate = (date: Date, format: string) => {
  const globalStore = useMulmoGlobalStore();

  const formatedTime = computed(() => {
    dayjs.locale(globalStore.settings.MAIN_LANGUAGE);
    return dayjs(date).format(format);
  });
  return { formatedTime };

};
