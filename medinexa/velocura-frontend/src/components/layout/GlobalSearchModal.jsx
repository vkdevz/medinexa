import React, { useState } from 'react';
import { Search, User, Calendar, Stethoscope, FileText, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';

export const GlobalSearchModal = ({ isOpen, onClose, user, onNavigateSection }) => {
  const [query, setQuery] = useState('');

  const searchCategories = [
    { id: 'appointments', title: 'Appointments & Schedule', icon: Calendar, section: 'appointments' },
    { id: 'doctors', title: 'Medical Specialists & Doctors', icon: Stethoscope, section: 'doctors' },
    { id: 'prescriptions', title: 'Prescriptions & Medications', icon: FileText, section: 'prescriptions' },
    { id: 'passport', title: 'Patient Passport & History', icon: User, section: 'passport' }
  ];

  const filteredCategories = searchCategories.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) || query === ''
  );

  const handleSelect = (section) => {
    if (onNavigateSection) {
      onNavigateSection(section);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Global Medical Search"
      subtitle="Search appointments, doctors, prescriptions, and health records"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            autoFocus
            placeholder="Type doctor name, specialty, prescription, or appointment status..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Quick Navigation Group */}
        <div className="space-y-2 pt-2">
          <p className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-500">
            Quick Section Access
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelect(cat.section)}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 text-left hover:bg-slate-850 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                      {cat.title}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
