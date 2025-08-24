import express, { Request, Response } from 'express';
import axios from 'axios';
import scrapeCollectorBoosterId from './utils/scraper.js';

const app = express();
const PORT = 3000;

type PriceRange = 'month' | 'quarter' | 'semi-annual' | 'annual';

async function fetchPriceHistory(productId: string, range: PriceRange = 'quarter'): Promise<Record<string, any> | null> {
  try {
    const tcgplayerUrl = `https://infinite-api.tcgplayer.com/price/history/${productId}/detailed?range=${range}`;
    const response = await axios.get(tcgplayerUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
        Referer: 'https://www.tcgplayer.com/',
      },
    });
    return response.data;
  } catch (error: unknown) {
    console.error(
      `Failed to fetch price history for product ${productId}:`,
      (error as Error).message
    );
    return null;
  }
}

app.get('/', (req: Request, res: Response) => {
  res.send('hello world');
});

// First click of a collector booster display image on the front-end passes in the set name and the product id is scraped so that an api call to TCGPlayer can be made to obtain price data.
app.get('/search/:setName', async (req: Request, res: Response) => {
  const { setName } = req.params;
  console.log(
    `Searching TCGPlayer for the collector booster box product ID with the following set name: ${setName}`
  );

  const productId = await scrapeCollectorBoosterId(setName);
  if (!productId) {
    return res.status(404).json({
      error: `No collector booster display found for set: ${setName}`,
      setName,
      productId: null,
      priceHistory: null
    })
  }

  // Fetch price history using the product id
  let priceHistory = null;
  priceHistory = await fetchPriceHistory(productId);

  res.json({
    setName,
    productId,
    collectorBoosterIds: productId,
    priceHistory: priceHistory,
  });
});

// Price chart will have radio buttons below it for 1M, 3M, 6M, 1Y. Default view is set to quarter (3M), but when any other radio button is clicked, an api call is made with the new range to obtain price data for that range.
app.get('/price-history/:productId', async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { range = 'quarter' } = req.query;
  
  const validRange: PriceRange = ['month', 'quarter', 'semi-annual', 'annual'].includes(range as string) ? (range as PriceRange) : 'quarter';

  const priceHistory = await fetchPriceHistory(productId, validRange);

  res.json({
    productId,
    range: validRange,
    priceHistory,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
