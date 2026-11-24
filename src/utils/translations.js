export const translations = {
  en: {
    overview: 'Dashboard Overview',
    register: 'Register Patient',
    assess: 'New Assessment',
    patients: 'Patient Records',
    secondOpinion: 'Second Opinions',
    admin: 'Admin Control',
    totalPatients: 'Total Patients',
    greenRisk: 'Green (Low Risk)',
    yellowRisk: 'Yellow (Moderate)',
    redRisk: 'Red (High Urgency)',
    exportCsv: 'Export CSV Report',
    recentAssessments: 'Recent Clinical Assessments',
    registeredPatients: 'Registered Patients',
    viewHistory: 'View History',
    logout: 'Logout',
  },
  mr: {
    overview: 'मुख्य डॅशबोर्ड',
    register: 'रुग्ण नोंदणी',
    assess: 'नवीन तपासणी',
    patients: 'रुग्णांची यादी',
    secondOpinion: 'डॉक्टरांचा सल्ला',
    admin: 'प्रशासक नियंत्रण',
    totalPatients: 'एकूण रुग्ण',
    greenRisk: 'हिरवा (कमी धोका)',
    yellowRisk: 'पिवळा (मध्यम धोका)',
    redRisk: 'लाल (अतितातडीचे)',
    exportCsv: 'CSV अहवाल डाउनलोड करा',
    recentAssessments: 'अलीकडील वैद्यकीय तपासण्या',
    registeredPatients: 'नोंदणीकृत रुग्ण',
    viewHistory: 'इतिहास पहा',
    logout: 'बाहेर पडा',
  },
};

export function exportAssessmentsCSV(assessments) {
  const headers = ['ID', 'Patient Code', 'Patient Name', 'Village', 'Urgency', 'Temp (C)', 'SpO2 (%)', 'BP', 'Recommendation', 'Date'];
  const rows = assessments.map((a) => [
    a.id,
    a.patient_code,
    `"${a.patient_name}"`,
    `"${a.village || ''}"`,
    a.urgency_level,
    a.vital_signs?.temperature || '',
    a.vital_signs?.spo2 || '',
    `${a.vital_signs?.systolic_bp || ''}/${a.vital_signs?.diastolic_bp || ''}`,
    `"${(a.recommendation || '').replace(/"/g, '""')}"`,
    new Date(a.created_at).toLocaleDateString(),
  ]);
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `MediAssist_PHC_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
