import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const registered = location.state?.registered === true;
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-2 text-teal-600 font-bold text-xl mb-6">
          <Activity className="w-6 h-6" /> MediAssist AI
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome Back</h2>
        <p className="text-sm text-slate-500 mb-6">Sign in to access your clinical portal</p>

        {registered && (
          <div
            role="status"
            className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2 border border-emerald-200"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Registration successful. Please sign in to continue.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="email" placeholder="Email Address" className="border p-2.5 rounded-lg w-full"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <input required type="password" placeholder="Password" className="border p-2.5 rounded-lg w-full"
            value={password} onChange={(e) => setPassword(e.target.value)} />

          <button disabled={loading} type="submit"
            className="w-full py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-sm text-center text-slate-600 mt-6">
          Don't have an account? <Link to="/register" className="text-teal-600 font-medium hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
