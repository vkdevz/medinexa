import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

// Components & UI Elements
import TelehealthRoom from '../components/TelehealthRoom';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Drawer } from '../components/ui/Drawer';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton, CardSkeleton } from '../components/ui/Skeleton';

// Clinical Components
import { PatientIdentityHeader } from '../components/clinical/PatientIdentityHeader';
import { VoiceDictationButton } from '../components/clinical/VoiceDictationButton';
import { PrescriptionReviewModal } from '../components/clinical/PrescriptionReviewModal';
import { ClinicalTimeline } from '../components/clinical/ClinicalTimeline';

// Icons
import {
  Calendar,
  Stethoscope,
  UserCheck,
  Award,
  Video,
  PhoneOff,
  CheckCircle2,
  AlertTriangle,
  Plus,
  FileText,
  Clock,
  Shield,
  Trash2,
  X,
  Search,
  Users,
  ArrowRight,
  Activity,
  Filter,
  User,
  ShieldCheck
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Active Tab state
  const [activeTab, setActiveTab] = useState('schedule');

  useEffect(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const sub = segments[1];
    if (sub && sub !== 'dashboard' && ['schedule', 'patients', 'appointments', 'consultations', 'prescriptions', 'passport', 'profile'].includes(sub)) {
      setActiveTab(sub);
    } else if (sub === 'dashboard') {
      setActiveTab('schedule');
    }
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'schedule') {
      navigate('/doctor/dashboard');
    } else {
      navigate(`/doctor/${tabId}`);
    }
  };

  // Core Data States
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Filtering States
  const [patientSearch, setPatientSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Profile Edit fields
  const [specialty, setSpecialty] = useState('General Medicine');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [bio, setBio] = useState('');
  const [consultationFee, setConsultationFee] = useState(50.00);

  // Active Consultation Encounter States
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('7 Days');
  const [instructions, setInstructions] = useState('');
  
  // Safety Prescription Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Patient Passport Drawer / Workspace States
  const [passportPatient, setPassportPatient] = useState(null);
  const [showPassportDrawer, setShowPassportDrawer] = useState(false);
  const [passportLoading, setPassportLoading] = useState(false);

  // Telehealth Video Session State
  const [activeVideoSession, setActiveVideoSession] = useState(null);

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    setLoading(true);
    setError('');
    try {
      const profRes = await api.get('/api/doctor/profile');
      setProfile(profRes.data);
      if (profRes.data) {
        setSpecialty(profRes.data.specialty || 'General Medicine');
        setLicenseNumber(profRes.data.licenseNumber || '');
        setBio(profRes.data.bio || '');
        setConsultationFee(profRes.data.consultationFee || 50.00);
      }

      const apptRes = await api.get('/api/doctor/appointments');
      const apptData = apptRes.data || [];
      setAppointments(apptData);

      // Default select the first active appt for quick consultation work if available
      const activeAppts = apptData.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING');
      if (activeAppts.length > 0 && !selectedAppt) {
        setSelectedAppt(activeAppts[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load doctor workstation records.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      const res = await api.put('/api/doctor/profile/update', {
        specialty,
        licenseNumber,
        bio,
        consultationFee
      });
      setProfile(res.data);
      setSuccess('Doctor credentials updated successfully.');
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError('Failed to update doctor credentials.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewPatientPassport = async (patientId) => {
    setPassportLoading(true);
    setShowPassportDrawer(true);
    try {
      const res = await api.get(`/api/doctor/patient-passport/${patientId}`);
      setPassportPatient(res.data);
    } catch (err) {
      setError('Failed to retrieve patient passport record.');
    } finally {
      setPassportLoading(false);
    }
  };

  const handleStartVideoCall = async (appt) => {
    const room = `velocura-room-${appt.appointmentId || appt.id}`;
    const drName = user?.firstName ? `Dr. ${user.firstName} ${user.lastName || ''}` : 'Doctor';

    try {
      await api.post(`/api/consultations/ring?appointmentId=${appt.appointmentId || appt.id}&roomName=${room}&doctorName=${encodeURIComponent(drName)}&patientId=${appt.patientId}`);
      setActiveVideoSession({
        roomName: room,
        patientId: appt.patientId
      });
    } catch (err) {
      setError('Failed to initiate telehealth video ring.');
    }
  };

  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm('Cancel this scheduled patient consultation?')) return;
    try {
      setActionLoading(true);
      await api.put(`/api/doctor/appointments/cancel/${apptId}`);
      setSuccess('Appointment cancelled.');
      const apptRes = await api.get('/api/doctor/appointments');
      setAppointments(apptRes.data || []);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to cancel appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  // Triggers the safety prescription review modal before final submission
  const handleOpenReviewModal = (e) => {
    e.preventDefault();
    if (!selectedAppt) {
      setError('Please select an active patient appointment.');
      return;
    }
    if (!diagnosis.trim()) {
      setError('Diagnosis notes are required to complete the visit.');
      return;
    }
    setError('');
    setShowReviewModal(true);
  };

  // Final submission of clinical diagnosis and optional prescription
  const handleFinalSubmitConsultation = async () => {
    if (!selectedAppt) return;
    setActionLoading(true);
    setError('');

    try {
      // 1. Add Diagnosis/Medical Record
      if (diagnosis.trim()) {
        await api.post('/api/doctor/medical-history', {
          patientId: selectedAppt.patientId,
          diagnosis,
          treatment: instructions || 'Follow prescribed care directives.'
        });
      }

      // 2. Issue Prescription if medication entered
      if (medicationName.trim()) {
        await api.post('/api/doctor/prescriptions', {
          patientId: selectedAppt.patientId,
          medicationName,
          dosage,
          frequency,
          instructions
        });
      }

      // 3. Mark appointment complete
      await api.put(`/api/doctor/appointments/complete/${selectedAppt.appointmentId || selectedAppt.id}`);
      setSuccess('Consultation completed and prescription issued.');
      
      setShowReviewModal(false);
      setDiagnosis('');
      setMedicationName('');
      setDosage('');
      setFrequency('');
      setInstructions('');
      setSelectedAppt(null);

      const apptRes = await api.get('/api/doctor/appointments');
      const freshAppts = apptRes.data || [];
      setAppointments(freshAppts);
      
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError('Failed to complete clinical consultation.');
    } finally {
      setActionLoading(false);
    }
  };

  // Section titles definition
  const sectionTitles = {
    schedule: 'Clinical Operational Workspace',
    patients: 'Patient Directory & Clinical Workspaces',
    appointments: 'Appointments & Consultations Schedule',
    consultations: 'Active Clinical Consultation Encounter',
    prescriptions: 'Prescriptions Log & Directives',
    passport: 'Patient Medical Records Inspector',
    profile: 'Doctor Professional Credentials & Status'
  };

  // Calculated Operational Statistics
  const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED').length;
  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

  // Next immediate patient calculation
  const nextPatientAppt = appointments.find(a => a.status === 'CONFIRMED' || a.status === 'PENDING');

  // Filtered Appointments list
  const filteredAppointments = appointments.filter(appt => {
    const matchSearch =
      !patientSearch ||
      (appt.patientName && appt.patientName.toLowerCase().includes(patientSearch.toLowerCase())) ||
      (appt.patientId && appt.patientId.toString().includes(patientSearch)) ||
      (appt.reason && appt.reason.toLowerCase().includes(patientSearch.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || appt.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <AppShell
      activeSection={activeTab}
      onSelectSection={handleTabChange}
      sectionTitles={sectionTitles}
    >
      {/* Telehealth Video Room Frame */}
      {activeVideoSession && (
        <TelehealthRoom
          roomName={activeVideoSession.roomName}
          userName={user?.firstName ? `Dr. ${user.firstName} ${user.lastName || ''}` : 'Doctor'}
          onClose={async () => {
            try {
              await api.post(`/api/consultations/hangup?patientId=${activeVideoSession.patientId}`);
            } catch (e) {}
            setActiveVideoSession(null);
          }}
        />
      )}

      {/* Global Alerts */}
      {error && <Alert variant="error" onClose={() => setError('')} className="mb-4">{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} className="mb-4">{success}</Alert>}

      {/* Unverified Credential Status Alert */}
      {profile && !profile.isVerified && (
        <Alert variant="warning" title="Credentials Pending Admin Verification" className="mb-6">
          Your medical practitioner license (<strong>{profile.licenseNumber || 'Unassigned'}</strong>) is under administrative audit. You can still conduct visits and view patient records.
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* TAB 1: CLINICAL OPERATIONAL WORKSPACE (DASHBOARD)                         */}
          {/* ========================================================================= */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {/* Doctor Operational Summary Banner */}
              <div className="p-6 surface-card border-l-4 border-l-[var(--color-primary)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
                      Welcome, Dr. {user?.firstName} {user?.lastName}
                    </h2>
                    {profile?.isVerified ? (
                      <Badge variant="teal" className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Practitioner
                      </Badge>
                    ) : (
                      <Badge variant="warning">Verification Pending</Badge>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
                    Specialty: <span className="text-[var(--color-primary)] font-bold">{specialty}</span> • Rate: ${consultationFee}/visit
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)] text-center">
                    <span className="block text-[10px] font-mono text-[var(--text-muted)] uppercase">TODAY'S VISITS</span>
                    <span className="text-sm font-extrabold text-[var(--text-primary)] font-mono">{appointments.length}</span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-lg bg-[var(--color-primary-subtle)] border border-[var(--color-primary)]/20 text-center">
                    <span className="block text-[10px] font-mono text-[var(--color-primary)] uppercase">CONFIRMED</span>
                    <span className="text-sm font-extrabold text-[var(--color-primary)] font-mono">{confirmedCount}</span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-lg bg-[var(--color-warning-subtle)] border border-[var(--color-warning)]/20 text-center">
                    <span className="block text-[10px] font-mono text-[var(--color-warning)] uppercase">PENDING</span>
                    <span className="text-sm font-extrabold text-[var(--color-warning)] font-mono">{pendingCount}</span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-lg bg-[var(--color-success-subtle)] border border-[var(--color-success)]/20 text-center">
                    <span className="block text-[10px] font-mono text-[var(--color-success)] uppercase">COMPLETED</span>
                    <span className="text-sm font-extrabold text-[var(--color-success)] font-mono">{completedCount}</span>
                  </div>
                </div>
              </div>

              {/* NEXT PATIENT HERO SECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[var(--color-primary)]" />
                    Immediate Next Patient Encounter
                  </h3>
                  {nextPatientAppt && (
                    <span className="text-[11px] font-mono text-[var(--color-teal)] font-medium">Ready for Consultation</span>
                  )}
                </div>

                {nextPatientAppt ? (
                  <div className="p-5 surface-elevated border border-[var(--border-focus)] space-y-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary-subtle)] rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] text-[var(--text-inverse)] flex items-center justify-center font-black text-lg shadow">
                          {nextPatientAppt.patientName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-3">
                            <h4 className="text-base font-bold text-[var(--text-primary)]">{nextPatientAppt.patientName}</h4>
                            <StatusBadge status={nextPatientAppt.status} />
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] font-mono mt-1">
                            Scheduled: <span className="text-[var(--text-primary)] font-bold">{nextPatientAppt.appointmentTime}</span>
                          </p>
                          <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1 italic">
                            Reason: "{nextPatientAppt.reason}"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
                        <Button
                          variant="primary"
                          size="md"
                          icon={Stethoscope}
                          onClick={() => {
                            setSelectedAppt(nextPatientAppt);
                            handleTabChange('consultations');
                          }}
                        >
                          Open Consultation
                        </Button>
                        <Button
                          variant="secondary"
                          size="md"
                          icon={Video}
                          onClick={() => handleStartVideoCall(nextPatientAppt)}
                        >
                          Ring Telehealth
                        </Button>
                        <Button
                          variant="ghost"
                          size="md"
                          icon={UserCheck}
                          onClick={() => handleViewPatientPassport(nextPatientAppt.patientId)}
                        >
                          Passport
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={CheckCircle2}
                    title="No Pending Encounters Today"
                    description="All scheduled patient visits for today have been completed or cancelled."
                  />
                )}
              </div>

              {/* PATIENTS REQUIRING ATTENTION & TODAY'S SCHEDULE */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Schedule Table */}
                <Card className="lg:col-span-2 space-y-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle subtitle="Chronological queue of patient appointments">
                        Today's Clinical Schedule
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={ArrowRight}
                        iconPosition="right"
                        onClick={() => handleTabChange('appointments')}
                      >
                        All Schedule
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {appointments.length === 0 ? (
                      <div className="p-6">
                        <EmptyState title="No Scheduled Appointments" description="Your appointment roster is currently clear." />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {appointments.slice(0, 5).map((appt) => (
                            <TableRow key={appt.appointmentId || appt.id}>
                              <TableCell className="font-mono text-xs font-bold text-[var(--text-primary)]">
                                {appt.appointmentTime}
                              </TableCell>
                              <TableCell>
                                <button
                                  onClick={() => handleViewPatientPassport(appt.patientId)}
                                  className="font-bold text-[var(--color-primary)] hover:underline text-left cursor-pointer text-xs"
                                >
                                  {appt.patientName}
                                </button>
                              </TableCell>
                              <TableCell className="text-xs text-[var(--text-secondary)] max-w-xs truncate">
                                {appt.reason}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={appt.status} />
                              </TableCell>
                              <TableCell className="text-right space-x-1.5">
                                {(appt.status === 'CONFIRMED' || appt.status === 'PENDING') && (
                                  <>
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedAppt(appt);
                                        handleTabChange('consultations');
                                      }}
                                    >
                                      Consult
                                    </Button>
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Priority Queue Sidebar */}
                <Card className="space-y-4">
                  <CardHeader>
                    <CardTitle subtitle="Visits pending action">Priority Queue</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {appointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length === 0 ? (
                      <p className="text-xs text-[var(--text-muted)] text-center py-4">No active patients in priority queue.</p>
                    ) : (
                      appointments
                        .filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED')
                        .slice(0, 4)
                        .map(appt => (
                          <div
                            key={appt.appointmentId || appt.id}
                            className="p-3 surface-card flex items-center justify-between gap-2 hover:border-[var(--border-focus)] cursor-pointer"
                            onClick={() => {
                              setSelectedAppt(appt);
                              handleTabChange('consultations');
                            }}
                          >
                            <div>
                              <p className="text-xs font-bold text-[var(--text-primary)]">{appt.patientName}</p>
                              <p className="text-[10px] font-mono text-[var(--text-muted)]">{appt.appointmentTime}</p>
                            </div>
                            <Badge variant="cyan" className="text-[10px]">Open Visit</Badge>
                          </div>
                        ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PATIENT DIRECTORY & ENTERPRISE CLINICAL WORKSPACE                  */}
          {/* ========================================================================= */}
          {activeTab === 'patients' && (
            <div className="space-y-6">
              {/* Filter & Search Bar */}
              <div className="p-4 surface-card flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--text-muted)]" />
                  <Input
                    placeholder="Search patient name, ID, or clinical reason..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center space-x-2 text-xs font-mono text-[var(--text-muted)]">
                  <Users className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>Showing {filteredAppointments.length} Patient Encounters</span>
                </div>
              </div>

              {/* Enterprise Clinical Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Identifier</TableHead>
                    <TableHead>Scheduled Time</TableHead>
                    <TableHead>Primary Clinical Reason</TableHead>
                    <TableHead>Encounter Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <EmptyState title="No Matching Patients" description="No patient records match the search filter." />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((appt) => (
                      <TableRow key={appt.appointmentId || appt.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center font-bold text-xs">
                              {appt.patientName.charAt(0)}
                            </div>
                            <div>
                              <button
                                onClick={() => handleViewPatientPassport(appt.patientId)}
                                className="font-bold text-[var(--text-primary)] hover:text-[var(--color-primary)] text-left block text-xs"
                              >
                                {appt.patientName}
                              </button>
                              <span className="text-[10px] font-mono text-[var(--text-muted)]">ID: #{appt.patientId}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-[var(--text-secondary)]">
                          {appt.appointmentTime}
                        </TableCell>
                        <TableCell className="text-xs text-[var(--text-secondary)] max-w-sm truncate">
                          {appt.reason}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={appt.status} />
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={UserCheck}
                            onClick={() => handleViewPatientPassport(appt.patientId)}
                          >
                            Medical Passport
                          </Button>
                          {(appt.status === 'CONFIRMED' || appt.status === 'PENDING') && (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={Stethoscope}
                              onClick={() => {
                                setSelectedAppt(appt);
                                handleTabChange('consultations');
                              }}
                            >
                              Consult Workspace
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: APPOINTMENTS & CONSULTATIONS SCHEDULE                              */}
          {/* ========================================================================= */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              {/* Status Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 surface-card">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-[var(--color-primary)]" />
                  <span className="text-xs font-mono uppercase font-bold text-[var(--text-muted)]">Filter Status:</span>
                  {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`text-xs font-mono px-3 py-1 rounded transition-colors ${
                        statusFilter === st
                          ? 'bg-[var(--color-primary)] text-[var(--text-inverse)] font-bold'
                          : 'bg-[var(--bg-app)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <span className="text-xs font-mono text-[var(--text-muted)]">
                  Total Visits: {filteredAppointments.length}
                </span>
              </div>

              {/* Appointments Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Symptom / Clinical Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <EmptyState title="No Scheduled Appointments" description="No appointments match the current status filter." />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((appt) => (
                      <TableRow key={appt.appointmentId || appt.id}>
                        <TableCell>
                          <button
                            onClick={() => handleViewPatientPassport(appt.patientId)}
                            className="font-bold text-[var(--color-primary)] hover:underline text-xs"
                          >
                            {appt.patientName}
                          </button>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-[var(--text-primary)] font-semibold">
                          {appt.appointmentTime}
                        </TableCell>
                        <TableCell className="text-xs text-[var(--text-secondary)] max-w-xs truncate">
                          {appt.reason}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={appt.status} />
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {(appt.status === 'CONFIRMED' || appt.status === 'PENDING') && (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={Video}
                                onClick={() => handleStartVideoCall(appt)}
                              >
                                Ring Call
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                icon={Stethoscope}
                                onClick={() => {
                                  setSelectedAppt(appt);
                                  handleTabChange('consultations');
                                }}
                              >
                                Open Encounter
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleCancelAppointment(appt.appointmentId || appt.id)}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: ACTIVE CLINICAL CONSULTATION WORKSPACE                             */}
          {/* ========================================================================= */}
          {activeTab === 'consultations' && (
            <div className="space-y-6">
              {/* Encounter Patient Selector Bar */}
              <div className="p-4 surface-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4 border-l-[var(--color-primary)]">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Active Encounter Selection</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Select a scheduled patient to open clinical context and record visit observations.</p>
                </div>
                <div className="w-full sm:w-72">
                  <Select
                    value={selectedAppt ? (selectedAppt.appointmentId || selectedAppt.id) : ''}
                    onChange={(e) => {
                      const id = e.target.value;
                      const appt = appointments.find(a => (a.appointmentId || a.id).toString() === id);
                      setSelectedAppt(appt || null);
                    }}
                    options={[
                      { value: '', label: '-- Select Patient Visit --' },
                      ...appointments.map(a => ({
                        value: a.appointmentId || a.id,
                        label: `${a.patientName} (${a.appointmentTime}) - ${a.status}`
                      }))
                    ]}
                  />
                </div>
              </div>

              {selectedAppt ? (
                /* CLINICAL WORKSPACE SPLIT LAYOUT (Desktop Split / Mobile Stacked) */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT / CONTEXT PANEL (4 cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Patient Header & Allergy Alert */}
                    <PatientIdentityHeader patient={selectedAppt} />

                    {/* Patient Context & Encounter Details */}
                    <Card className="space-y-3">
                      <CardHeader>
                        <CardTitle subtitle="Clinical reason submitted during booking">
                          Encounter Context
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="p-3 bg-[var(--bg-app)] rounded-lg border border-[var(--border-subtle)] space-y-1">
                          <span className="block text-[10px] font-mono text-[var(--text-muted)] uppercase">Chief Complaint / Reason</span>
                          <p className="text-xs text-[var(--text-primary)] font-medium italic">
                            "{selectedAppt.reason}"
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Video}
                            className="w-full"
                            onClick={() => handleStartVideoCall(selectedAppt)}
                          >
                            Launch Telehealth Ring
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={UserCheck}
                            onClick={() => handleViewPatientPassport(selectedAppt.patientId)}
                          >
                            Passport
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* RIGHT / ACTIVE ENCOUNTER FORM PANEL (7 cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    <Card className="space-y-5">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle subtitle="Record medical diagnosis and treatment directives">
                            Clinical Encounter Documentation
                          </CardTitle>
                          <Badge variant="cyan">SOAP Format</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleOpenReviewModal} className="space-y-5">
                          
                          {/* Clinical Diagnosis textarea with Voice Dictation */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                <Stethoscope className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                                Diagnosis & Clinical Observations *
                              </label>
                              <VoiceDictationButton
                                onTranscript={(text) => setDiagnosis(prev => prev ? `${prev} ${text}` : text)}
                              />
                            </div>
                            <Textarea
                              placeholder="Record clinical observations, physical exam notes, and diagnosis..."
                              value={diagnosis}
                              onChange={(e) => setDiagnosis(e.target.value)}
                              rows={4}
                              required
                            />
                          </div>

                          {/* Prescription Form Section */}
                          <div className="p-4 surface-elevated border border-[var(--border-subtle)] space-y-4 rounded-xl">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold font-mono text-[var(--color-teal)] uppercase flex items-center gap-1.5">
                                <FileText className="w-4 h-4" />
                                Prescription Builder (Optional)
                              </h4>
                              <VoiceDictationButton
                                label="Dictate Directives"
                                onTranscript={(text) => setInstructions(prev => prev ? `${prev} ${text}` : text)}
                              />
                            </div>

                            <Input
                              label="Medication Name"
                              placeholder="e.g. Amoxicillin 500mg"
                              value={medicationName}
                              onChange={(e) => setMedicationName(e.target.value)}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <Input
                                label="Dosage"
                                placeholder="500 mg"
                                value={dosage}
                                onChange={(e) => setDosage(e.target.value)}
                              />
                              <Input
                                label="Frequency"
                                placeholder="Twice Daily"
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value)}
                              />
                              <Input
                                label="Duration"
                                placeholder="7 Days"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                              />
                            </div>

                            <Textarea
                              label="Special Patient Directives"
                              placeholder="Take with meals, avoid driving..."
                              value={instructions}
                              onChange={(e) => setInstructions(e.target.value)}
                              rows={2}
                            />
                          </div>

                          {/* Submit Action */}
                          <div className="flex justify-end gap-3 pt-2">
                            <Button
                              type="submit"
                              variant="primary"
                              size="md"
                              icon={CheckCircle2}
                              isLoading={actionLoading}
                            >
                              Review & Complete Encounter
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={Stethoscope}
                  title="No Active Patient Selected"
                  description="Select a patient encounter from the dropdown above to open the clinical workstation."
                />
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: PRESCRIPTIONS LOG                                                  */}
          {/* ========================================================================= */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4 p-4 surface-card">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Prescriptions Directives Directory</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Review all medication prescriptions issued across your clinical visits.</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => handleTabChange('consultations')}
                >
                  Create New Prescription
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Scheduled Time</TableHead>
                    <TableHead>Clinical Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <EmptyState title="No Prescriptions Issued" description="No prescription directives recorded yet." />
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments.map((appt) => (
                      <TableRow key={appt.appointmentId || appt.id}>
                        <TableCell className="font-bold text-xs text-[var(--text-primary)]">
                          {appt.patientName}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-[var(--text-secondary)]">
                          {appt.appointmentTime}
                        </TableCell>
                        <TableCell className="text-xs text-[var(--text-secondary)] max-w-xs truncate">
                          {appt.reason}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={appt.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Stethoscope}
                            onClick={() => {
                              setSelectedAppt(appt);
                              handleTabChange('consultations');
                            }}
                          >
                            Open Consultation
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: MEDICAL RECORDS & PASSPORT INSPECTOR                               */}
          {/* ========================================================================= */}
          {activeTab === 'passport' && (
            <div className="space-y-6">
              <Card className="space-y-4">
                <CardHeader>
                  <CardTitle subtitle="Select a patient from your roster to inspect medical history, allergies, and vitals">
                    Patient Medical Records Inspector
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {appointments.map((appt) => (
                      <div
                        key={appt.appointmentId || appt.id}
                        onClick={() => handleViewPatientPassport(appt.patientId)}
                        className="p-4 surface-card hover:border-[var(--border-focus)] cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)]">{appt.patientName}</p>
                          <p className="text-[10px] font-mono text-[var(--text-muted)]">ID: #{appt.patientId}</p>
                        </div>
                        <Badge variant="cyan" className="text-[10px]">Inspect Passport</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: DOCTOR CREDENTIALS & PROFILE                                       */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle subtitle="Update license number, medical specialty, and consultation rate">
                    Practitioner Credentials & Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <Select
                      label="Medical Specialty"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      options={['General Medicine', 'Cardiology', 'Neurology', 'Pediatrics', 'Dermatology']}
                      required
                    />
                    <Input
                      label="Medical License Number"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      required
                    />
                    <Input
                      label="Consultation Rate ($ USD)"
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(parseFloat(e.target.value))}
                      required
                    />
                    <Textarea
                      label="Professional Biography"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                    />
                    <Button type="submit" variant="primary" size="sm" isLoading={actionLoading}>
                      Save Credential Updates
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="space-y-3">
                <h4 className="text-xs font-bold font-mono uppercase text-[var(--text-primary)] flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
                  Verification Guidelines
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Medical licenses are audited against active regulatory registers. Ensure license details remain up to date to preserve verified practitioner badge status.
                </p>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Safety Prescription Review Modal */}
      <PrescriptionReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onConfirm={handleFinalSubmitConsultation}
        isLoading={actionLoading}
        prescriptionData={{
          patientName: selectedAppt?.patientName || 'Selected Patient',
          medicationName,
          dosage,
          frequency,
          duration,
          instructions
        }}
      />

      {/* Patient Passport Drawer */}
      <Drawer
        isOpen={showPassportDrawer}
        onClose={() => setShowPassportDrawer(false)}
        title="Patient Medical Passport"
        subtitle={passportPatient ? `Patient ID: #${passportPatient.patientId || 'N/A'}` : ''}
      >
        {passportLoading ? (
          <CardSkeleton />
        ) : passportPatient ? (
          <div className="space-y-6">
            <PatientIdentityHeader patient={passportPatient} />

            <div className="space-y-2">
              <h4 className="text-xs font-bold font-mono text-[var(--text-muted)] uppercase">Medical History Timeline</h4>
              <ClinicalTimeline timelineData={passportPatient.medicalHistoryTimeline} />
            </div>
          </div>
        ) : (
          <EmptyState title="No Passport Record" description="Select a valid patient to view their passport." />
        )}
      </Drawer>
    </AppShell>
  );
};

export default DoctorDashboard;
