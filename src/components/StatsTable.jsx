import { useState } from 'react'

const BATTING_COLS = [
  { key: 'name', label: 'Player', sortable: false },
  { key: 'gp', label: 'GP' },
  { key: 'ab', label: 'AB' },
  { key: 'r', label: 'R' },
  { key: 'h', label: 'H' },
  { key: 'rbi', label: 'RBI' },
  { key: 'doubles', label: '2B' },
  { key: 'triples', label: '3B' },
  { key: 'hr', label: 'HR' },
  { key: 'bb', label: 'BB' },
  { key: 'k', label: 'K' },
  { key: 'sb', label: 'SB' },
  { key: 'ba', label: 'AVG', highlight: true },
  { key: 'obp', label: 'OBP' },
  { key: 'slg', label: 'SLG' },
  { key: 'ops', label: 'OPS', highlight: true },
]

const PITCHING_COLS = [
  { key: 'name', label: 'Player', sortable: false },
  { key: 'app', label: 'APP' },
  { key: 'w', label: 'W' },
  { key: 'l', label: 'L' },
  { key: 'sv', label: 'SV' },
  { key: 'ip', label: 'IP' },
  { key: 'h', label: 'H' },
  { key: 'r', label: 'R' },
  { key: 'er', label: 'ER' },
  { key: 'bb', label: 'BB' },
  { key: 'k', label: 'K' },
  { key: 'era', label: 'ERA', highlight: true },
  { key: 'whip', label: 'WHIP', highlight: true },
]

function SortIcon({ direction }) {
  if (!direction) return <span className="text-gray-700 ml-1">⇅</span>
  return <span className="ml-1" style={{ color: '#FFD700' }}>{direction === 'asc' ? '↑' : '↓'}</span>
}

export default function StatsTable({ battingStats, pitchingStats, players, season }) {
  const [tab, setTab] = useState('batting')
  const [sortKey, setSortKey] = useState(tab === 'batting' ? 'ba' : 'era')
  const [sortDir, setSortDir] = useState('desc')

  const handleSort = (key) => {
    if (key === 'name') return
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      // ERA and WHIP sort ascending by default (lower = better)
      setSortDir(key === 'era' || key === 'whip' ? 'asc' : 'desc')
    }
  }

  const switchTab = (newTab) => {
    setTab(newTab)
    setSortKey(newTab === 'batting' ? 'ba' : 'era')
    setSortDir(newTab === 'batting' ? 'desc' : 'asc')
  }

  const getPlayerName = (playerId) => {
    const p = players.find(p => p.id === playerId)
    return p ? p.name : 'Unknown'
  }

  const getPlayerNumber = (playerId) => {
    const p = players.find(p => p.id === playerId)
    return p ? p.number : ''
  }

  const sortedBatting = [...battingStats]
    .filter(s => !season || s.season_id === season?.id)
    .sort((a, b) => {
      if (sortKey === 'name') return 0
      const av = parseFloat(a[sortKey]) || 0
      const bv = parseFloat(b[sortKey]) || 0
      return sortDir === 'asc' ? av - bv : bv - av
    })

  const sortedPitching = [...pitchingStats]
    .filter(s => (!season || s.season_id === season?.id) && (s.app > 0 || parseFloat(s.ip) > 0))
    .sort((a, b) => {
      if (sortKey === 'name') return 0
      const av = parseFloat(a[sortKey]) || 0
      const bv = parseFloat(b[sortKey]) || 0
      return sortDir === 'asc' ? av - bv : bv - av
    })

  const cols = tab === 'batting' ? BATTING_COLS : PITCHING_COLS
  const rows = tab === 'batting' ? sortedBatting : sortedPitching

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-2 mb-4">
        {['batting', 'pitching'].map(t => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`px-5 py-2 rounded-lg font-display font-bold uppercase tracking-wide text-sm transition-all ${
              tab === t
                ? 'text-black'
                : 'text-gray-400 hover:text-white bg-white/5'
            }`}
            style={tab === t ? { backgroundColor: '#FFD700' } : {}}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#0d180d' }}>
              {cols.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-3 py-3 text-left font-display font-bold uppercase tracking-wider text-xs whitespace-nowrap ${
                    col.sortable !== false ? 'cursor-pointer hover:text-yellow-400' : ''
                  } ${col.highlight ? 'text-yellow-400' : 'text-gray-500'}`}
                >
                  {col.label}
                  {col.sortable !== false && <SortIcon direction={sortKey === col.key ? sortDir : null} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={cols.length} className="text-center py-8 text-gray-600">
                  No stats available yet
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr
                key={row.id}
                className="border-t border-white/5 hover:bg-white/5 transition-colors"
                style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}
              >
                {cols.map(col => (
                  <td
                    key={col.key}
                    className={`px-3 py-2.5 whitespace-nowrap ${col.highlight ? 'font-bold' : ''}`}
                    style={col.highlight ? { color: '#FFD700' } : {}}
                  >
                    {col.key === 'name' ? (
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center text-xs text-gray-600">#{getPlayerNumber(row.player_id)}</span>
                        <span className="text-white font-medium">{getPlayerName(row.player_id)}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300">{row[col.key] ?? '—'}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
