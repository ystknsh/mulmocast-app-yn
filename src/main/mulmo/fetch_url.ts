import { createWriteStream, mkdirSync } from "fs";
import { pipeline } from "stream/promises";
import { createHash } from "crypto";
import { extname } from "path";
import fetch from "node-fetch";

const IMAGE_MIME = ["image/jpeg", "image/png"];
const MOVIE_MIME = ["video/mp4", "video/quicktime", "video/mpeg"];
const IMAGE_EXT = [".jpg", ".jpeg", ".png"];
const MOVIE_EXT = [".mp4", ".mov", ".mpg"];

const guessTypeByMime = (mime: string): "image" | "movie" | undefined =>
  IMAGE_MIME.includes(mime) ? "image" : MOVIE_MIME.includes(mime) ? "movie" : undefined;

const guessTypeByExt = (ext: string): "image" | "movie" | undefined =>
  IMAGE_EXT.includes(ext.toLowerCase()) ? "image" : MOVIE_EXT.includes(ext.toLowerCase()) ? "movie" : undefined;

const getHash = (str: string): string => createHash("sha256").update(str).digest("hex");

export const fetchAndSave = async (
  url: string,
  outDir = "./downloads",
): Promise<{ result: true; imageType: "image" | "movie"; path: string } | { result: false }> => {
  try {
    const res = await fetch(url, { timeout: 15000 });
    if (!res.ok) {
      console.log("not ok");
      console.log(res, url);
      return {
        result: false,
        error: {
          message: res.state + " " + res.statusText,
        },
      };
    }

    const mime = res.headers.get("content-type")?.split(";")[0] ?? "";
    const extFromUrl = extname(new URL(url).pathname) || "";
    const imageType = guessTypeByMime(mime) ?? guessTypeByExt(extFromUrl);

    if (!imageType) {
      console.log("no image type");
      return {
        error: {
          message: "invalid image type",
        },
        result: false,
      };
    }
    const ext =
      extFromUrl ||
      (mime === "image/jpeg"
        ? ".jpg"
        : mime === "image/png"
          ? ".png"
          : mime === "video/mp4"
            ? ".mp4"
            : mime === "video/quicktime"
              ? ".mov"
              : mime === "video/mpeg"
                ? ".mpg"
                : "");

    if (!ext) {
      console.log("no ext");
      return {
        result: false,
        error: {
          message: "invalid image ext",
        },
      };
    }

    mkdirSync(outDir, { recursive: true });

    const hash = getHash(url);
    const filename = `${hash}${ext}`;
    const path = `${outDir}/${filename}`;

    await pipeline(res.body, createWriteStream(path));

    return {
      result: true,
      imageType,
      filename,
    };
  } catch (error) {
    console.log(error);
    return { result: false, error };
  }
};

/*
const main = async () => {
  const url = "https://raw.githubusercontent.com/receptron/mulmocast-media/refs/heads/main/characters/jk_anime.png";
  const res = await fetchAndSave(url);
  console.log(res);
};
*/
//main();
