import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApp } from '../context/AppContext'
import { Badge, Empty, VitalValue } from '../components/ui'
import { METRICS, levelOf, overallLevel, LEVEL_TEXT } from '../lib/vitals'
import { fmtDate, fmtDateTime, fmtTime, fmtValue } from '../lib/format'
import { wardOfBed } from '../data/seed'

const TABS = ['Medications', 'Notes', 'Profile']

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { patients, live, addNote, addMedication, toggleMedication, removeMedication, dischargePatient } = useApp()
  const [metric, setMetric] = useState('hr')
  const [tab, setTab] = useState('Medications')
  const [note, setNote] = useState('')
  const [med, setMed] = useState({ name: '', dose: '', frequency: '' })

  const p = patients.find((x) => x.id === id)
  if (!p) {
    return (
      <Empty>
        Patient not found. <Link to="/patients" className="font-bold text-teal-dark underline">Back to patients</Link>
      </Empty>
    )
  }

  const admitted = p.status === 'Admitted'
  const data = live[p.id]
  const cur = data?.current
  const chartData = (data?.history ?? []).map((h) => ({ time: fmtTime(h.t), value: h[metric] }))

  const submitNote = (e) => {
    e.preventDefault()
    if (!note.trim()) return
    addNote(p.id, note.trim())
    setNote('')
  }
  const submitMed = (e) => {
    e.preventDefault()
    if (!med.name.trim()) return
    addMedication(p.id, { name: med.name.trim(), dose: med.dose.trim() || '–', frequency: med.frequency.trim() || '–' })
    setMed({ name: '', dose: '', frequency: '' })
  }
  const discharge = () => {
    if (confirm(`Discharge ${p.name}? Bed ${p.bed} will be freed.`)) {
      dischargePatient(p.id)
      navigate('/patients')
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/patients" className="text-sm font-bold text-teal-dark underline">All patients</Link>
          <h1 className="mt-1 text-2xl font-extrabold">{p.name}</h1>
          <p className="text-sm text-ink/70">
            {p.id} · {p.age} yrs · {p.gender} · {p.bloodGroup} · {admitted ? `Bed ${p.bed}, ${wardOfBed(p.bed)}` : 'Discharged'}
          </p>
          <p className="mt-1 text-sm">{p.diagnosis}</p>
          {p.allergies && p.allergies !== 'None known' && (
            <p className="mt-2 inline-block rounded-md bg-coral-soft px-2 py-1 text-sm font-bold text-coral">Allergies: {p.allergies}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {admitted && <Badge level={overallLevel(cur)} />}
          {admitted && <button className="btn-danger" onClick={discharge}>Discharge patient</button>}
        </div>
      </div>

      {admitted && (
        <section aria-label="Live vitals" className="mb-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {Object.keys(METRICS).map((m) => {
              const lvl = cur ? levelOf(m, cur[m]) : 0
              return (
                <button key={m} onClick={() => setMetric(m)} aria-pressed={metric === m}
                  className={`rounded-lg border-2 bg-white p-3 text-left ${metric === m ? 'border-teal' : 'border-transparent'}`}>
                  <p className="text-xs text-ink/60">{METRICS[m].label}</p>
                  <p className={`text-3xl font-extrabold tabular-nums ${cur ? LEVEL_TEXT[lvl] : ''}`}>
                    {cur ? fmtValue(cur[m], METRICS[m].decimals) : '–'}
                  </p>
                  <p className="text-xs text-ink/60">{METRICS[m].unit}</p>
                </button>
              )
            })}
          </div>
          <div className="mt-3 rounded-lg bg-white p-4">
            <h2 className="mb-2 text-sm font-bold">{METRICS[metric].label}, last {chartData.length * 2} seconds</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid stroke="#D5E0E0" strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={40} />
                  <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" name={METRICS[metric].short} stroke="#0F7C7A" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      <div role="tablist" className="mb-4 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-bold ${tab === t ? 'border-teal text-teal-dark' : 'border-transparent text-ink/60'}`}>{t}</button>
        ))}
      </div>

      {tab === 'Medications' && (
        <section>
          {p.medications.length === 0 ? <Empty>No medications recorded.</Empty> : (
            <ul className="space-y-2">
              {p.medications.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white p-3 text-sm">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={m.given} disabled={!admitted} onChange={() => toggleMedication(p.id, m.id)} />
                    <span className={m.given ? 'text-ink/50 line-through' : ''}>
                      <strong>{m.name}</strong> · {m.dose} · {m.frequency}
                    </span>
                  </label>
                  {admitted && <button className="text-xs font-bold text-coral underline" onClick={() => removeMedication(p.id, m.id)}>Remove</button>}
                </li>
              ))}
            </ul>
          )}
          {admitted && (
            <form onSubmit={submitMed} className="mt-4 grid gap-2 rounded-lg bg-white p-4 md:grid-cols-4">
              <div>
                <label className="label" htmlFor="mn">Medicine</label>
                <input id="mn" className="field" value={med.name} onChange={(e) => setMed({ ...med, name: e.target.value })} required />
              </div>
              <div>
                <label className="label" htmlFor="md">Dose</label>
                <input id="md" className="field" placeholder="e.g. 500 mg" value={med.dose} onChange={(e) => setMed({ ...med, dose: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="mf">How often</label>
                <input id="mf" className="field" placeholder="e.g. Twice daily" value={med.frequency} onChange={(e) => setMed({ ...med, frequency: e.target.value })} />
              </div>
              <div className="flex items-end"><button className="btn-primary w-full" type="submit">Add medicine</button></div>
            </form>
          )}
        </section>
      )}

      {tab === 'Notes' && (
        <section>
          {admitted && (
            <form onSubmit={submitNote} className="mb-4 rounded-lg bg-white p-4">
              <label className="label" htmlFor="note">New clinical note</label>
              <textarea id="note" rows={3} className="field" value={note} onChange={(e) => setNote(e.target.value)} />
              <button className="btn-primary mt-2" type="submit" disabled={!note.trim()}>Save note</button>
            </form>
          )}
          {p.notes.length === 0 ? <Empty>No notes yet.</Empty> : (
            <ul className="space-y-2">
              {p.notes.map((n) => (
                <li key={n.id} className="rounded-lg bg-white p-4 text-sm">
                  <p>{n.text}</p>
                  <p className="mt-1 text-xs text-ink/60">{n.by} · {fmtDateTime(n.at)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'Profile' && (
        <dl className="grid gap-x-8 gap-y-3 rounded-lg bg-white p-5 text-sm md:grid-cols-2">
          {[
            ['Phone', p.phone],
            ['Emergency contact', `${p.emergencyName} (${p.emergencyRelation})`],
            ['Emergency phone', p.emergencyPhone],
            ['Allergies', p.allergies || 'None known'],
            ['Clinical condition', p.condition],
            ['Admitted', fmtDate(p.admittedOn)],
            ['Attending doctor', p.doctor],
            ...(p.dischargedOn ? [['Discharged', fmtDate(p.dischargedOn)]] : []),
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-ink/60">{k}</dt>
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </>
  )
}
