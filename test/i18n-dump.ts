import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import i18n from "../src/renderer/i18n/index";

//const { en, ja } = i18n.messages;
// console.log(en, ja);

const main = async () => {
  const outDir = path.resolve(".i18n-cache");
  await mkdir(outDir, { recursive: true });

  await Promise.all(
    Object.entries(i18n.messages).map(([locale, data]) =>
      writeFile(path.join(outDir, `${locale}.json`), JSON.stringify(data, null, 2)),
    ),
  );

  console.log("i18n JSON dumped to .i18n-cache/");
};

main();
