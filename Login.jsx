import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DEMO_PASSWORD, useApp } from '../context/AppContext'

// Flat line with periodic QRS spikes, drawn once and animated with stroke-dashoffset.
const ECG =
  'M0 120 H120 L135 120 L145 100 L155 120 H230 L245 120 L255 40 L270 190 L285 120 H360 L375 120 L390 95 L405 120 H520 ' +
  'L535 120 L545 100 L555 120 H630 L645 120 L655 40 L670 190 L685 120 H760 L775 120 L790 95 L805 120 H920 L935 120 L945 100 L955 120 H1030 L1045 120 L1055 40 L1070 190 L1085 120 H1200'

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (login(username, password)) navigate('/')
    else setError('Username or password is incorrect. Check the demo details below the form.')
  }

  return (
    <div className="grid min-h-full md:grid-cols-2">
      <section className="relative flex flex-col justify-between overflow-hidden bg-ink p-8 text-white md:p-12">
        <div>
          <p className="text-3xl font-extrabold leading-tight">Sanjeevani Hospital</p>
          <p className="mt-2 max-w-sm text-white/70">Live vitals for every admitted patient, with alerts the moment a reading leaves its safe range.</p>
        </div>
        <svg viewBox="0 0 1200 240" className="mt-10 w-full" role="img" aria-label="Animated heartbeat trace">
          <path d={ECG} fill="none" stroke="#5FD3C8" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" className="ecg-line" />
        </svg>
        <p className="text-sm text-white/50">Course project BT209 · Simulated data, no real patients</p>
      </section>

      <section className="flex items-center justify-center p-6 md:p-12">
        <form onSubmit={submit} className="w-full max-w-sm space-y-4">
          <div>
            <h1 className="text-2xl font-extrabold">Doctor sign in</h1>
            <p className="text-sm text-ink/60">Use your hospital username to open the ward.</p>
          </div>
          <div>
            <label className="label" htmlFor="u">Username</label>
            <input id="u" className="field" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
          </div>
          <div>
            <label className="label" htmlFor="p">Password</label>
            <input id="p" type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>
          {error && <p role="alert" className="rounded-md bg-coral-soft p-3 text-sm text-coral">{error}</p>}
          <button className="btn-primary w-full" type="submit">Sign in</button>
          <div className="rounded-md bg-teal-soft p-3 text-sm">
            <p className="font-bold">Demo account</p>
            <p>Username: <code className="font-bold">ayush.sahu</code></p>
            <p>Password: <code className="font-bold">{DEMO_PASSWORD}</code></p>
            <button type="button" className="mt-2 text-sm font-bold text-teal-dark underline" onClick={() => { setUsername('ayush.sahu'); setPassword(DEMO_PASSWORD) }}>
              Fill in demo details
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
