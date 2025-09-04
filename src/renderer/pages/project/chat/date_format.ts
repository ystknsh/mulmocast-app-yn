import { computed } from "vue";
import { useI18n } from "vue-i18n";

import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/ja";
import "dayjs/locale/en";
import dayjs from "dayjs";

dayjs.extend(localizedFormat);

// Format chat timestamps using the current UI locale (APP_LANGUAGE)
export const useFormatedDate = (date: Date | number, format: string) => {
  const { locale } = useI18n();

  const formatedTime = computed(() => {
    return dayjs(date).locale(locale.value).format(format);
  });
  return { formatedTime };
};
