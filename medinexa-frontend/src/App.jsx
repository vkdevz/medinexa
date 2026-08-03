import React from 'react';
import { HeartIcon, ShieldCheckIcon, CalendarIcon, UsersIcon } from '@heroicons/react/24/outline';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HeartIcon className="h-8 w-8 text-brand-600 animate-pulse" />
            <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              MediNexa
            </span>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
            <a href="#about" className="hover:text-brand-600 transition-colors">About</a>
            <span className="text-slate-300">|</span>
            <button className="text-slate-600 hover:text-brand-600 transition-colors font-medium">Log In</button>
            <button className="bg-brand-600 text-white hover:bg-brand-700 px-4 py-1.5 rounded-lg shadow-sm transition-all text-xs font-semibold">
              Register
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col justify-center items-center text-center">
        <div className="inline-flex items-center space-x-2 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full text-xs font-medium text-brand-700 mb-6 animate-fade-in">
          <ShieldCheckIcon className="h-4 w-4" />
          <span>Next-Generation Digital Healthcare Platform</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          Enterprise Healthcare, <br />
          <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
            Reimagined.
          </span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl">
          MediNexa connects patients, doctors, and healthcare administrators through a secure, high-performance, and unified interface. Built using Spring Boot 3, React, and MySQL.
        </p>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-brand-500 transition-all text-left group">
            <div className="bg-brand-50 p-3 rounded-xl inline-block text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">Seamless Scheduling</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Book, reschedule, or cancel consultations dynamically. Built-in concurrency handling guarantees zero overlap.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-accent-500 transition-all text-left group">
            <div className="bg-accent-50 p-3 rounded-xl inline-block text-accent-600 group-hover:bg-accent-600 group-hover:text-white transition-all duration-300">
              <UsersIcon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">Role-Based Portals</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Dedicated interfaces tailored for Patients, Doctors, and System Admins. Security enforced at both API and UI layers.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-500 transition-all text-left group">
            <div className="bg-emerald-50 p-3 rounded-xl inline-block text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">JWT & Spring Security</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Strict access control using cryptographically signed JSON Web Tokens (JWT) and BCrypt password encryption.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-center text-xs mt-auto">
        <p>&copy; {new Date().getFullYear()} MediNexa Healthcare. All rights reserved.</p>
        <p className="mt-2 text-slate-600">Designed & engineered as an enterprise portfolio demonstration.</p>
      </footer>
    </div>
  );
}

export default App;
