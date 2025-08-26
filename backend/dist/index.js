import express from 'express';
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import scrapeCollectorBoosterId from './utils/scraper.js';
const app = express();
const PORT = 3000;
// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Configure CORS to allow frontend requests
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || 'https://your-production-domain.com'
        : ['http://localhost:5173', 'http://127.0.0.1:5173']
}));
async function fetchPriceHistory(productId, range = 'quarter') {
    try {
        const tcgplayerUrl = `https://infinite-api.tcgplayer.com/price/history/${productId}/detailed?range=${range}`;
        const response = await axios.get(tcgplayerUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                Accept: 'application/json',
                Referer: 'https://www.tcgplayer.com/',
            },
        });
        return response.data;
    }
    catch (error) {
        console.error(`Failed to fetch price history for product ${productId}:`, error.message);
        return null;
    }
}
// First click of a collector booster display image on the front-end passes in the set name and the product id is scraped so that an api call to TCGPlayer can be made to obtain price data.
app.get('/search/:setName', async (req, res) => {
    const { setName } = req.params;
    console.log(`Searching TCGPlayer for the collector booster box product ID with the following set name: ${setName}`);
    const productId = await scrapeCollectorBoosterId(setName);
    if (!productId) {
        return res.status(404).json({
            error: `No collector booster display found for set: ${setName}`,
            setName,
            productId: null,
            priceHistory: null
        });
    }
    // Fetch price history using the product id
    let priceHistory = null;
    priceHistory = await fetchPriceHistory(productId);
    res.json({
        setName,
        productId,
        priceHistory: priceHistory,
    });
});
// Price chart will have radio buttons below it for 1M, 3M, 6M, 1Y. Default view is set to quarter (3M), but when any other radio button is clicked, an api call is made with the new range to obtain price data for that range.
app.get('/price-history/:productId', async (req, res) => {
    const { productId } = req.params;
    const { range = 'quarter' } = req.query;
    const validRange = ['month', 'quarter', 'semi-annual', 'annual'].includes(range) ? range : 'quarter';
    const priceHistory = await fetchPriceHistory(productId, validRange);
    res.json({
        productId,
        range: validRange,
        priceHistory,
    });
});
// Serve static files from frontend build (CSS, JS, images)
app.use(express.static(path.join(__dirname, '../../frontend/dist')));
// Serve React app on root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map