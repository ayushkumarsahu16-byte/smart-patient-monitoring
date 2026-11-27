import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PageTitle } from '../components/ui'
import { WARDS } from '../data/seed'
import { overallLevel } from '../lib/vitals'

const ring = ['border-ok', 'border-amber', 'border-coral']

export default function Beds() {
  const { patients, live } = useApp()
  const byBed = Object.fromEntries(patients.filter((p) => p.status === 'Admitted').map((p) => [p.bed, p]))

  return (
    <>
      <PageTitle title="Beds">
        <span className="text-sm text-ink/60">Border colour shows each patient’s current status</span>
      </PageTitle>
      <div className="space-y-8">
        {WARDS.map((w) => {
          const beds = Array.from({ length: w.beds }, (_, i) => `${w.id}-${String(i + 1).padStart(2, '0')}`)
          const used = beds.filter((b) => byBed[b]).length
          return (
            <section key={w.id} aria-labelledby={`w-${w.id}`}>
              <h2 id={`w-${w.id}`} className="mb-2 text-lg font-bold">{w.name} <span className="text-sm font-medium text-ink/60">{used} of {w.beds} occupied</span></h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
                {beds.map((b) => {
                  const p = byBed[b]
                  return p ? (
                    <Link key={b} to={`/patients/${p.id}`} className={`rounded-lg border-2 bg-white p-3 text-sm ${ring[overallLevel(live[p.id]?.current)]}`}>
                      <p className="text-xs text-ink/60">Bed {b}</p>
                      <p className="font-bold">{p.name}</p>
                      <p className="text-xs text-ink/60">{p.condition}</p>
                    </Link>
                  ) : (
                    <div key={b} className="rounded-lg border-2 border-dashed border-line p-3 text-sm text-ink/50">
                      <p className="text-xs">Bed {b}</p>
                      <p className="font-semibold">Free</p>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}
