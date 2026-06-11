'use client';
import { useState } from 'react';
import { Doctor } from '@/types/health';
import { Users } from 'lucide-react';

export default function DoctorsList() {
  const [doctors] = useState<Doctor[]>([
    {
      id: '1',
      firstName: 'Alexander',
      lastName: 'Rodriguez',
      specialty: 'Endocrinology',
      hospital: 'Central Medical Hospital',
      phone: '+1 (555) 234-5678',
      email: 'a.rodriguez@centralhospital.com',
      address: '123 Medical Plaza, Suite 450',
      license: 'MD-12345'
    },
    {
      id: '2',
      firstName: 'Maria',
      lastName: 'Garcia',
      specialty: 'Cardiology',
      hospital: 'Heart Care Center',
      phone: '+1 (555) 345-6789',
      email: 'm.garcia@heartcare.com',
      address: '456 Cardiac Drive, Suite 200',
      license: 'MD-12346'
    },
    {
      id: '3',
      firstName: 'James',
      lastName: 'Johnson',
      specialty: 'Nephrology',
      hospital: 'Kidney Specialist Clinic',
      phone: '+1 (555) 456-7890',
      email: 'j.johnson@kidneycare.com',
      address: '789 Renal Road, Suite 100',
      license: 'MD-12347'
    },
    {
      id: '4',
      firstName: 'Sarah',
      lastName: 'Williams',
      specialty: 'Primary Care',
      hospital: 'Family Health Center',
      phone: '+1 (555) 567-8901',
      email: 's.williams@familyhealth.com',
      address: '321 Health Street',
      license: 'MD-12348'
    },
  ]);

  const specialtyColors: { [key: string]: string } = {
    'Endocrinology': 'bg-blue-100 text-blue-800',
    'Cardiology': 'bg-red-100 text-red-800',
    'Nephrology': 'bg-cyan-100 text-cyan-800',
    'Primary Care': 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-blue-600">Medical Team</h1>
        </div>
        <p className="text-gray-600">Your healthcare professionals and specialists</p>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h2>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    specialtyColors[doctor.specialty] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {doctor.specialty}
                </span>
              </div>
              <div className="text-right text-xs text-gray-500">
                <p>License: {doctor.license}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 border-t pt-4">
              {/* Hospital */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Hospital / Clinic</p>
                <p className="font-semibold text-gray-800">{doctor.hospital}</p>
              </div>

              {/* Address */}
              {doctor.address && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Address</p>
                  <p className="text-gray-700">{doctor.address}</p>
                </div>
              )}

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Phone</p>
                  <a href={`tel:${doctor.phone}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                    {doctor.phone}
                  </a>
                </div>
                {doctor.email && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Email</p>
                    <a href={`mailto:${doctor.email}`} className="text-sm font-semibold text-purple-600 hover:text-purple-800 break-all">
                      {doctor.email.split('@')[0]}@...
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm">
                Call
              </button>
              <button className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition text-sm">
                Email
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Important Notes */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
        <h3 className="font-bold text-blue-900 mb-2">Keep Your Doctor Information Updated</h3>
        <p className="text-blue-800 text-sm">
          Make sure to update your doctor's contact information regularly. In case of emergencies, it's crucial to have accurate details readily available.
        </p>
      </div>
    </div>
  );
}
