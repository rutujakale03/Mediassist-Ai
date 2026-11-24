import { useEffect, useState } from 'react';
import {
  Activity, LogOut, Users, ClipboardList, UserPlus,
  Stethoscope, Search, MessageSquare, Shield, Wifi, WifiOff, RefreshCw, Download, Globe, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PatientForm from '../components/PatientForm';
import AssessmentForm from '../components/AssessmentForm';
import ResultModal from '../components/ResultModal';
import SecondOpinionPanel from '../components/SecondOpinionPanel';
import AdminPanel from '../components/AdminPanel';
import PatientHistoryModal from '../components/PatientHistoryModal';
import { getPendingQueue, flushSyncQueue } from '../offline/syncQueue';
import { translations, exportAssessmentsCSV } from '../utils/translations';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [lang, setLang] = useState('en');
  const t = translations[lang];

  const [tab, setTab] = useState(user.role === 'doctor' ? 'second-opinion' : user.role === 'admin' ? 'admin' : 'overview');
  const [patients, setPatients] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [search, setSearch] = useState('');
  const [latestResult, setLatestResult] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(getPendingQueue().length);

  const loadData = async () => {
    try {
      const [pRes, aRes] = await Promise.all([api.get(`/patients?search=${search}`), api.get('/assessments')]);
      setPatients(pRes.data);
      setAssessments(aRes.data);
    } catch { /* Offline fallback */ }
  };

  const syncOfflineRecords = async () => {
    const res = await flushSyncQueue();
    setPendingCount(res.remaining);
    if (res.synced > 0) loadData();
  };

  useEffect(() => {
    loadData();
    const goOnline = () => { setIsOnline(true); syncOfflineRecords(); };
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, [search]);

  const highRiskCount = assessments.filter((a) => a.urgency_level === 'RED').length;
  const modRiskCount = assessments.filter((a) => a.urgency_level === 'YELLOW').length;
  const lowRiskCount = assessments.filter((a) => a.urgency_level === 'GREEN').length;

  const navItems = [
    { id: 'overview', label: t.overview, icon: ClipboardList, roles: ['health_worker', 'doctor', 'admin'] },
    { id: 'register', label: t.register, icon: UserPlus, roles: ['health_worker'] },
    { id: 'assess', label: t.assess, icon: Stethoscope, roles: ['health_worker'] },
    { id: 'patients', label: t.patients, icon: Users, roles: ['health_worker', 'doctor', 'admin'] },
    { id: 'second-opinion', label: t.secondOpinion, icon: MessageSquare, roles: ['health_worker', 'doctor', 'admin'] },
    { id: 'admin', label: t.admin, icon: Shield, roles: ['admin'] },
  ].filter((item) => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-teal-600 text-white p-2 rounded-lg"><Activity className="w-5 h-5" /></div>
          <span className="font-bold text-lg text-slate-800">MediAssist AI</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 uppercase">{user.role.replace('_', ' ')}</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setLang(lang === 'en' ? 'mr' : 'en')} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 hover:bg-slate-100 text-slate-700">
            <Globe className="w-3.5 h-3.5 text-teal-600" /> {lang === 'en' ? 'मराठी' : 'English'}
          </button>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
            {isOnline ? <><Wifi className="w-3.5 h-3.5" /> ONLINE</> : <><WifiOff className="w-3.5 h-3.5" /> OFFLINE</>}
          </span>
          {pendingCount > 0 && (
            <button onClick={syncOfflineRecords} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
              <RefreshCw className="w-3 h-3" /> Sync ({pendingCount})
            </button>
          )}
          <span className="text-sm font-medium text-slate-700">{user.full_name}</span>
          <button onClick={logout} className="text-sm text-rose-600 flex items-center gap-1 hover:underline"><LogOut className="w-4 h-4" /> {t.logout}</button>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl w-full mx-auto p-6 gap-6">
        <aside className="w-60 shrink-0 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${tab === item.id ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-white'}`}>
                <Icon className="w-4 h-4" /> {item.label}
              </button>
            );
          })}
        </aside>

        <main className="flex-1 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200"><p className="text-xs text-slate-500">{t.totalPatients}</p><p className="text-2xl font-bold text-slate-900">{patients.length}</p></div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200"><p className="text-xs text-emerald-700">{t.greenRisk}</p><p className="text-2xl font-bold text-emerald-700">{lowRiskCount}</p></div>
            <div className="bg-white p-4 rounded-xl border border-amber-200"><p className="text-xs text-amber-700">{t.yellowRisk}</p><p className="text-2xl font-bold text-amber-600">{modRiskCount}</p></div>
            <div className="bg-white p-4 rounded-xl border border-rose-200"><p className="text-xs text-rose-700">{t.redRisk}</p><p className="text-2xl font-bold text-rose-600">{highRiskCount}</p></div>
          </div>

          {tab === 'register' && <PatientForm onSuccess={() => { loadData(); setTab('assess'); }} />}
          {tab === 'assess' && <AssessmentForm patients={patients} onAssessmentComplete={(res) => { setLatestResult(res); loadData(); }} />}
          {tab === 'second-opinion' && <SecondOpinionPanel assessments={assessments} />}
          {tab === 'admin' && <AdminPanel />}

          {(tab === 'overview' || tab === 'patients') && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-bold text-slate-800">{tab === 'patients' ? t.registeredPatients : t.recentAssessments}</h2>
                {tab === 'patients' ? (
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input placeholder="Search name or ID..." className="border pl-9 pr-3 py-1.5 rounded-lg text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                ) : (
                  <button onClick={() => exportAssessmentsCSV(assessments)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800">
                    <Download className="w-3.5 h-3.5" /> {t.exportCsv}
                  </button>
                )}
              </div>

              {tab === 'patients' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                      <tr><th className="p-3">Code</th><th className="p-3">Name</th><th className="p-3">Age/Gender</th><th className="p-3">Village</th><th className="p-3">History</th><th className="p-3">Timeline</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      {patients.map((p) => (
                        <tr key={p.id}>
                          <td className="p-3 font-mono text-xs text-teal-700">{p.patient_code}</td>
                          <td className="p-3 font-medium">{p.name}</td>
                          <td className="p-3">{p.age}y / {p.gender}</td>
                          <td className="p-3">{p.village}</td>
                          <td className="p-3 text-slate-500">{p.medical_history || 'None'}</td>
                          <td className="p-3"><button onClick={() => setSelectedPatientId(p.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline"><Eye className="w-3.5 h-3.5" /> {t.viewHistory}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-3">
                  {assessments.length === 0 && <p className="text-sm text-slate-500">No assessments recorded yet.</p>}
                  {assessments.map((a) => (
                    <div key={a.id} className="p-4 border rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">{a.patient_name} <span className="text-xs text-slate-400">({a.patient_code})</span></p>
                        <p className="text-xs text-slate-500 mt-0.5">{a.recommendation}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${a.urgency_level === 'RED' ? 'bg-rose-100 text-rose-700' : a.urgency_level === 'YELLOW' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'}`}>{a.urgency_level}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <ResultModal result={latestResult} onClose={() => setLatestResult(null)} />
      <PatientHistoryModal patientId={selectedPatientId} onClose={() => setSelectedPatientId(null)} />
    </div>
  );
}
