import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Roster from './pages/Roster'
import Gallery from './pages/Gallery'
import SchedulePage from './pages/SchedulePage'
import StatsPage from './pages/StatsPage'
import PlayerProfile from './pages/PlayerProfile'
import { fetchAllData } from './lib/queries'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#0a0f0a' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6 animate-pulse" style={{ backgroundColor: '#006633', color: '#FFD700' }}>
        NT
      </div>
      <div className="font-display font-bold text-white text-xl tracking-widest uppercase mb-2">Nova Titans</div>
      <div className="text-gray-600 text-sm">Loading season data...</div>
    </div>
  )
}

function ErrorScreen({ errors }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ backgroundColor: '#0a0f0a' }}>
      <div className="text-4xl mb-4">⚠️</div>
      <div className="font-display font-bold text-white text-xl mb-2">Failed to load data</div>
      <div className="text-gray-500 text-sm text-center max-w-md mb-4">
        Could not connect to Supabase. Make sure you have run the schema migration and the database is accessible.
      </div>
      {errors.map((e, i) => (
        <div key={i} className="text-red-400 text-xs bg-red-900/20 px-4 py-2 rounded mb-2 max-w-md w-full">
          {e.message}
        </div>
      ))}
    </div>
  )
}

// Empty data structure for when DB is not yet populated
const EMPTY_DATA = {
  teamInfo: {},
  seasons: [],
  games: [],
  players: [],
  battingStats: [],
  pitchingStats: [],
  photos: [],
  articles: [],
  errors: [],
}

export default function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fatalError, setFatalError] = useState(null)

  useEffect(() => {
    fetchAllData()
      .then(result => {
        // Non-fatal errors (table not found = DB not migrated yet)
        // Still render the app with empty data
        if (result.errors.length > 0) {
          const isMissingTable = result.errors.some(e =>
            e.message?.includes('does not exist') || e.code === '42P01'
          )
          if (isMissingTable) {
            setData(EMPTY_DATA)
          } else {
            setFatalError(result.errors)
          }
        } else {
          setData(result)
        }
      })
      .catch(err => {
        setFatalError([err])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) return <LoadingScreen />
  if (fatalError) return <ErrorScreen errors={fatalError} />

  const pageData = data || EMPTY_DATA

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home data={pageData} />} />
          <Route path="/roster" element={<Roster data={pageData} />} />
          <Route path="/gallery" element={<Gallery data={pageData} />} />
          <Route path="/schedule" element={<SchedulePage data={pageData} />} />
          <Route path="/stats" element={<StatsPage data={pageData} />} />
          <Route path="/player/:id" element={<PlayerProfile data={pageData} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
