import GlucoseCharts from '@/components/GlucoseCharts';
import DocumentUpload from '@/components/DocumentUpload';

export default function GlucosePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold text-blue-600">📊 Glucose Tracking</h1>
          <p className="text-gray-600 mt-2">Monitor your glucose levels with STELO-like insights</p>
        </header>
        
        <GlucoseCharts />
        <DocumentUpload />
      </div>
    </div>
  );
}
