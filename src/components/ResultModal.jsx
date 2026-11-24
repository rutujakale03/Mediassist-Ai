import { AlertTriangle, CheckCircle, AlertCircle, X, Printer, PhoneCall, Building2 } from 'lucide-react';

export default function ResultModal({ result, onClose }) {
  if (!result) return null;

  const badgeConfig = {
    RED: {
      bg: 'bg-rose-600',
      light: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: AlertTriangle,
      title: 'RED — HIGH URGENCY (DANGER SIGN DETECTED)',
    },
    YELLOW: {
      bg: 'bg-amber-500',
      light: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: AlertCircle,
      title: 'YELLOW — MODERATE URGENCY (REVIEW NEEDED)',
    },
    GREEN: {
      bg: 'bg-emerald-600',
      light: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: CheckCircle,
      title: 'GREEN — LOW URGENCY (ROUTINE CARE)',
    },
  }[result.urgency_level];

  const Icon = badgeConfig.icon;
  const details = result.evaluation_details || {};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white max-w-xl w-full rounded-2xl shadow-xl overflow-hidden">
        <div className={`${badgeConfig.bg} text-white px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-2 font-bold">
            <Icon className="w-6 h-6" />
            <span>{badgeConfig.title}</span>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className={`p-4 rounded-xl border ${badgeConfig.light}`}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1">Recommended Action</p>
            <p className="font-semibold text-sm">{result.recommendation}</p>
          </div>

          {result.urgency_level !== 'GREEN' && (
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> Nearest Referral Directory (Amravati District)
                </span>
                <a href="tel:108" className="inline-flex items-center gap-1 bg-rose-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-rose-700">
                  <PhoneCall className="w-3.5 h-3.5" /> Call 108 Ambulance
                </a>
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <p><strong>Primary Referral:</strong> Sub-District Hospital (SDH) Achalpur / CHC Chikhaldara (24x7 Emergency)</p>
                <p><strong>Tertiary Center:</strong> District General Hospital (Irwin), Amravati • Helpline: 104 / 108</p>
              </div>
            </div>
          )}

          {details.triggers && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Clinical Findings / Triggers</p>
              <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                {details.triggers.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}

          {details.possible_conditions && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Protocol Considerations (Advisory Only)</p>
              <div className="flex flex-wrap gap-2">
                {details.possible_conditions.map((c, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">{c}</span>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-400 border-t pt-3">
            Disclaimer: Advisory decision support only ({result.rule_version}). Does not replace qualified physician diagnosis.
          </p>

          <div className="flex justify-end gap-3">
            <button onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-slate-50">
              <Printer className="w-4 h-4" /> Print Report
            </button>
            <button onClick={onClose}
              className="px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
