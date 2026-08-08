import React, { useState, useEffect } from 'react';
import { Search, User, Calendar, Stethoscope, FileText, ArrowRight, Sparkles, Clock, Loader2, Command } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

export const GlobalSearchModal = ({ isOpen, onClose, user, onNavigateSection }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K and Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Simulate quick filtering loading feedback
  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 200);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  };

  const searchTargetGroups = [
    {
      category: 'WORKSPACE & APPOINTMENTS',
      items: [
        { id: 'appointments', title: 'Schedule & Appointments', subtitle: 'View upcoming consultations & status', icon: Calendar, section: 'appointments' },
        { id: 'doctors', title: 'Specialist Doctor Directory', subtitle: 'Search verified cardiologists, neurologists...', icon: Stethoscope, section: 'doctors' }
      ]
    },
    {
      category: 'CLINICAL RECORDS & TRIAGE',
      items: [
        { id: 'triage', title: 'AI Clinical Triage Check', subtitle: 'Assess symptoms with AI advisor', icon: Sparkles, section: 'triage' },
        { id: 'passport', title: 'Medical Passport Records', subtitle: 'EHR health records & immunity status', icon: User, section: 'passport' },
        { id: 'prescriptions', title: 'Active Prescriptions', subtitle: 'Digital prescriptions & dosage instructions', icon: FileText, section: 'prescriptions' },
        { id: 'reports', title: 'Lab Reports & Diagnostics', subtitle: 'Blood panels, imaging, diagnostic PDFs', icon: Clock, section: 'reports' }
      ]
    }
  ];

  // Filter items based on query
  const filteredGroups = searchTargetGroups.map(group => ({
    ...group,
    items: group.items.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      group.category.toLowerCase().includes(query.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  const handleSelect = (sectionId) => {
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    }
    setQuery('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Global Medical Command Search"
      subtitle="Quick access across clinical records, doctors, appointments, and triage"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Command Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            autoFocus
            placeholder="Search doctors, appointments, prescriptions, lab reports... (e.g. 'Cardiology', 'Dr. Smith')"
            value={query}
            onChange={handleQueryChange}
            className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-10 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)] transition-all font-sans"
          />
          {isLoading ? (
            <Loader2 className="absolute right-3.5 top-3.5 w-4 h-4 text-[var(--color-primary)] animate-spin" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-3.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] font-mono"
            >
              Clear
            </button>
          ) : (
            <span className="absolute right-3 top-3 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5 hidden sm:inline-block">
              ESC
            </span>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-8 text-center space-y-2">
            <Loader2 className="w-6 h-6 text-[var(--color-primary)] animate-spin mx-auto" />
            <p className="text-xs text-[var(--text-secondary)] font-mono">Searching VeloCura Index...</p>
          </div>
        )}

        {/* Search Results / Grouped Navigation */}
        {!isLoading && filteredGroups.length > 0 && (
          <div className="space-y-4 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
            {filteredGroups.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider font-mono text-[var(--text-muted)] px-1">
                  <span>{group.category}</span>
                  <span>{group.items.length} Matches</span>
                </div>

                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.section)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:border-[var(--border-focus)] text-left hover:bg-[var(--bg-elevated)] transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary-subtle)] transition-colors shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-[var(--text-secondary)] truncate font-sans">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-transform shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty / No Results State */}
        {!isLoading && filteredGroups.length === 0 && (
          <div className="py-12 text-center space-y-2 border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-app)]">
            <Search className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
            <p className="text-xs font-semibold text-[var(--text-primary)] font-mono">No matching records found</p>
            <p className="text-[11px] text-[var(--text-secondary)]">
              No workstation sections match &quot;{query}&quot;. Try searching for &apos;triage&apos;, &apos;doctors&apos;, or &apos;appointments&apos;.
            </p>
          </div>
        )}

        {/* Footer Shortcut Bar */}
        <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-mono">
          <div className="flex items-center gap-1.5">
            <Command className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span>VeloCura Global Index</span>
          </div>
          <span>Use ⌘K / Ctrl+K anytime</span>
        </div>
      </div>
    </Modal>
  );
};
