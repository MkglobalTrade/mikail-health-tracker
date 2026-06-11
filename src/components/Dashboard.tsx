'use client';
import { useState } from 'react';
import { HealthProfile } from '@/types/health';

export default function Dashboard() {
  const [profile, setProfile] = useState<HealthProfile>({
    surgeries: ['Apendicectomía (2018)'],
    vaccines: ['Influenza (2025)', 'Tétanos (2022)'],
    allergies: ['Penicilina'],
    emergencyContacts: [{ name: 'María Doe', phone: '+123456789', relation: 'Esposa' }],
    insurance: { provider: 'SaludSegura', policyNumber: 'SS-987654' },
    documents: []
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<{role: string, text: string}[]>([]);

  // Alerta de simulación si un valor empeora
  const healthAlert = "⚠️ Alerta: Tu variabilidad de glucosa aumentó un 15% respecto a la semana pasada.";

  const handleAIChat = () => {
    if (!chatInput) return;
    const userMsg = { role: 'user', text: chatInput };
    const aiMsg = { role: 'ai', text: `Analizando tus laboratorios... Basado en tu historial de ${profile.allergies[0]}, te recomiendo consultar a tu médico sobre este valor.` };
    setChatLog([...chatLog, userMsg, aiMsg]);
    setChatInput('');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-blue-600">Resumen Anual de Salud 2026</h1>
        <div className="space-x-2">
          <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">Exportar PDF</button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">Exportar Excel</button>
        </div>
      </header>

      {healthAlert && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl text-amber-800">
          {healthAlert}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Historiales */}
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">📋 Historial Clínico</h2>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Cirugías</h3>
            <p className="text-gray-800">{profile.surgeries.join(', ')}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Vacunas</h3>
            <p className="text-gray-800">{profile.vaccines.join(', ')}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Alergias</h3>
            <p className="text-red-600 font-medium">{profile.allergies.join(', ')}</p>
          </div>
        </div>

        {/* Cobertura y Contactos */}
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">🛡️ Seguro y Emergencias</h2>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Seguro Médico</h3>
            <p className="text-gray-800">{profile.insurance.provider} - {profile.insurance.policyNumber}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Contacto de Emergencia</h3>
            {profile.emergencyContacts.map((c, i) => (
              <p key={i} className="text-gray-800">{c.name} ({c.relation}): {c.phone}</p>
            ))}
          </div>
        </div>

        {/* Chat de IA */}
        <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col h-[300px]">
          <h2 className="text-lg font-semibold border-b pb-2 mb-2">🤖 Chat con IA Médica</h2>
          <div className="flex-1 overflow-y-auto space-y-2 mb-2 text-sm">
            {chatLog.map((m, i) => (
              <div key={i} className={`p-2 rounded-lg ${m.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100'}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Pregunta sobre tus análisis..." 
              className="border rounded-lg p-2 text-sm flex-1"
            />
            <button onClick={handleAIChat} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">Enviar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
