import { useEffect, useState } from 'react';
import { Shield, FileText, BookOpen, Plus } from 'lucide-react';
import api from '../services/api';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [newProto, setNewProto] = useState({
    protocol_name: '',
    condition_name: '',
    urgency_level: 'YELLOW',
    recommended_action: '',
  });

  const loadAdminData = async () => {
    const [uRes, lRes, pRes] = await Promise.all([
      api.get('/admin/users'),
      api.get('/admin/audit-logs'),
      api.get('/admin/protocols'),
    ]);
    setUsers(uRes.data);
    setLogs(lRes.data);
    setProtocols(pRes.data);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const toggleStatus = async (u) => {
    const nextStatus = u.account_status === 'active' ? 'deactivated' : 'active';
    await api.put(`/admin/users/${u.id}`, { account_status: nextStatus, role: u.role });
    loadAdminData();
  };

  const handleAddProtocol = async (e) => {
    e.preventDefault();
    await api.post('/admin/protocols', newProto);
    setNewProto({ protocol_name: '', condition_name: '', urgency_level: 'YELLOW', recommended_action: '' });
    loadAdminData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-600" /> Clinical Triage Protocol Manager
        </h3>

        <form onSubmit={handleAddProtocol} className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input required placeholder="Protocol Name" className="border p-2 rounded-lg text-xs"
            value={newProto.protocol_name} onChange={(e) => setNewProto({ ...newProto, protocol_name: e.target.value })} />
          <input required placeholder="Trigger Condition" className="border p-2 rounded-lg text-xs"
            value={newProto.condition_name} onChange={(e) => setNewProto({ ...newProto, condition_name: e.target.value })} />
          <select className="border p-2 rounded-lg text-xs bg-white"
            value={newProto.urgency_level} onChange={(e) => setNewProto({ ...newProto, urgency_level: e.target.value })}>
            <option value="RED">RED (Emergency)</option>
            <option value="YELLOW">YELLOW (Review)</option>
            <option value="GREEN">GREEN (Routine)</option>
          </select>
          <input required placeholder="Recommended Action" className="border p-2 rounded-lg text-xs"
            value={newProto.recommended_action} onChange={(e) => setNewProto({ ...newProto, recommended_action: e.target.value })} />
          <button type="submit" className="inline-flex items-center justify-center gap-1 bg-teal-600 text-white rounded-lg text-xs font-semibold px-3 py-2 hover:bg-teal-700">
            <Plus className="w-3.5 h-3.5" /> Add Rule
          </button>
        </form>

        <div className="divide-y border rounded-xl">
          {protocols.map((p) => (
            <div key={p.id} className="p-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800">{p.protocol_name} <span className="font-normal text-slate-500">({p.condition_name})</span></p>
                <p className="text-slate-600 mt-0.5">{p.recommended_action}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                p.urgency_level === 'RED' ? 'bg-rose-100 text-rose-700' :
                p.urgency_level === 'YELLOW' ? 'bg-amber-100 text-amber-800' :
                'bg-emerald-100 text-emerald-700'
              }`}>{p.urgency_level}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-purple-600" /> User & Role Management
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Facility / Village</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="p-3 font-medium">{u.full_name}<br /><span className="text-xs text-slate-400">{u.email}</span></td>
                  <td className="p-3 uppercase text-xs font-semibold">{u.role}</td>
                  <td className="p-3 text-slate-600">{u.facility || '-'} ({u.village || '-'})</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      u.account_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>{u.account_status}</span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => toggleStatus(u)} className="text-xs font-semibold text-blue-600 hover:underline">
                      {u.account_status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-slate-600" /> System Audit Trail
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
          {logs.map((l) => (
            <div key={l.id} className="p-2.5 bg-slate-50 rounded-lg flex justify-between">
              <span><strong>{l.action}</strong> — {l.entity_type} #{l.entity_id} {l.details ? `(${l.details})` : ''}</span>
              <span className="text-slate-400">{new Date(l.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
