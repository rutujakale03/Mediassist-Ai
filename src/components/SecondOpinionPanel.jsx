import { useEffect, useState } from 'react';
import { Send, CheckCircle2, MessageSquare } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SecondOpinionPanel({ assessments }) {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [caseNotes, setCaseNotes] = useState('');
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(false);

  const loadCases = async () => {
    const res = await api.get('/second-opinions');
    setCases(res.data);
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!selectedAssessment) return;
    setLoading(true);
    try {
      await api.post('/second-opinions', {
        assessment_id: Number(selectedAssessment),
        case_notes: caseNotes,
      });
      setCaseNotes('');
      setSelectedAssessment('');
      loadCases();
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorReply = async (id) => {
    const text = replyText[id];
    if (!text) return;
    await api.put(`/second-opinions/${id}/respond`, {
      doctor_response: text,
      status: 'Answered',
    });
    loadCases();
  };

  return (
    <div className="space-y-6">
      {user.role === 'health_worker' && (
        <form onSubmit={handleRequest} className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Send className="w-4 h-4 text-teal-600" /> Escalate Assessment for Doctor Second Opinion
          </h3>
          <select required className="border p-2.5 rounded-lg w-full bg-white text-sm"
            value={selectedAssessment} onChange={(e) => setSelectedAssessment(e.target.value)}>
            <option value="">-- Select Assessment to Escalate --</option>
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
                #{a.id} — {a.patient_name} ({a.urgency_level})
              </option>
            ))}
          </select>
          <textarea required rows="3" placeholder="Add clinical observations, field notes, or specific questions for the doctor..."
            className="border p-2.5 rounded-lg w-full text-sm"
            value={caseNotes} onChange={(e) => setCaseNotes(e.target.value)} />
          <button disabled={loading} type="submit"
            className="px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700">
            {loading ? 'Submitting...' : 'Submit Second-Opinion Request'}
          </button>
        </form>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          {user.role === 'doctor' ? 'Incoming Specialist Review Queue' : 'Second-Opinion Case History'}
        </h3>

        {cases.length === 0 && <p className="text-sm text-slate-500">No second-opinion cases yet.</p>}

        <div className="space-y-4">
          {cases.map((c) => (
            <div key={c.id} className="border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{c.patient_name}</span>
                  <span className="text-xs text-slate-500 ml-2">({c.age}y, {c.gender} • {c.village})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    c.urgency_level === 'RED' ? 'bg-rose-100 text-rose-700' :
                    c.urgency_level === 'YELLOW' ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>{c.urgency_level}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    {c.status}
                  </span>
                </div>
              </div>

              <div className="text-xs bg-slate-50 p-3 rounded-lg text-slate-700 space-y-1">
                <p><strong>Vitals:</strong> Temp {c.vital_signs?.temperature}°C | SpO2 {c.vital_signs?.spo2}% | BP {c.vital_signs?.systolic_bp}/{c.vital_signs?.diastolic_bp}</p>
                <p><strong>Health Worker Notes:</strong> {c.case_notes}</p>
              </div>

              {c.doctor_response ? (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-950">
                  <p className="font-semibold flex items-center gap-1 text-xs uppercase text-blue-700 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Doctor Recommendation
                  </p>
                  {c.doctor_response}
                </div>
              ) : (
                (user.role === 'doctor' || user.role === 'admin') && (
                  <div className="flex gap-2">
                    <input placeholder="Write clinical advice / referral instructions..."
                      className="border p-2 rounded-lg text-sm flex-1"
                      value={replyText[c.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [c.id]: e.target.value })} />
                    <button onClick={() => handleDoctorReply(c.id)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
                      Send Reply
                    </button>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
