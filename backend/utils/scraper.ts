import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import transformSetName from './setNameUtils.js';

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

    // Set realistic browser headers to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    });

    // Set viewport to common desktop resolution
    await page.setViewport({ width: 1920, height: 1080 });

    // Build the search URL
    const transformedSetName = transformSetName(setName);
    const baseUrl = 'https://www.tcgplayer.com/search/magic/';
    const searchUrl = `${baseUrl}${transformedSetName}?productLineName=magic&page=1&view=grid&ProductTypeName=Sealed+Products&setName=${transformedSetName}`;

    console.log(`Scraping: ${searchUrl}`);

    // Navigate to the page
    console.log('Navigating to page...');
    const response = await page.goto(searchUrl, { waitUntil: 'networkidle0' });
    console.log('Page response status:', response?.status());
    
    // Check if we got blocked/redirected
    const currentUrl = page.url();
    console.log('Current URL after navigation:', currentUrl);
    
    // Log page title to see what we actually got
    const title = await page.title();
    console.log('Page title:', title);

    // Wait for products to load
    console.log('Waiting for .search-results selector...');
    try {
      await page.waitForSelector('.search-results', { timeout: 15000 });
      console.log('Found .search-results successfully');
    } catch (error) {
      console.log('Failed to find .search-results, checking page content...');
      const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 200));
      console.log('Page content preview:', bodyText);
      throw error;
    }

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