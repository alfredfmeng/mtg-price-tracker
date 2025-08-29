# MTG Price Tracker - Project Overview

## Application Architecture

This is a full-stack MTG collector booster display price tracking application with a TypeScript Express backend that scrapes TCGPlayer data and a React frontend dashboard for visualizing price history. The application is **fully functional** with real-time data integration, error handling, and loading states.

## Project Structure (Monorepo)

```
mtg-price-tracker/
├── backend/                 # Express TypeScript API
│   ├── index.ts            # Main Express server and API endpoints
│   ├── package.json        # Backend dependencies  
│   ├── tsconfig.json       # TypeScript configuration
│   └── utils/
│       ├── scraper.ts      # TCGPlayer web scraping (TypeScript)
│       └── setNameUtils.ts # Set name utilities (TypeScript)
├── frontend/               # React TypeScript dashboard
│   ├── src/
│   │   ├── App.tsx         # Main dashboard component
│   │   ├── App.css         # Dashboard styling (vanilla CSS)
│   │   ├── PriceChart.tsx  # Chart.js price chart component  
│   │   ├── api.ts          # API client with TypeScript interfaces
│   │   ├── main.tsx        # React entry point
│   │   └── assets/         # Static assets
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.ts      # Vite build configuration
│   ├── tsconfig.json       # Frontend TypeScript config
│   ├── tsconfig.app.json   # App-specific TypeScript config
│   ├── tsconfig.node.json  # Node-specific TypeScript config
│   └── eslint.config.js    # ESLint configuration
└── CLAUDE.md               # This documentation file
```

## Backend Dependencies (TypeScript)

- **express**: Web server framework (v5.1.0)
- **axios**: HTTP client for API requests (v1.11.0)
- **puppeteer**: Headless browser for web scraping TCGPlayer (v24.16.0)
- **cheerio**: Server-side HTML parsing (v1.1.2)
- **cors**: Cross-origin resource sharing middleware (v2.8.5)
- **typescript**: TypeScript compiler (v5.9.2)
- **ts-node**: Run TypeScript directly (v10.9.2)
- **nodemon**: Development server with auto-restart (v3.1.10)
- **@types/express**: Express type definitions (v5.0.3)
- **@types/cors**: CORS type definitions (v2.8.19)

## Frontend Dependencies (React + Vite)

- **react**: UI library (v19.1.1)
- **react-dom**: React DOM rendering (v19.1.1)
- **vite**: Fast build tool and dev server (v7.1.2)
- **chart.js**: Charting library for price graphs (v4.5.0)
- **react-chartjs-2**: React wrapper for Chart.js (v5.3.0)
- **axios**: HTTP client for API calls (v1.11.0)
- **typescript**: TypeScript support (v5.8.3)
- **@vitejs/plugin-react**: React support for Vite (v5.0.0)
- **eslint**: Code linting (v9.33.0)

## API Endpoints

### GET /search/:setName

- **Purpose**: Main endpoint for retrieving collector booster display price data
- **Process**:
  1. Receives MTG set name as URL parameter
  2. Calls `scrapeCollectorBoosterId()` to find TCGPlayer product ID
  3. Fetches price history for the product ID found using default 'quarter' range
  4. Returns set name, product ID, and price history data
- **Response Format**: `{ setName, productId, priceHistory }`
- **Error Handling**: Returns 404 with error message if no collector booster display found
- **Location**: backend/index.ts:45-70

### GET /price-history/:productId

- **Purpose**: Dedicated endpoint for fetching price history by product ID with custom time ranges
- **Query Parameters**: `range` (defaults to 'quarter') - supports 'month', 'quarter', 'semi-annual', 'annual'
- **Response Format**: `{ productId, range, priceHistory }`
- **Validation**: Validates range parameter against allowed values
- **Location**: backend/index.ts:73-86

## Core Functions

### fetchPriceHistory(productId: string, range: PriceRange)

- **Purpose**: Fetches price history from TCGPlayer's infinite-api
- **API URL**: `https://infinite-api.tcgplayer.com/price/history/${productId}/detailed?range=${range}`
- **Supported Ranges**: 'month', 'quarter', 'semi-annual', 'annual'
- **Return Type**: `Record<string, any> | null`
- **Error Handling**: Returns null on failure, logs errors to console
- **Headers**: Includes User-Agent and Referer to mimic browser requests
- **Location**: backend/index.ts:19-38

### scrapeCollectorBoosterId(setName: string)

- **Purpose**: Scrapes TCGPlayer to find collector booster display product ID (returns single ID, not array)
- **Process**:
  1. Transforms set name using `transformSetName()`
  2. Builds search URL with TCGPlayer filters for Magic sealed products
  3. Uses Puppeteer to navigate and scrape results
  4. Parses HTML with Cheerio to extract product IDs
  5. Filters for "collector booster display" products (excludes "case" products)
- **Return Type**: `string | undefined`
- **Search URL**: Includes filters for product type and set name
- **Location**: backend/utils/scraper.ts:5-51

### transformSetName(setName: string)

- **Purpose**: Converts set names to TCGPlayer URL format
- **Transformations**: lowercase, remove apostrophes/colons, replace spaces with hyphens
- **Example**: "Wilds of Eldraine" → "wilds-of-eldraine"
- **Return Type**: `string`
- **Location**: backend/utils/setNameUtils.ts:1-7

## Key Implementation Details

### Web Scraping Strategy

- Uses Puppeteer headless browser to handle dynamic content
- Waits for `.search-results` selector with 10-second timeout to ensure page loads
- Searches for links containing `/product/` and filters by text content
- Extracts product IDs using regex pattern: `/\/product\/(\d+)\//`
- Returns first matching product ID (single string, not array)

### Error Handling

- Comprehensive try-catch blocks in all async functions
- Console logging for debugging with detailed error messages
- Returns `null`/`undefined` on failures instead of throwing
- Browser cleanup guaranteed in finally blocks
- API endpoint error responses with proper HTTP status codes (404 for not found)

### CORS Configuration

- **Production**: Configures CORS origin from `FRONTEND_URL` environment variable
- **Development**: Allows `http://localhost:5173` (Vite default port)
- **Automatic Environment Detection**: Uses `NODE_ENV` to determine configuration

### Search Filters Applied

- Product Line: Magic  
- Product Type: Sealed Products
- Set Name: Transformed set name in URL path
- Text Filter: "collector booster display" (excludes "case" products)
- Grid View: Optimized for scraping product information

## Frontend Dashboard Architecture

### React Components Structure

**App.tsx (Main Dashboard Component)**
- Manages selected MTG sets state (`selectedSets: string[]`)
- Manages time range state per set (`setRanges: Record<string, PriceRange>`)
- Handles adding/removing sets with validation and duplicate prevention
- Renders multiple PriceChart components in responsive CSS Grid layout
- Updates title to "MTG Collector Booster Display Price Tracker" for clarity
- **Location**: frontend/src/App.tsx

**PriceChart.tsx (Individual Chart Component)**
- **FULLY INTEGRATED** with backend API - no mock data
- Uses Chart.js with react-chartjs-2 wrapper for interactive price visualization
- Implements time range radio buttons (1M, 3M, 6M, 1Y) with real-time data fetching
- **Two-stage data fetching**: Initial load gets product ID, range changes fetch new data
- **Loading states**: Shows animated loading spinner during API calls
- **Error handling**: Displays user-friendly error messages for failed requests
- **Props**: `setName: string`, `range: PriceRange`, `onRangeChange: (range) => void`
- **Data processing**: Transforms TCGPlayer API response into Chart.js format
- **Location**: frontend/src/PriceChart.tsx

**api.ts (API Client Layer)**
- **Centralized API client** with TypeScript interfaces for all API responses
- **Base URL**: Configures backend connection to `http://localhost:3000`
- **Type Safety**: Comprehensive interfaces for TCGPlayer price data structures
- **Error Handling**: Axios error handling with user-friendly error messages
- **Methods**: `searchSet()` and `getPriceHistory()` with proper typing
- **Location**: frontend/src/api.ts

### TypeScript Integration

**Comprehensive Type System:**
```typescript
// Shared types between frontend and backend
type PriceRange = 'month' | 'quarter' | 'semi-annual' | 'annual'

// Complete TCGPlayer API response structure
interface PriceBucket {
  marketPrice: string;
  quantitySold: string;
  lowSalePrice: string;
  lowSalePriceWithShipping: string;
  highSalePrice: string;
  highSalePriceWithShipping: string;
  transactionCount: string;
  bucketStartDate: string;
}

interface PriceResult {
  skuId: string;
  variant: string;
  language: string;
  condition: string;
  buckets: PriceBucket[];
  // ... additional fields
}

interface TCGPlayerPriceHistory {
  count: number;
  result: PriceResult[];
}
```

**State Management:**
- `selectedSets: string[]` - Array of MTG set names
- `setRanges: Record<string, PriceRange>` - Maps set name to selected time range
- `priceData: TCGPlayerPriceHistory | null` - Strongly typed API responses
- `loading: boolean` and `error: string | null` for UI state management
- React hooks with complete TypeScript typing throughout

### Styling Approach

- **Vanilla CSS** - No framework dependencies for maximum control
- **Modern CSS Features**: Flexbox, CSS Grid, CSS transitions, keyframe animations
- **Responsive Design**: Grid layout with `auto-fit` and `600px` minimum chart width
- **Component Styling**: Modular CSS classes for dashboard, charts, loading, and error states
- **Professional UI**: Blue/gray palette with subtle shadows and hover effects
- **Loading Animation**: Custom dual-ring CSS spinner with smooth rotation
- **Full Viewport Design**: Dashboard uses full viewport width with proper padding

### Chart Implementation

**Chart.js Configuration with Real Data:**
- **Line charts** displaying actual TCGPlayer price history
- **Data Processing**: Transforms TCGPlayer buckets into chronological price points
- **Date Formatting**: Converts ISO dates to readable `toLocaleDateString()` format
- **Price Parsing**: Converts string prices to numbers for chart display
- **Responsive design** with `maintainAspectRatio: false` for consistent sizing
- **Time range buttons** trigger new API calls for different data ranges

**Chart Features:**
- **Y-axis optimization**: `beginAtZero: false` for better price visualization
- **Smooth curves**: `tension: 0.1` for pleasant line interpolation  
- **Professional styling**: Teal color scheme with transparency
- **Dynamic titles**: Updates chart title with set name and selected time range
- **Interactive tooltips**: Shows exact prices with Chart.js built-in tooltips
- **Chronological order**: Reverses TCGPlayer data to show oldest-to-newest progression

## Development Commands

### Backend (TypeScript Express API)
```bash
cd backend/
npm install          # Install dependencies
npm start           # Run with nodemon (ts-node)
npm run build       # Compile TypeScript to JavaScript
npm run dev         # Run with ts-node directly
```

### Frontend (React + Vite)
```bash
cd frontend/
npm install         # Install dependencies  
npm run dev         # Start development server (http://localhost:5173)
npm run build       # Build for production
npm run preview     # Preview production build
```

## Server Configuration

**Backend:**
- **Port**: 3000
- **Type**: ES modules with TypeScript
- **Dev Server**: Nodemon with ts-node

**Frontend:**
- **Dev Port**: 5173 (Vite default)
- **Build Tool**: Vite (fast HMR, modern bundling)
- **TypeScript**: Strict mode enabled

## Current Development State

### ✅ FULLY IMPLEMENTED FEATURES (Production Ready)

1. **Complete Full-Stack Integration**: Backend and frontend fully connected with real-time data
2. **TypeScript Throughout**: 100% TypeScript with comprehensive type definitions for all API responses
3. **Live TCGPlayer Data**: Real collector booster display price data from TCGPlayer scraping
4. **Interactive Dashboard**: Multi-set price tracking with individual time range controls per chart
5. **Professional UI/UX**: Polished interface with loading states, error handling, and responsive design  
6. **CORS Configuration**: Proper production/development environment handling
7. **Error Handling**: Comprehensive error management from scraping failures to API timeouts
8. **Loading States**: Animated loading spinners during data fetching operations
9. **Data Processing**: Complete transformation of TCGPlayer API data into Chart.js format
10. **Multiple Time Ranges**: Functional 1M, 3M, 6M, 1Y range selection with live data updates

### 🎯 CURRENT CAPABILITIES

- **Search MTG Sets**: Enter any MTG set name (e.g., "Foundations", "Wilds of Eldraine")
- **Real Price Data**: Displays actual collector booster display prices from TCGPlayer
- **Multi-Set Tracking**: Add multiple sets simultaneously, each with independent controls
- **Time Range Selection**: Switch between month/quarter/semi-annual/annual views
- **Live Data Updates**: Time range changes trigger fresh API calls for new data
- **Error Recovery**: Clear error messages when sets aren't found or scraping fails

### 🔄 POTENTIAL ENHANCEMENTS (Optional Improvements)

1. **Performance Optimizations**
   - Add caching layer to reduce redundant TCGPlayer requests  
   - Implement rate limiting to be respectful to TCGPlayer's servers
   - Add request debouncing for rapid range changes

2. **Advanced Features**
   - Price change alerts/notifications
   - Historical price comparison tools
   - Export data functionality (CSV/JSON)
   - Set price prediction based on historical trends

3. **Production Deployment**
   - Environment configuration for production hosting
   - Database integration for caching scraped data
   - Monitoring and logging infrastructure

### 🚀 PLANNED FEATURES (User Requested)

1. **Global Time Range Controls**
   - Add global time range buttons (1M, 3M, 6M, 1Y) that control all charts simultaneously
   - Keep existing individual chart controls for per-chart customization
   - Global buttons should update all charts to display the selected time range
   - Implementation would involve adding global state to App component and handler to update all chart ranges at once

2. **Persistent Dashboard State (localStorage)**
   - **Use Case**: Personal inventory tracker - save selected sets between browser sessions
   - **Data Stored**: Set name, product ID, and time range preferences in browser localStorage
   - **Benefits**: Fast startup (skip 30-second scraping for known sets), persistent user dashboard
   - **Implementation**: Save on set add/remove, restore on app load
   - **Storage Format**: `{selectedSets: [{name, productId, range}, ...]}`
   - **Reliability**: High - product IDs rarely change, falls back to scraping if needed
   - **Scope**: Single-user, browser-specific persistence

3. **Advanced Caching System (SQLite + In-Memory) - Future Consideration**
   - **Use Case**: Multi-user deployment - pre-scrape all 46 collector booster display sets
   - **Architecture**: Hybrid SQLite database + in-memory cache for optimal performance
   - **Database Schema**: Sets table with name, product_id, created_at, updated_at
   - **Performance**: Cache hits ~1ms, SQLite queries ~5ms, scraping fallback ~30s
   - **Benefits**: Universal product ID storage, cross-user sharing, survives deployments
   - **Implementation Strategy**: 
     - Phase 1: Pre-scrape 46 existing sets (spread over days to avoid rate limiting)
     - Phase 2: Add 4-6 new sets annually as released
     - Phase 3: Scheduled re-scraping for data freshness
   - **When to Consider**: If distributing app to multiple users or building comprehensive MTG data service

### 📋 Architecture Decisions & Design Choices

**Backend Architecture:**
- **Express + TypeScript**: Chose Express over alternatives for simplicity and familiarity
- **Puppeteer Scraping**: Necessary for dynamic content on TCGPlayer (JavaScript-rendered)
- **Single Product ID**: Returns first matching collector booster display (focused scope)
- **ES Modules**: Modern module system with TypeScript compilation
- **CORS Middleware**: Proper cross-origin handling for development/production

**Frontend Architecture:**
- **React + Vite**: Chosen over Next.js to maintain existing Express backend separation
- **Vanilla CSS**: Chosen over frameworks (Tailwind/Bootstrap) for full control and simplicity  
- **Chart.js**: Industry standard charting library with excellent React integration
- **Local State Management**: React hooks sufficient for current application complexity
- **CSS Grid + Flexbox**: Modern layout techniques for responsive design
- **TypeScript Strict Mode**: Full type safety throughout frontend and API layer

**Data Flow Design:**
- **Two-Stage Fetching**: Initial load gets product ID, range changes fetch new price data
- **Optimistic UI**: Shows loading states immediately while preserving user selection
- **Error Boundaries**: Component-level error handling doesn't crash entire dashboard

### 🔧 Production Development Workflow

**Current Working Setup:**
1. **Backend**: `cd backend && npm start` (runs Express API on port 3000)
2. **Frontend**: `cd frontend && npm run dev` (runs Vite dev server on port 5173)
3. **CORS**: Fully configured and working between frontend and backend
4. **Real-Time Development**: Both servers can run simultaneously with hot reload

**Ready for Production:**
- TypeScript compilation works (`npm run build`)
- CORS configured for production environment variables
- Error handling covers edge cases and network failures
- Loading states provide good UX during scraping operations
