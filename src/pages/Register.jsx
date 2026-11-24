import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'health_worker',
    facility: '',
    village: '',
    district: '',
    state: 'Maharashtra',
  });

  // Allow ONLY alphabets (A-Z, a-z) and spaces for Full Name
  const handleAlphabeticInput = (field, value) => {
    const alphabetsOnly = value.replace(/[^a-zA-Z\s]/g, '');
    setForm((prev) => ({ ...prev, [field]: alphabetsOnly }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Allow ONLY digits (0-9) for Mobile Number
  const handleNumericInput = (field, value, maxLen = 10) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, maxLen);
    setForm((prev) => ({ ...prev, [field]: digitsOnly }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Validate all fields before submitting
  const validateForm = () => {
    const errors = {};

    if (!form.full_name.trim()) {
      errors.full_name = 'Name is required.';
    } else if (!/^[a-zA-Z\s]+$/.test(form.full_name.trim())) {
      errors.full_name = 'Name must contain only alphabets.';
    }

    if (!form.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!form.mobile.trim()) {
      errors.mobile = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(form.mobile)) {
      errors.mobile = 'Mobile number must be exactly 10 digits.';
    }

    if (!form.password || form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!form.facility.trim()) {
      errors.facility = 'Healthcare facility / PHC is required.';
    }

    if (!form.village.trim()) {
      errors.village = 'Village / Town is required.';
    }

    if (!form.district.trim()) {
      errors.district = 'District is required.';
    }

    if (!form.state.trim()) {
      errors.state = 'State is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Button stays disabled until all required fields pass validation
  const isFormValid =
    /^[a-zA-Z\s]+$/.test(form.full_name.trim()) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    /^\d{10}$/.test(form.mobile) &&
    form.password.length >= 6 &&
    form.facility.trim().length > 0 &&
    form.village.trim().length > 0 &&
    form.district.trim().length > 0 &&
    form.state.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await api.post('/auth/register', {
        ...form,
        full_name: form.full_name.trim(),
      });
      navigate('/login', {
        replace: true,
        state: {
          registered: true,
          email: form.email.trim(),
        },
      });
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(', '));
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Cannot connect to server. Ensure backend is running on port 8001.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-2 text-teal-600 font-bold text-xl mb-6">
          <Activity className="w-6 h-6" /> MediAssist AI
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Create Account</h2>
        <p className="text-sm text-slate-500 mb-6">Register as a Health Worker, Doctor, or Administrator</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Full Name (Alphabets Only)"
                className={`border p-2.5 rounded-lg w-full ${fieldErrors.full_name ? 'border-rose-500' : ''}`}
                value={form.full_name}
                onChange={(e) => handleAlphabeticInput('full_name', e.target.value)}
              />
              {fieldErrors.full_name && <p className="text-xs text-rose-600 mt-1">{fieldErrors.full_name}</p>}
            </div>

            <div>
              <select
                className="border p-2.5 rounded-lg w-full bg-white"
                value={form.role}
                onChange={(e) => handleChange('role', e.target.value)}
              >
                <option value="health_worker">Health Worker (ASHA / ANM)</option>
                <option value="doctor">Doctor / Specialist</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="email"
                placeholder="Email Address"
                className={`border p-2.5 rounded-lg w-full ${fieldErrors.email ? 'border-rose-500' : ''}`}
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              {fieldErrors.email && <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Mobile Number (10 digits)"
                className={`border p-2.5 rounded-lg w-full ${fieldErrors.mobile ? 'border-rose-500' : ''}`}
                value={form.mobile}
                onChange={(e) => handleNumericInput('mobile', e.target.value, 10)}
              />
              {fieldErrors.mobile && <p className="text-xs text-rose-600 mt-1">{fieldErrors.mobile}</p>}
            </div>
          </div>

          <div>
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              className={`border p-2.5 rounded-lg w-full ${fieldErrors.password ? 'border-rose-500' : ''}`}
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
            {fieldErrors.password && <p className="text-xs text-rose-600 mt-1">{fieldErrors.password}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                placeholder="Healthcare Facility / PHC"
                className={`border p-2.5 rounded-lg w-full ${fieldErrors.facility ? 'border-rose-500' : ''}`}
                value={form.facility}
                onChange={(e) => handleChange('facility', e.target.value)}
              />
              {fieldErrors.facility && <p className="text-xs text-rose-600 mt-1">{fieldErrors.facility}</p>}
            </div>

            <div>
              <input
                placeholder="Village / Town"
                className={`border p-2.5 rounded-lg w-full ${fieldErrors.village ? 'border-rose-500' : ''}`}
                value={form.village}
                onChange={(e) => handleChange('village', e.target.value)}
              />
              {fieldErrors.village && <p className="text-xs text-rose-600 mt-1">{fieldErrors.village}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                placeholder="District"
                className={`border p-2.5 rounded-lg w-full ${fieldErrors.district ? 'border-rose-500' : ''}`}
                value={form.district}
                onChange={(e) => handleChange('district', e.target.value)}
              />
              {fieldErrors.district && <p className="text-xs text-rose-600 mt-1">{fieldErrors.district}</p>}
            </div>

            <div>
              <input
                placeholder="State"
                className={`border p-2.5 rounded-lg w-full ${fieldErrors.state ? 'border-rose-500' : ''}`}
                value={form.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
              {fieldErrors.state && <p className="text-xs text-rose-600 mt-1">{fieldErrors.state}</p>}
            </div>
          </div>

          <button
            disabled={submitting || !isFormValid}
            type="submit"
            className={`w-full py-2.5 font-semibold rounded-lg transition ${
              submitting || !isFormValid
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            {submitting ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-center text-slate-600 mt-6">
          Already registered? <Link to="/login" className="text-teal-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
