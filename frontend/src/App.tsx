import { useState } from 'react'
import './App.css'
import PriceChart from './PriceChart'

type PriceRange = 'month' | 'quarter' | 'semi-annual' | 'annual'

interface StoredSet {
  name: string,
  productId: string,
  range: PriceRange
}

interface DashboardState {
  selectedSets: StoredSet[],
  version: string
}

// const saveDashboardState = (sets: StoredSet[]) => {
//   const state: DashboardState = { selectedSets: sets, version: "1.0" }
//   localStorage.setItem('dashboardState', JSON.stringify(state))
// }

// const loadDashboardState = (): StoredSet[] => {
//   localStorage.getItem('dashboardState')
// }

function App() {
  const [selectedSets, setSelectedSets] = useState<string[]>([])
  const [currentSet, setCurrentSet] = useState('')
  const [setRanges, setSetRanges] = useState<Record<string, PriceRange>>({})

  const handleAddSet = () => {
    if (currentSet.trim() && !selectedSets.includes(currentSet.trim())) {
      const newSet = currentSet.trim()
      setSelectedSets([...selectedSets, newSet])
      setSetRanges({...setRanges, [newSet]: 'quarter'}) // Default to quarter
      setCurrentSet('')
    }
  }

  const handleRemoveSet = (setToRemove: string) => {
    setSelectedSets(selectedSets.filter(set => set !== setToRemove))
    const newRanges = {...setRanges}
    delete newRanges[setToRemove]
    setSetRanges(newRanges)
  }

  const handleRangeChange = (setName: string, range: PriceRange) => {
    setSetRanges({...setRanges, [setName]: range})
  }

  return (
    <div className="dashboard">
      <header>
        <h1>MTG Collector Booster Display Price Tracker</h1>
      </header>

      <div className="set-selector">
        <h2>Add MTG Sets</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter set name (e.g., 'Foundations', 'Wilds of Eldraine')"
            value={currentSet}
            onChange={(e) => setCurrentSet(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSet()}
          />
          <button onClick={handleAddSet}>Add Set</button>
        </div>
      </div>

      <div className="selected-sets">
        {selectedSets.length > 0 && (
          <>
            <h3>Selected Sets:</h3>
            <div className="set-list">
              {selectedSets.map(set => (
                <div key={set} className="set-item">
                  <span>{set}</span>
                  <button onClick={() => handleRemoveSet(set)}>Remove</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="charts-container">
        {selectedSets.map(set => (
          <PriceChart
            key={set}
            setName={set}
            range={setRanges[set] || 'quarter'}
            onRangeChange={(range) => handleRangeChange(set, range)}
          />
        ))}
      </div>
    </div>
  )
}

export default App
