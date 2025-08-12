import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { transformSetName } from './setNameUtils.js';

export async function scrapeCollectorBoosterIds(setName) {
    const browser = await puppeteer.launch({
        headless: true
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
        const productIds = [];
        
        // Find all product links containing "Collector Booster Display"
        $('a[href*="/product/"]').each((i, element) => {
            const href = $(element).attr('href');
            const text = $(element).text().toLowerCase();
            
            if (text.includes('collector booster display') && !text.includes('case')) {
                // Extract product ID from URL: /product/619672/...
                const match = href.match(/\/product\/(\d+)\//);
                if (match) {
                    productIds.push(match[1]);
                }
            }
        });
        
        return productIds;
        
    } catch (error) {
        console.error(`Scraping failed for set "${setName}":`, error.message);
        return [];
    } finally {
        await browser.close();
    }
}