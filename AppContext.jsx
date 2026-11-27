import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { SEED_PATIENTS } from '../data/seed'
import { BASELINES, METRICS, levelOf, nextVitals } from '../lib/vitals'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

const DOCTOR = { name: 'Dr. Ayush Sahu', role: 'Consultant Physician', username: 'ayush.sahu' }
export const DEMO_PASSWORD = 'doctor123'

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage unavailable */ }
}
const uid = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => load('spms.user', null))
  const [patients, setPatients] = useState(() => load('spms.patients', SEED_PATIENTS))
  const [alerts, setAlerts] = useState([])
  const [live, setLive] = useState({}) // patientId -> { current, history }

  const patientsRef = useRef(patients)
  const liveRef = useRef({})
  const lastLevel = useRef({})

  useEffect(() => { patientsRef.current = patients; save('spms.patients', patients) }, [patients])
  useEffect(() => { save('spms.user', user) }, [user])

  // Simulated vitals feed. Replace with connectVitalsSocket() once the backend exists.
  useEffect(() => {
    const tick = () => {
      const next = {}
      const fresh = []
      patientsRef.current.filter((p) => p.status === 'Admitted').forEach((p) => {
        const base = BASELINES[p.condition] ?? BASELINES.Stable
        let prev = liveRef.current[p.id]
        if (!prev) {
          // Prefill a short history so charts are never empty.
          let cur = { ...base }
          const history = []
          for (let i = 20; i > 0; i--) {
            cur = nextVitals(cur, base)
            history.push({ t: Date.now() - i * 2000, ...cur })
          }
          prev = { current: cur, history }
        }
        const current = nextVitals(prev.current, base)
        const history = [...prev.history, { t: Date.now(), ...current }].slice(-40)
        next[p.id] = { current, history }

        Object.keys(METRICS).forEach((m) => {
          const lvl = levelOf(m, current[m])
          const key = `${p.id}:${m}`
          const was = lastLevel.current[key] ?? 0
          if (lvl > 0 && lvl > was) {
            fresh.push({
              id: uid('a'), patientId: p.id, patientName: p.name, bed: p.bed,
              metric: m, value: current[m], level: lvl, at: Date.now(), acked: false,
            })
          }
          lastLevel.current[key] = lvl
        })
      })
      liveRef.current = next
      setLive(next)
      if (fresh.length) setAlerts((a) => [...fresh, ...a].slice(0, 200))
    }
    tick()
    const id = setInterval(tick, 2000)
    return () => clearInterval(id)
  }, [])

  const login = useCallback((username, password) => {
    if (username.trim().toLowerCase() === DOCTOR.username && password === DEMO_PASSWORD) {
      setUser(DOCTOR)
      return true
    }
    return false
  }, [])
  const logout = useCallback(() => setUser(null), [])

  const addPatient = useCallback((data) => {
    const num = patientsRef.current.length + 1001
    const patient = {
      ...data,
      id: `P-${num}`,
      status: 'Admitted',
      admittedOn: new Date().toISOString(),
      doctor: DOCTOR.name,
      medications: data.medications ?? [],
      notes: [],
    }
    setPatients((list) => [patient, ...list])
    return patient.id
  }, [])

  const update = (id, fn) => setPatients((list) => list.map((p) => (p.id === id ? fn(p) : p)))

  const dischargePatient = useCallback((id) => {
    update(id, (p) => ({ ...p, status: 'Discharged', dischargedOn: new Date().toISOString() }))
    setAlerts((a) => a.map((x) => (x.patientId === id ? { ...x, acked: true } : x)))
  }, [])
  const addNote = useCallback((id, text) =>
    update(id, (p) => ({ ...p, notes: [{ id: uid('n'), at: new Date().toISOString(), by: DOCTOR.name, text }, ...p.notes] })), [])
  const addMedication = useCallback((id, med) =>
    update(id, (p) => ({ ...p, medications: [...p.medications, { id: uid('m'), given: false, ...med }] })), [])
  const toggleMedication = useCallback((id, medId) =>
    update(id, (p) => ({ ...p, medications: p.medications.map((m) => (m.id === medId ? { ...m, given: !m.given } : m)) })), [])
  const removeMedication = useCallback((id, medId) =>
    update(id, (p) => ({ ...p, medications: p.medications.filter((m) => m.id !== medId) })), [])

  const ackAlert = useCallback((id) => setAlerts((a) => a.map((x) => (x.id === id ? { ...x, acked: true } : x))), [])
  const ackAll = useCallback(() => setAlerts((a) => a.map((x) => ({ ...x, acked: true }))), [])

  const resetDemo = useCallback(() => {
    liveRef.current = {}
    lastLevel.current = {}
    setAlerts([])
    setPatients(SEED_PATIENTS)
  }, [])

  const value = useMemo(
    () => ({
      user, login, logout, patients, live, alerts,
      addPatient, dischargePatient, addNote, addMedication, toggleMedication, removeMedication,
      ackAlert, ackAll, resetDemo,
    }),
    [user, login, logout, patients, live, alerts, addPatient, dischargePatient, addNote, addMedication,
      toggleMedication, removeMedication, ackAlert, ackAll, resetDemo]
  )
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
