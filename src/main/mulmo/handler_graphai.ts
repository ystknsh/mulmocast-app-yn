import { puppeteerCrawlerAgent } from "mulmocast";

export const graphaiPuppeteerAgent = async (params: { url: string }) => {
  const { url } = params;
  console.log(url);

  return await puppeteerCrawlerAgent.agent({ namedInputs: { url } });
};
