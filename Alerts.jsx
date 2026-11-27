import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Empty, PageTitle } from '../components/ui'
import { LEVEL_BG, METRICS } from '../lib/vitals'
import { fmtTime } from '../lib/format'

export default function Alerts() {
  const { alerts, ackAlert, ackAll } = useApp()
  const [showAcked, setShowAcked] = useState(false)
  const list = alerts.filter((a) => showAcked || !a.acked)
  const open = alerts.filter((a) => !a.acked).length

  return (
    <>
      <PageTitle title="Alerts">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showAcked} onChange={(e) => setShowAcked(e.target.checked)} /> Show acknowledged
          </label>
          <button className="btn-quiet" disabled={open === 0} onClick={ackAll}>Acknowledge all</button>
        </div>
      </PageTitle>
      {list.length === 0 ? (
        <Empty>No open alerts. New ones appear here when a reading leaves its safe range.</Empty>
      ) : (
        <ul className="space-y-2">
          {list.map((a) => (
            <li key={a.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-4 text-sm ${a.acked ? 'opacity-60' : ''}`}>
              <div>
                <p>
                  <Link to={`/patients/${a.patientId}`} className="font-bold hover:underline">{a.patientName}</Link>
                  <span className="text-ink/60"> · Bed {a.bed}</span>
                </p>
                <p>{METRICS[a.metric].label} reached <strong>{a.value} {METRICS[a.metric].unit}</strong></p>
                <p className="text-xs text-ink/50">{fmtTime(a.at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${LEVEL_BG[a.level]}`}>{a.level === 2 ? 'Critical' : 'Warning'}</span>
                {!a.acked && <button className="btn-quiet !py-1" onClick={() => ackAlert(a.id)}>Acknowledge</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
