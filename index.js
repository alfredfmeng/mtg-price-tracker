import express from 'express'
import axios from 'axios'
import { scrapeCollectorBoosterIds } from './utils/scraper.js'

const app = express()
const PORT = 3000

async function fetchPriceHistory(productId, range = 'quarter') {
    try {
        const response = await axios.get(`https://infinite-api.tcgplayer.com/price/history/${productId}/detailed?range=${range}`)
        return response.data
    } catch (error) {
        console.error(`Failed to fetch price history for product ${productId}:`, error.message)
        return null
    }
}


app.get('/search/:setName', async (req, res) => {
    const { setName } = req.params
    console.log(`Searching for collector booster boxes in set: ${setName}`)
    
    const productIds = await scrapeCollectorBoosterIds(setName)
    
    // Fetch price history for the first product ID (assuming single collector booster per set)
    let priceHistory = null
    if (productIds.length > 0) {
        priceHistory = await fetchPriceHistory(productIds[0], 'quarter')
    }
    
    res.json({
        setName,
        collectorBoosterIds: productIds,
        count: productIds.length,
        priceHistory: priceHistory
    })
})

app.get('/price-history/:productId', async (req, res) => {
    const { productId } = req.params
    const { range = 'quarter' } = req.query
    
    const priceHistory = await fetchPriceHistory(productId, range)
    
    res.json({
        productId,
        range,
        priceHistory
    })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})