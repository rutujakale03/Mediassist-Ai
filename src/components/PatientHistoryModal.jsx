import { useEffect, useState } from 'react';
import { X, Clock, Activity } from 'lucide-react';
import api from '../services/api';

export default function PatientHistoryModal({ patientId, onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!patientId) return;
    api.get(`/patients/${patientId}/history`).then((res) => setData(res.data));
  }, [patientId]);

  if (!patientId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Activity className="w-5 h-5 text-teal-400" />
            <span>Patient Longitudinal Clinical Timeline</span>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {!data ? (
            <p className="text-sm text-slate-500">Loading patient records...</p>
          ) : (
            <>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div><span className="text-slate-400 block">Patient</span><strong className="text-sm text-slate-900">{data.patient.name}</strong></div>
                <div><span className="text-slate-400 block">ID Code</span><strong className="font-mono text-teal-700">{data.patient.patient_code}</strong></div>
                <div><span className="text-slate-400 block">Age / Gender</span><strong>{data.patient.age}y / {data.patient.gender}</strong></div>
                <div><span className="text-slate-400 block">Village</span><strong>{data.patient.village}, {data.patient.district}</strong></div>
                <div className="col-span-2"><span className="text-slate-400 block">History</span><strong>{data.patient.medical_history || 'None'}</strong></div>
                <div className="col-span-2"><span className="text-slate-400 block">Pregnancy Status</span><strong>{data.patient.pregnancy_status}</strong></div>
              </div>

              <h4 className="text-xs font-bold uppercase text-slate-500">Past Clinical Assessments ({data.assessments.length})</h4>

              {data.assessments.length === 0 ? (
                <p className="text-sm text-slate-500">No assessments recorded for this patient yet.</p>
              ) : (
                <div className="space-y-3 border-l-2 border-teal-200 pl-4 ml-2">
                  {data.assessments.map((a) => (
                    <div key={a.id} className="bg-white border rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {new Date(a.created_at).toLocaleString()}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          a.urgency_level === 'RED' ? 'bg-rose-100 text-rose-700' :
                          a.urgency_level === 'YELLOW' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>{a.urgency_level}</span>
                      </div>
                      <p className="text-xs text-slate-700">
                        <strong>Vitals:</strong> Temp {a.vital_signs?.temperature}°C | SpO2 {a.vital_signs?.spo2}% | BP {a.vital_signs?.systolic_bp}/{a.vital_signs?.diastolic_bp} | Pulse {a.vital_signs?.pulse} bpm
                      </p>
                      <p className="text-xs text-slate-600">{a.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
