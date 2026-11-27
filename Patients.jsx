import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Badge, Empty, PageTitle } from '../components/ui'
import { overallLevel } from '../lib/vitals'
import { fmtDate } from '../lib/format'

export default function Patients() {
  const { patients, live } = useApp()
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('Admitted')

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return patients.filter(
      (p) => p.status === tab && (!s || [p.name, p.id, p.bed, p.diagnosis].some((x) => x.toLowerCase().includes(s)))
    )
  }, [patients, q, tab])

  return (
    <>
      <PageTitle title="Patients">
        <Link to="/patients/new" className="btn-primary">Admit patient</Link>
      </PageTitle>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div role="tablist" className="flex rounded-md border border-line bg-white p-1">
          {['Admitted', 'Discharged'].map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              className={`rounded px-3 py-1 text-sm font-bold ${tab === t ? 'bg-teal text-white' : 'text-ink/70'}`}>{t}</button>
          ))}
        </div>
        <label className="sr-only" htmlFor="search">Search patients</label>
        <input id="search" className="field max-w-xs" placeholder="Search by name, ID, bed or diagnosis" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {list.length === 0 ? (
        <Empty>{q ? 'No patients match your search.' : `No ${tab.toLowerCase()} patients.`}</Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-ink/60">
              <tr>
                {['Patient', 'ID', 'Bed', 'Diagnosis', tab === 'Admitted' ? 'Admitted' : 'Discharged', 'Status'].map((h) => (
                  <th key={h} className="p-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-mist/60">
                  <td className="p-3">
                    <Link to={`/patients/${p.id}`} className="font-bold text-teal-dark hover:underline">{p.name}</Link>
                    <div className="text-xs text-ink/60">{p.age} yrs · {p.gender}</div>
                  </td>
                  <td className="p-3">{p.id}</td>
                  <td className="p-3">{p.status === 'Admitted' ? p.bed : '–'}</td>
                  <td className="p-3">{p.diagnosis}</td>
                  <td className="p-3">{fmtDate(tab === 'Admitted' ? p.admittedOn : p.dischargedOn)}</td>
                  <td className="p-3">{p.status === 'Admitted' ? <Badge level={overallLevel(live[p.id]?.current)} /> : <span className="text-ink/60">Discharged</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
