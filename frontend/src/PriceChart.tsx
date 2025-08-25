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

type PriceRange = 'month' | 'quarter' | 'semi-annual' | 'annual'

interface PriceChartProps {
  setName: string
  priceData?: any[] // We'll type this properly when we connect to the API
  range: PriceRange
  onRangeChange: (range: PriceRange) => void
}

export default function PriceChart({ setName, priceData, range, onRangeChange }: PriceChartProps) {
  // Mock data for now - we'll replace this with real API data
  const mockData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: `${setName} Collector Booster Price`,
        data: [120, 135, 128, 145, 140, 132],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  }

  const options = {
    responsive: true,
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

  return (
    <div className="price-chart">
      <div className="chart-header">
        <h4>{setName} Price Chart</h4>
        <div className="range-selector">
          {ranges.map(rangeOption => (
            <button
              key={rangeOption}
              className={`range-button ${range === rangeOption ? 'active' : ''}`}
              onClick={() => onRangeChange(rangeOption)}
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
        <Line data={mockData} options={options} />
      </div>
    </div>
  )
}