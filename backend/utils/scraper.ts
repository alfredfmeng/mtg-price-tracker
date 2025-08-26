import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import transformSetName from './setNameUtils.ts';

export default async function scrapeCollectorBoosterId(setName: string): Promise<string | undefined> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage'
  ]
  });

  try {
    const page = await browser.newPage();

    // Build the search URL
    const transformedSetName = transformSetName(setName);
    const baseUrl = 'https://www.tcgplayer.com/search/magic/';
    const searchUrl = `${baseUrl}${transformedSetName}?productLineName=magic&page=1&view=grid&ProductTypeName=Sealed+Products&setName=${transformedSetName}`;

    console.log(`Scraping: ${searchUrl}`);

    // Navigate to the page
    await page.goto(searchUrl);

    // Wait for products to load
    await page.waitForSelector('.search-results', { timeout: 10000 });

    // Get the page HTML
    const html = await page.content();

    // Parse HTML with Cheerio
    const $ = cheerio.load(html);
    const productIds: string[] = [];
    // Find all product links containing "Collector Booster Display"
    $('a[href*="/product/"]').each((i, element) => {
      const href = $(element).attr('href');
      if (!href) return;
      
      const text = $(element).text().toLowerCase();
      if (!text.includes('collector booster display') || text.includes('case')) return;
      
      const productId = href.match(/\/product\/(\d+)\//)?.[1];
      if (productId) productIds.push(productId);
    });
    
    console.log(`Product ID for ${setName}: ${productIds[0]}`)

    return productIds[0];
  } catch (error: unknown) {
    console.error(`Scraping failed for set "${setName}":`, (error as Error).message);
    return undefined;
  } finally {
    await browser.close();
  }
}