import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Activity, ShieldCheck, ArrowRight } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './dashboards/Dashboard';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-slate-500">Loading session...</div>;
  return user ? children : <Navigate to="/login" />;
}

function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-teal-600 text-white p-2 rounded-lg"><Activity className="w-6 h-6" /></div>
          <span className="text-xl font-bold text-slate-800">MediAssist <span className="text-teal-600">AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-600">Login</Link>
          <Link to="/register" className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm font-medium mb-6">
          <ShieldCheck className="w-4 h-4" /> Clinical Decision Support & Second Opinions
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
          Empowering Primary Healthcare with Intelligent Decision Support
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
          Structured symptom triage, offline-first patient records, and seamless doctor escalation for ASHA, ANM, and rural medical officers.
        </p>
        <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700">
          Create Account <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
