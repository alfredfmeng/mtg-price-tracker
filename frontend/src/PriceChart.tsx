import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { api } from './api'
import type { PriceRange, TCGPlayerPriceHistory } from './api'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface PriceChartProps {
  setName: string
  range: PriceRange
  onRangeChange: (range: PriceRange) => void
}

export default function PriceChart({ setName, range, onRangeChange }: PriceChartProps) {
  const [priceData, setPriceData] = useState<TCGPlayerPriceHistory | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [productId, setProductId] = useState('')

  // Initial fetch when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.searchSet(setName)
        setProductId(response.productId)
        setPriceData(response.priceHistory)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only runs once on mount

  // Fetch new data when range changes - productId never changes for this component
  useEffect(() => {
    if (!productId) return

    const fetchRangeData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.getPriceHistory(productId, range)
        setPriceData(response.priceHistory)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch price history')
      } finally {
        setLoading(false)
      }
    }

    fetchRangeData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]) // Only range dependency - productId is constant for this component

  // Transform API data to Chart.js format
  const getChartData = () => {
    if (!priceData || !priceData.result || priceData.result.length === 0) {
      return {
        labels: [],
        datasets: []
      }
    }

    const buckets = priceData.result[0].buckets
    // Reverse buckets to show chronological order (oldest to newest)
    const reversedBuckets = [...buckets].reverse()
    const labels = reversedBuckets.map(bucket => new Date(bucket.bucketStartDate).toLocaleDateString())
    const prices = reversedBuckets.map(bucket => parseFloat(bucket.marketPrice))

    return {
      labels,
      datasets: [
        {
          label: `${setName} Collector Booster Price`,
          data: prices,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
        },
      ],
    }
  }

  const chartData = getChartData()

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${setName} Price History - ${range}`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price ($)',
        },
      },
    },
  }

  const ranges: PriceRange[] = ['month', 'quarter', 'semi-annual', 'annual']

  if (loading) {
    return (
      <div className="price-chart">
        <div className="chart-header">
          <h4>{setName} Price Chart</h4>
        </div>
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading price data...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="price-chart">
        <div className="chart-header">
          <h4>{setName} Collector Booster Display</h4>
        </div>
        <div className="error">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="price-chart">
      <div className="chart-header">
        <h4>{setName} Collector Booster Display Market Price History</h4>
        <div className="range-selector">
          {ranges.map(rangeOption => (
            <button
              key={rangeOption}
              className={`range-button ${range === rangeOption ? 'active' : ''}`}
              onClick={() => onRangeChange(rangeOption)}
              disabled={loading}
            >
              {rangeOption === 'semi-annual' ? '6M' : 
               rangeOption === 'annual' ? '1Y' :
               rangeOption === 'quarter' ? '3M' :
               '1M'}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}