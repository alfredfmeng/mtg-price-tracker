import express from 'express';
import axios from 'axios';
import { scrapeCollectorBoosterIds } from './utils/scraper.js';

const app = express();
const PORT = 3000;

async function fetchPriceHistory(productId, range = 'quarter') {
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
  } catch (error) {
    console.error(
      `Failed to fetch price history for product ${productId}:`,
      error.message
    );
    return null;
  }
}

app.get('/', (req, res) => {
  res.send('hello world');
});

// First click of a collector booster display image on the front-end passes in the set name and the product id is scraped so that an api call to TCGPlayer can be made to obtain price data.
app.get('/search/:setName', async (req, res) => {
  const { setName } = req.params;
  console.log(`Searching for collector booster boxes in set: ${setName}`);

  const productIds = await scrapeCollectorBoosterIds(setName);

  // Fetch price history for the first product ID (assuming single collector booster per set)
  let priceHistory = null;
  if (productIds.length > 0) {
    priceHistory = await fetchPriceHistory(productIds[0], 'quarter');
  }

  res.json({
    setName,
    collectorBoosterIds: productIds,
    count: productIds.length,
    priceHistory: priceHistory,
  });
});

// Price chart will have radio buttons below it for 1M, 3M, 6M, 1Y. Default view is set to quarter (3M), but when any other radio button is clicked, an api call is made with the new range to obtain price data for that range.
app.get('/price-history/:productId', async (req, res) => {
  const { productId } = req.params;
  const { range = 'quarter' } = req.query;

  const priceHistory = await fetchPriceHistory(productId, range);

  res.json({
    productId,
    range,
    priceHistory,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
