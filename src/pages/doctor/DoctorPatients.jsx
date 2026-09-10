import { useState } from 'react';
import { Users, Search, Filter, FileText, Activity, Calendar, Phone, ChevronRight, CheckCircle2 } from 'lucide-react';

const mockPatients = [
  {
    id: 101,
    name: 'Ramesh Verma',
    age: 54,
    gender: 'Male',
    phone: '+91-98110-34561',
    abhaId: '91-4521-8890-1201',
    lastVisit: 'Today (In Consultation)',
    diagnosis: 'Ischemic Heart Disease, Hypertension',
    vitals: { bp: '142/90 mmHg', hr: '78 bpm', spo2: '98%', weight: '76 kg' },
    prescriptions: ['Tab. Amlodipine 5mg OD', 'Tab. Atorvastatin 20mg HS', 'Tab. Ecosprin 75mg OD'],
    notes: 'Patient reported mild retrosternal tightness during morning walks. ECG shows normal sinus rhythm. Advised TMT.'
  },
  {
    id: 102,
    name: 'Sunita Rao',
    age: 46,
    gender: 'Female',
    phone: '+91-98772-99012',
    abhaId: '91-4521-8890-1202',
    lastVisit: 'Today (Waiting #2)',
    diagnosis: 'Post CABG (3 months) Routine Review',
    vitals: { bp: '128/82 mmHg', hr: '72 bpm', spo2: '99%', weight: '64 kg' },
    prescriptions: ['Tab. Metoprolol 25mg BD', 'Tab. Rosuvastatin 10mg HS', 'Tab. Aspirin 75mg OD'],
    notes: 'Sternotomy site well-healed. Exercise tolerance normal. Echo scheduled for next week.'
  },
  {
    id: 103,
    name: 'Kavita Singh',
    age: 38,
    gender: 'Female',
    phone: '+91-99234-56781',
    abhaId: '91-4521-8890-1203',
    lastVisit: 'Today (Waiting #3)',
    diagnosis: 'Essential Hypertension & Anxiety-related Palpitations',
    vitals: { bp: '136/88 mmHg', hr: '88 bpm', spo2: '99%', weight: '58 kg' },
    prescriptions: ['Tab. Telmisartan 40mg OD', 'Tab. Propranolol 10mg PRN'],
    notes: 'Thyroid profile normal. Advised lifestyle modification, salt restriction and 30 mins aerobic walking.'
  },
  {
    id: 104,
    name: 'Harish Chandra',
    age: 67,
    gender: 'Male',
    phone: '+91-98109-87654',
    abhaId: '91-4521-8890-1204',
    lastVisit: '3 days ago',
    diagnosis: 'Congestive Heart Failure (NYHA Class II)',
    vitals: { bp: '118/74 mmHg', hr: '68 bpm', spo2: '96%', weight: '81 kg' },
    prescriptions: ['Tab. Sacubitril/Valsartan 50mg BD', 'Tab. Furosemide 20mg BD', 'Tab. Dapagliflozin 10mg OD'],
    notes: 'Bilateral pedal edema resolved. Serum creatinine stable at 1.1 mg/dL.'
  },
  {
    id: 105,
    name: 'Deepak Saxena',
    age: 51,
    gender: 'Male',
    phone: '+91-97112-34123',
    abhaId: '91-4521-8890-1205',
    lastVisit: '1 week ago',
    diagnosis: 'Dyslipidemia & Pre-diabetes',
    vitals: { bp: '124/80 mmHg', hr: '74 bpm', spo2: '98%', weight: '84 kg' },
    prescriptions: ['Tab. Rosuvastatin 20mg HS', 'Diet & Exercise Regimen'],
    notes: 'Lipid profile re-checked: LDL reduced from 168 to 92. Excellent response.'
  }
];

export default function DoctorPatients() {
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(mockPatients[0]);

  const filtered = mockPatients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
    p.abhaId.includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users size={24} style={{ color: 'var(--primary)' }} />
          Patient Registry & Electronic Health Records
        </h2>
        <p className="text-secondary text-sm">
          Access clinical histories, vitals, ABHA records, and past consultations
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-3 text-secondary" />
          <input
            type="text"
            className="input w-full pl-10"
            placeholder="Search by Patient Name, Diagnosis, or ABHA ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid: Patient List & Detail Card */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="card p-4 md:col-span-1 space-y-2 max-h-[650px] overflow-y-auto">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
            Patients ({filtered.length})
          </div>
          {filtered.map(patient => (
            <div
              key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              className={`p-3 rounded-xl cursor-pointer transition border ${
                selectedPatient?.id === patient.id
                  ? 'bg-primary-bg border-primary'
                  : 'hover:bg-bg-secondary border-border'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm">{patient.name}</h4>
                  <p className="text-xs text-secondary">{patient.age} Yrs • {patient.gender}</p>
                </div>
                <ChevronRight size={16} className="text-secondary" />
              </div>
              <p className="text-xs text-secondary mt-2 line-clamp-1">
                {patient.diagnosis}
              </p>
            </div>
          ))}
        </div>

        {/* Selected Patient Comprehensive Record */}
        <div className="card p-6 md:col-span-2 space-y-6">
          {selectedPatient ? (
            <>
              {/* Header Profile */}
              <div className="flex flex-wrap justify-between items-start gap-4 border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">{selectedPatient.name}</h3>
                    <span className="badge badge-primary text-xs">ABHA Linked</span>
                  </div>
                  <p className="text-xs text-secondary mt-1">
                    ABHA: <span className="font-mono font-medium">{selectedPatient.abhaId}</span> • Phone: {selectedPatient.phone}
                  </p>
                  <p className="text-xs text-secondary">
                    Age / Gender: {selectedPatient.age} Yrs / {selectedPatient.gender}
                  </p>
                </div>

                <div className="text-right">
                  <span className="badge badge-neutral text-xs">Last Encounter</span>
                  <div className="text-xs font-medium mt-1">{selectedPatient.lastVisit}</div>
                </div>
              </div>

              {/* Vitals Strip */}
              <div>
                <h4 className="text-xs uppercase font-semibold text-secondary mb-3 flex items-center gap-1.5">
                  <Activity size={14} style={{ color: 'var(--primary)' }} /> Latest Vitals
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-bg-secondary rounded-lg text-center">
                    <span className="text-xs text-secondary block">Blood Pressure</span>
                    <span className="font-bold text-base text-primary">{selectedPatient.vitals.bp}</span>
                  </div>
                  <div className="p-3 bg-bg-secondary rounded-lg text-center">
                    <span className="text-xs text-secondary block">Pulse Rate</span>
                    <span className="font-bold text-base text-primary">{selectedPatient.vitals.hr}</span>
                  </div>
                  <div className="p-3 bg-bg-secondary rounded-lg text-center">
                    <span className="text-xs text-secondary block">SpO2</span>
                    <span className="font-bold text-base text-success">{selectedPatient.vitals.spo2}</span>
                  </div>
                  <div className="p-3 bg-bg-secondary rounded-lg text-center">
                    <span className="text-xs text-secondary block">Body Weight</span>
                    <span className="font-bold text-base">{selectedPatient.vitals.weight}</span>
                  </div>
                </div>
              </div>

              {/* Clinical Assessment & Diagnosis */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-semibold text-secondary flex items-center gap-1.5">
                  <FileText size={14} style={{ color: 'var(--primary)' }} /> Primary Assessment
                </h4>
                <div className="p-3.5 bg-bg-secondary rounded-xl text-sm font-medium">
                  {selectedPatient.diagnosis}
                </div>
              </div>

              {/* Active Prescriptions */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-semibold text-secondary flex items-center gap-1.5">
                  <CheckCircle2 size={14} style={{ color: '#10B981' }} /> Active Medications
                </h4>
                <div className="grid sm:grid-cols-2 gap-2">
                  {selectedPatient.prescriptions.map((rx, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border bg-card text-xs font-mono font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                      {rx}
                    </div>
                  ))}
                </div>
              </div>

              {/* Physician Notes */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-semibold text-secondary">Clinical Progress Notes</h4>
                <p className="text-sm bg-bg-secondary p-3 rounded-lg text-secondary leading-relaxed">
                  {selectedPatient.notes}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button className="btn btn-secondary btn-sm" onClick={() => alert('Diagnostic reports loaded')}>
                  View Lab Reports
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => alert('Opening consultation form')}>
                  Update Consultation
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-secondary">Select a patient to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}
