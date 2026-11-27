import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PageTitle } from '../components/ui'
import { WARDS, allBeds, wardOfBed } from '../data/seed'

const BLOOD = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const empty = {
  name: '', age: '', gender: 'Male', bloodGroup: 'O+', phone: '',
  emergencyName: '', emergencyPhone: '', emergencyRelation: '',
  diagnosis: '', allergies: '', bed: '', condition: 'Stable',
  medName: '', medDose: '', medFrequency: '',
}

function Field({ k, label, children, hint, errors }) {
  return (
    <div>
      <label className="label" htmlFor={`f-${k}`}>{label}</label>
      {children}
      {hint && !errors[k] && <p className="mt-1 text-xs text-ink/60">{hint}</p>}
      {errors[k] && <p className="mt-1 text-xs font-semibold text-coral">{errors[k]}</p>}
    </div>
  )
}

export default function AddPatient() {
  const { patients, addPatient } = useApp()
  const navigate = useNavigate()
  const [f, setF] = useState(empty)
  const [errors, setErrors] = useState({})

  const taken = new Set(patients.filter((p) => p.status === 'Admitted').map((p) => p.bed))
  const freeBeds = allBeds().filter((b) => !taken.has(b))
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const validate = () => {
    const e = {}
    if (!f.name.trim()) e.name = 'Enter the patient’s full name.'
    const age = Number(f.age)
    if (!f.age || !Number.isInteger(age) || age < 0 || age > 120) e.age = 'Enter an age between 0 and 120.'
    if (!/^\d{10}$/.test(f.phone)) e.phone = 'Enter a 10-digit phone number.'
    if (!f.emergencyName.trim()) e.emergencyName = 'Enter an emergency contact name.'
    if (!/^\d{10}$/.test(f.emergencyPhone)) e.emergencyPhone = 'Enter a 10-digit phone number.'
    if (!f.diagnosis.trim()) e.diagnosis = 'Enter the reason for admission.'
    if (!f.bed) e.bed = 'Choose a free bed.'
    return e
  }

  const submit = (ev) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      document.getElementById(`f-${Object.keys(e)[0]}`)?.focus()
      return
    }
    const medications = f.medName.trim()
      ? [{ id: `m${Date.now()}`, name: f.medName.trim(), dose: f.medDose.trim() || '–', frequency: f.medFrequency.trim() || '–', given: false }]
      : []
    const id = addPatient({
      name: f.name.trim(), age: Number(f.age), gender: f.gender, bloodGroup: f.bloodGroup, phone: f.phone,
      emergencyName: f.emergencyName.trim(), emergencyPhone: f.emergencyPhone, emergencyRelation: f.emergencyRelation.trim() || 'Relative',
      diagnosis: f.diagnosis.trim(), allergies: f.allergies.trim() || 'None known', bed: f.bed, condition: f.condition, medications,
    })
    navigate(`/patients/${id}`)
  }

  const input = (k, props = {}) => (
    <input id={`f-${k}`} className="field" value={f[k]} onChange={set(k)} aria-invalid={!!errors[k]} {...props} />
  )

  return (
    <>
      <PageTitle title="Admit patient" />
      <form onSubmit={submit} noValidate className="max-w-4xl space-y-6">
        <fieldset className="grid gap-4 rounded-lg bg-white p-5 md:grid-cols-2">
          <legend className="float-left mb-3 w-full text-lg font-bold">Patient details</legend>
          <Field errors={errors} k="name" label="Full name">{input('name', { autoComplete: 'off' })}</Field>
          <Field errors={errors} k="age" label="Age">{input('age', { type: 'number', min: 0, max: 120 })}</Field>
          <Field errors={errors} k="gender" label="Gender">
            <select id="f-gender" className="field" value={f.gender} onChange={set('gender')}>
              {['Male', 'Female', 'Other'].map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
          <Field errors={errors} k="bloodGroup" label="Blood group">
            <select id="f-bloodGroup" className="field" value={f.bloodGroup} onChange={set('bloodGroup')}>
              {BLOOD.map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <Field errors={errors} k="phone" label="Phone">{input('phone', { inputMode: 'numeric', maxLength: 10 })}</Field>
        </fieldset>

        <fieldset className="grid gap-4 rounded-lg bg-white p-5 md:grid-cols-3">
          <legend className="float-left mb-3 w-full text-lg font-bold">Emergency contact</legend>
          <Field errors={errors} k="emergencyName" label="Name">{input('emergencyName')}</Field>
          <Field errors={errors} k="emergencyRelation" label="Relationship">{input('emergencyRelation', { placeholder: 'e.g. Wife' })}</Field>
          <Field errors={errors} k="emergencyPhone" label="Phone">{input('emergencyPhone', { inputMode: 'numeric', maxLength: 10 })}</Field>
        </fieldset>

        <fieldset className="grid gap-4 rounded-lg bg-white p-5 md:grid-cols-2">
          <legend className="float-left mb-3 w-full text-lg font-bold">Admission</legend>
          <div className="md:col-span-2"><Field errors={errors} k="diagnosis" label="Reason for admission">{input('diagnosis')}</Field></div>
          <Field errors={errors} k="allergies" label="Known allergies" hint="Leave blank if none.">{input('allergies')}</Field>
          <Field errors={errors} k="condition" label="Clinical condition" hint="Sets how the simulated monitor behaves.">
            <select id="f-condition" className="field" value={f.condition} onChange={set('condition')}>
              {['Stable', 'Guarded', 'Critical'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field errors={errors} k="bed" label="Bed" hint={`${freeBeds.length} beds free`}>
            <select id="f-bed" className="field" value={f.bed} onChange={set('bed')} aria-invalid={!!errors.bed}>
              <option value="">Choose a bed</option>
              {WARDS.map((w) => (
                <optgroup key={w.id} label={w.name}>
                  {freeBeds.filter((b) => wardOfBed(b) === w.name).map((b) => <option key={b} value={b}>{b}</option>)}
                </optgroup>
              ))}
            </select>
          </Field>
        </fieldset>

        <fieldset className="grid gap-4 rounded-lg bg-white p-5 md:grid-cols-3">
          <legend className="float-left mb-3 w-full text-lg font-bold">First medication <span className="text-sm font-medium text-ink/60">(optional)</span></legend>
          <Field errors={errors} k="medName" label="Medicine">{input('medName')}</Field>
          <Field errors={errors} k="medDose" label="Dose">{input('medDose', { placeholder: 'e.g. 500 mg' })}</Field>
          <Field errors={errors} k="medFrequency" label="How often">{input('medFrequency', { placeholder: 'e.g. Twice daily' })}</Field>
        </fieldset>

        <div className="flex gap-3">
          <button className="btn-primary" type="submit">Admit patient</button>
          <button className="btn-quiet" type="button" onClick={() => navigate('/patients')}>Cancel</button>
        </div>
      </form>
    </>
  )
}
