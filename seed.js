export const WARDS = [
  { id: 'G', name: 'General Ward', beds: 6 },
  { id: 'C', name: 'Cardiac Care', beds: 4 },
  { id: 'I', name: 'ICU', beds: 4 },
]

export const allBeds = () =>
  WARDS.flatMap((w) =>
    Array.from({ length: w.beds }, (_, i) => `${w.id}-${String(i + 1).padStart(2, '0')}`)
  )

export const wardOfBed = (bed) => WARDS.find((w) => w.id === bed.split('-')[0])?.name ?? ''

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString()

export const SEED_PATIENTS = [
  {
    id: 'P-1001', name: 'Ramesh Kulkarni', age: 62, gender: 'Male', bloodGroup: 'B+',
    phone: '9810011223', emergencyName: 'Sunita Kulkarni', emergencyPhone: '9810011224', emergencyRelation: 'Wife',
    diagnosis: 'Post-MI monitoring', allergies: 'Penicillin', bed: 'C-01', condition: 'Guarded',
    admittedOn: daysAgo(3), status: 'Admitted', doctor: 'Dr. Ayush Sahu',
    medications: [
      { id: 'm1', name: 'Aspirin', dose: '75 mg', frequency: 'Once daily', given: false },
      { id: 'm2', name: 'Atorvastatin', dose: '40 mg', frequency: 'Night', given: false },
    ],
    notes: [{ id: 'n1', at: daysAgo(1), by: 'Dr. Ayush Sahu', text: 'Chest pain resolved. Continue cardiac monitoring for 48 hours.' }],
  },
  {
    id: 'P-1002', name: 'Neha Verma', age: 34, gender: 'Female', bloodGroup: 'O+',
    phone: '9899123456', emergencyName: 'Arun Verma', emergencyPhone: '9899123457', emergencyRelation: 'Husband',
    diagnosis: 'Post-operative recovery (appendectomy)', allergies: 'None known', bed: 'G-02', condition: 'Stable',
    admittedOn: daysAgo(2), status: 'Admitted', doctor: 'Dr. Ayush Sahu',
    medications: [{ id: 'm3', name: 'Paracetamol', dose: '500 mg', frequency: 'Every 8 hours', given: true }],
    notes: [],
  },
  {
    id: 'P-1003', name: 'Mohammed Irfan', age: 71, gender: 'Male', bloodGroup: 'A-',
    phone: '9718765432', emergencyName: 'Sana Irfan', emergencyPhone: '9718765433', emergencyRelation: 'Daughter',
    diagnosis: 'Severe pneumonia with respiratory distress', allergies: 'Sulfa drugs', bed: 'I-01', condition: 'Critical',
    admittedOn: daysAgo(1), status: 'Admitted', doctor: 'Dr. Ayush Sahu',
    medications: [
      { id: 'm4', name: 'Ceftriaxone', dose: '1 g IV', frequency: 'Twice daily', given: false },
      { id: 'm5', name: 'Oxygen therapy', dose: '4 L/min', frequency: 'Continuous', given: true },
    ],
    notes: [{ id: 'n2', at: daysAgo(0), by: 'Dr. Ayush Sahu', text: 'SpO₂ unstable. Consider escalation to ventilatory support if no improvement.' }],
  },
  {
    id: 'P-1004', name: 'Priya Nair', age: 28, gender: 'Female', bloodGroup: 'AB+',
    phone: '9944556677', emergencyName: 'Lakshmi Nair', emergencyPhone: '9944556678', emergencyRelation: 'Mother',
    diagnosis: 'Dengue fever, platelet monitoring', allergies: 'None known', bed: 'G-04', condition: 'Guarded',
    admittedOn: daysAgo(2), status: 'Admitted', doctor: 'Dr. Ayush Sahu',
    medications: [{ id: 'm6', name: 'IV fluids (Ringer lactate)', dose: '75 ml/hr', frequency: 'Continuous', given: true }],
    notes: [],
  },
  {
    id: 'P-1005', name: 'Suresh Patel', age: 55, gender: 'Male', bloodGroup: 'O-',
    phone: '9822334455', emergencyName: 'Meena Patel', emergencyPhone: '9822334456', emergencyRelation: 'Wife',
    diagnosis: 'Type 2 diabetes, glycaemic control', allergies: 'None known', bed: 'G-05', condition: 'Stable',
    admittedOn: daysAgo(4), status: 'Admitted', doctor: 'Dr. Ayush Sahu',
    medications: [{ id: 'm7', name: 'Metformin', dose: '500 mg', frequency: 'Twice daily', given: false }],
    notes: [],
  },
]
