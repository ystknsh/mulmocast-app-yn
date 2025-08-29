import fs from "node:fs";
import path from "node:path";
import { VOICE_LISTS as OLD_VOICE_LISTS } from "./constants_old";
import { VOICE_LISTS as NEW_VOICE_LISTS } from "../../src/shared/constants";
import en from "../../src/renderer/i18n/en";
import ja from "../../src/renderer/i18n/ja";

/**
 * nijivoiceの旧データと新データを比較し、CSV形式で出力するスクリプト
 */
const generateCsv = () => {
  // Step 1: 旧データを読み込む
  const oldData = OLD_VOICE_LISTS.nijivoice;

  // Step 2: 新データを検索しやすいようにMapに変換
  const newDataMap = new Map(NEW_VOICE_LISTS.nijivoice.map((voice) => [voice.id, voice]));

  // CSVヘッダー
  const header = [
    "no",
    "id",
    "old_name",
    "key",
    "new_name",
    "name_match",
    "i18n_en",
    "i18n_ja",
    "i18n_en_match",
    "i18n_ja_match",
  ];

  // 比較結果の件数を集計するためのカウンター
  const summary = {
    totalOld: oldData.length,
    foundInNew: 0,
    name: { true: 0, false: 0 },
    i18n: {
      foundInEn: 0,
      foundInJa: 0,
      enMatch: { true: 0, false: 0 },
      jaMatch: { true: 0, false: 0 },
    },
  };

  // CSV行データを作成
  // Step 1: 旧データを基準にループ
  const rows = oldData.map((oldVoice, index) => {
    // Step 2: 旧IDを元に新データを検索
    const newVoice = newDataMap.get(oldVoice.id);
    const key = newVoice?.key ?? "N/A";
    const oldName = oldVoice.name;
    const newName = newVoice?.name ?? "N/A";

    let nameMatch = false;
    if (newVoice) {
      summary.foundInNew++;
      nameMatch = oldName === newName;
      summary.name[nameMatch ? "true" : "false"]++;
    }

    // Step 3: keyをベースにi18nを検索
    let i18nEn = "N/A";
    let i18nJa = "N/A";
    let i18nEnMatch = false;
    let i18nJaMatch = false;

    if (newVoice && key !== "N/A") {
      // EN check
      const i18nEnKey = key as keyof typeof en.nijivoice;
      if (en.nijivoice[i18nEnKey]) {
        summary.i18n.foundInEn++;
        i18nEn = en.nijivoice[i18nEnKey];
        // `key`カラム（例: hanamura_honoka）と`i18n_en`カラム（例: Hanamura Honoka）を比較します。
        // `key`からアンダースコアを、`i18n_en`から空白をそれぞれ除去し、両方を小文字に変換して照合することで、書式の違いを吸収します。
        i18nEnMatch = key.replace(/_/g, "").toLowerCase() === i18nEn.replace(/\s/g, "").toLowerCase();
      }

      // JA check
      const i18nJaKey = key as keyof typeof ja.nijivoice;
      if (ja.nijivoice[i18nJaKey]) {
        summary.i18n.foundInJa++;
        i18nJa = ja.nijivoice[i18nJaKey];
        i18nJaMatch = newName === i18nJa;
      }
    }
    summary.i18n.enMatch[i18nEnMatch ? "true" : "false"]++;
    summary.i18n.jaMatch[i18nJaMatch ? "true" : "false"]++;

    return [
      index + 1,
      oldVoice.id,
      `"${oldName}"`,
      key,
      `"${newName}"`,
      nameMatch,
      `"${i18nEn}"`,
      `"${i18nJa}"`,
      i18nEnMatch,
      i18nJaMatch,
    ];
  });

  // CSV文字列に変換
  const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");

  // test/nijivoice ディレクトリ内にCSVファイルとして保存
  const outputPath = path.resolve(__dirname, "nijivoice_comparison.csv");

  try {
    fs.writeFileSync(outputPath, csvContent, "utf-8");
    console.log(`✅ CSV file has been generated successfully at: ${outputPath}`);

    // サマリー表示
    console.log("\n--- Step 1 & 2 Summary (Old vs New) ---");
    console.log(`Total items in old constants: ${summary.totalOld}`);
    console.log(`Found in new constants (by ID): ${summary.foundInNew}`);
    console.log(`Name Match: true: ${summary.name.true}, false: ${summary.name.false}`);
    console.log("----------------------------------------");

    console.log("\n--- Step 3 Summary (New vs i18n) ---");
    console.log(`Total items with a key in new constants: ${summary.foundInNew}`);
    console.log(`Found in i18n EN file (by key): ${summary.i18n.foundInEn}`);
    console.log(`Found in i18n JA file (by key): ${summary.i18n.foundInJa}`);
    console.log(`i18n EN Match: true: ${summary.i18n.enMatch.true}, false: ${summary.i18n.enMatch.false}`);
    console.log(`i18n JA Match: true: ${summary.i18n.jaMatch.true}, false: ${summary.i18n.jaMatch.false}`);
    console.log("------------------------------------");
  } catch (error) {
    console.error("❌ Failed to write CSV file:", error);
  }
};

generateCsv();