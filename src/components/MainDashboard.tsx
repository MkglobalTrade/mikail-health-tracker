'use client';
import Link from 'next/link';
import { Activity, Droplet, Pill, Users } from 'lucide-react';

export default function MainDashboard() {
  const features = [
    {
      icon: Activity,
      title: 'Lab Results',
      description: 'Track and compare laboratory tests with color-coded status indicators',
      href: '/labs',
      color: 'blue',
      gradient: 'from-blue-50 to-blue-100'
    },
    {
      icon: Droplet,
      title: 'Sugar Levels',
      description: 'Monitor daily glucose readings organized by daily, weekly, and monthly views',
      href: '/sugar',
      color: 'red',
      gradient: 'from-red-50 to-red-100'
    },
    {
      icon: Pill,
      title: 'Medications',
      description: 'Manage your medications with daily schedule and reminder notifications',
      href: '/medications',
      color: 'purple',
      gradient: 'from-purple-50 to-purple-100'
    },
    {
      icon: Users,
      title: 'Medical Team',
      description: 'View all your doctors and specialists information in one place',
      href: '/doctors',
      color: 'green',
      gradient: 'from-green-50 to-green-100'
    },
    {
      icon: Activity,
      title: 'AI Chat',
      description: 'Ask questions about your labs, glucose, medications, and doctors',
      href: '/chat',
      color: 'teal',
      gradient: 'from-teal-50 to-teal-100'
    },
  ];

  const colorClasses: { [key: string]: string } = {
    blue: 'text-blue-600 bg-blue-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100',
    green: 'text-green-600 bg-green-100',
    teal: 'text-teal-600 bg-teal-100',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-bold mb-4">Health Tracker Pro</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Comprehensive health management system for tracking labs, glucose levels, medications, and medical professionals
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-semibold">Active Medications</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">4</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
            <p className="text-gray-600 text-sm font-semibold">Last Glucose Check</p>
            <p className="text-3xl font-bold text-red-600 mt-2">132</p>
            <p className="text-xs text-gray-500 mt-1">mg/dL</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm font-semibold">Lab Tests</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">5</p>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-semibold">Doctors</p>
            <p className="text-3xl font-bold text-green-600 mt-2">4</p>
            <p className="text-xs text-gray-500 mt-1">Specialists</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Health Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={index} href={feature.href}>
                  <div
                    className={`bg-gradient-to-br ${feature.gradient} p-8 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer border border-gray-200`}
                  >
                    <div className={`w-16 h-16 rounded-full ${colorClasses[feature.color]} flex items-center justify-center mb-4`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-700 mb-4">{feature.description}</p>
                    <div className="inline-block px-4 py-2 bg-white rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">
                      Access Module →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Health Tips */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Health Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-bold text-gray-900 mb-2">Regular Check-ups</h4>
              <p className="text-gray-700 text-sm">Schedule regular appointments with your doctors to monitor your health progress.</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-bold text-gray-900 mb-2">Medication Adherence</h4>
              <p className="text-gray-700 text-sm">Take your medications exactly as prescribed to ensure optimal health outcomes.</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-bold text-gray-900 mb-2">Monitor Results</h4>
              <p className="text-gray-700 text-sm">Keep track of your lab and glucose levels to identify trends and changes.</p>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-gray-600 text-sm">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
