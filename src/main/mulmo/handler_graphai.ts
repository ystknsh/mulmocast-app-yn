import puppeteer from "puppeteer";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export const graphaiPuppeteerAgent = async (params: { url: string}) => {
  const { url } = params;
  console.log(url);
  
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    console.log(1);
    await page.goto(url, { waitUntil: "networkidle2" });
    console.log(2);
    
    const html = await page.content();
    const dom = new JSDOM(html, { url: page.url() });
    
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    console.log(3);
    
    console.log(article?.title);
    console.log(article?.textContent);
    
    await browser.close();
    
    return {
      data: {
        title: article?.title,
      },
      content: (article?.title ?? "" ) + "\n" + article?.textContent,
    };
  } catch {
    return {
      content: "error",
    }
  }
};
