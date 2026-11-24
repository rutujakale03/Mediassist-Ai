import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import api from '../services/api';

export default function PatientForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'Female',
    mobile: '',
    village: '',
    district: 'Amravati',
    pregnancy_status: 'Not Applicable',
    medical_history: '',
    allergies: '',
    current_medications: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[a-zA-Z\s]+$/.test(form.name.trim())) {
      return alert('Patient name must contain only alphabets.');
    }
    if (form.mobile && !/^\d{10}$/.test(form.mobile)) {
      return alert('Mobile number must be exactly 10 digits.');
    }

    setLoading(true);
    try {
      await api.post('/patients', {
        ...form,
        name: form.name.trim(),
        age: Number(form.age),
      });
      setForm({
        ...form,
        name: '',
        age: '',
        mobile: '',
        medical_history: '',
        allergies: '',
        current_medications: '',
      });
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error registering patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
      <div className="flex items-center gap-2 text-lg font-bold text-slate-800 border-b pb-3">
        <UserPlus className="w-5 h-5 text-teal-600" /> Register New Patient
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          required
          placeholder="Patient Full Name (Alphabets Only)"
          className="border p-2.5 rounded-lg"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
        />
        <input
          required
          type="number"
          min="0"
          max="120"
          placeholder="Age (Years)"
          className="border p-2.5 rounded-lg"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />
        <select
          className="border p-2.5 rounded-lg bg-white"
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
        >
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          inputMode="numeric"
          placeholder="Mobile Number (10 digits)"
          className="border p-2.5 rounded-lg"
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
        />
        <input
          required
          placeholder="Village"
          className="border p-2.5 rounded-lg"
          value={form.village}
          onChange={(e) => setForm({ ...form, village: e.target.value })}
        />
        <input
          required
          placeholder="District"
          className="border p-2.5 rounded-lg"
          value={form.district}
          onChange={(e) => setForm({ ...form, district: e.target.value })}
        />
      </div>

      {form.gender === 'Female' && (
        <div>
          <label className="text-xs font-semibold text-slate-600">Pregnancy Status</label>
          <select
            className="border p-2.5 rounded-lg bg-white w-full mt-1"
            value={form.pregnancy_status}
            onChange={(e) => setForm({ ...form, pregnancy_status: e.target.value })}
          >
            <option value="Not Pregnant">Not Pregnant</option>
            <option value="Pregnant">Pregnant</option>
            <option value="Postpartum">Postpartum</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          placeholder="Medical History (e.g. Diabetes, HTN)"
          className="border p-2.5 rounded-lg"
          value={form.medical_history}
          onChange={(e) => setForm({ ...form, medical_history: e.target.value })}
        />
        <input
          placeholder="Known Allergies"
          className="border p-2.5 rounded-lg"
          value={form.allergies}
          onChange={(e) => setForm({ ...form, allergies: e.target.value })}
        />
        <input
          placeholder="Current Medications"
          className="border p-2.5 rounded-lg"
          value={form.current_medications}
          onChange={(e) => setForm({ ...form, current_medications: e.target.value })}
        />
      </div>

      <button
        disabled={loading}
        type="submit"
        className="px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition"
      >
        {loading ? 'Saving...' : 'Register Patient'}
      </button>
    </form>
  );
}
