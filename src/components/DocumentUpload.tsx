'use client';
import { useState } from 'react';

export default function DocumentUpload() {
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    // Simulación de lectura inteligente del documento (OCR / IA)
    setTimeout(() => {
      setUploading(false);
      if (file.type === "application/pdf") {
        setExtractedData("📄 PDF detectado: Reporte de Laboratorio del 10/06/2026. Glucosa: 105 mg/dL.");
      } else {
        setExtractedData("📸 Foto detectada: Receta Médica. Prescripción de Metformina.");
      }
    }, 2000);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm max-w-xl mx-auto my-4">
      <h2 className="text-lg font-semibold mb-4">📁 Búsqueda y Carga Inteligente de Documentos</h2>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
        <input 
          type="file" 
          accept="application/pdf, image/*" 
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <p className="text-gray-600 text-sm">Arrastra o selecciona tus reportes de laboratorio (**PDF o Fotos**)</p>
      </div>

      {uploading && <p className="text-blue-500 text-sm mt-3 animate-pulse">Leyendo y organizando automáticamente...</p>}

      {extractedData && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
          <p className="font-semibold">Datos Extraídos de Forma Automática:</p>
          <p>{extractedData}</p>
        </div>
      )}
    </div>
  );
}
