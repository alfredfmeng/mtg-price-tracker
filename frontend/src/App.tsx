import { useState, useEffect } from 'react'
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

const saveDashboardState = (sets: StoredSet[]) => {
  try {
    const state: DashboardState = { selectedSets: sets, version: "1.0" }
    localStorage.setItem('dashboardState', JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save dashboard state:', error)
  }
}

const loadDashboardState = (): DashboardState | null => {
  try {
    const storedState = localStorage.getItem('dashboardState')
    if (!storedState) return null
    return JSON.parse(storedState);    
  } catch (error) {
    console.error('Failed to load dashboard state:', error)
    return null
  }
}

const clearDashboardState = () => {
  try {
    localStorage.removeItem('dashboardState')
  } catch (error) {
    console.error('Failed to clear dashboard state:', error)
  }
}

function App() {
  const [selectedSets, setSelectedSets] = useState<StoredSet[]>([])
  const [currentSet, setCurrentSet] = useState('')

  useEffect(() => {
    const savedState = loadDashboardState();
    if (savedState && savedState.version === '1.0') {
      setSelectedSets(savedState?.selectedSets)
    }
  }, [])

  useEffect(() => {
    if (selectedSets.length > 0) {
      saveDashboardState(selectedSets)
    }
  }, [selectedSets])

  const handleAddSet = () => {
    if (currentSet.trim() && !selectedSets.some(set => set.name === currentSet.trim())) {
      const newSet: StoredSet = {
        name: currentSet.trim(),
        productId: '',
        range: 'month'
      }
      setSelectedSets([...selectedSets, newSet])
      setCurrentSet('')
    }
  }

  const handleRemoveSet = (setToRemove: string) => {
    setSelectedSets(selectedSets.filter(set => set.name !== setToRemove))
  }

  const handleRangeChange = (setName: string, range: PriceRange) => {
    setSelectedSets(prev => prev.map(set => set.name === setName ? { ...set, range } : set))
  }

  const handleProductIdFound = (setName: string, productId: string) => {
    setSelectedSets(prev => prev.map(set => set.name === setName ? { ...set, productId } : set))
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
              {
                selectedSets.map(storedSet => (
                  <div key={storedSet.name} className="set-item">
                    <span>{storedSet.name}</span>
                    <button onClick={() => handleRemoveSet(storedSet.name)}>Remove</button>
                  </div>
                ))
              }
            </div>
          </>
        )}
      </div>

      <div className="charts-container">
        {
          selectedSets.map(storedSet => (
            <PriceChart
              key={storedSet.name}
              setName={storedSet.name}
              range={storedSet.range}
              productId={storedSet.productId}
              onRangeChange={(range) => handleRangeChange(storedSet.name, range)}
              onProductIdFound={(productId) => handleProductIdFound(storedSet.name, productId)}
            />
          ))
        }
        {/* {selectedSets.map(set => (
          <PriceChart
            key={set}
            setName={set}
            range={setRanges[set] || 'quarter'}
            onRangeChange={(range) => handleRangeChange(set, range)}
          />
        ))} */}
      </div>
    </div>
  )
}

export default App
