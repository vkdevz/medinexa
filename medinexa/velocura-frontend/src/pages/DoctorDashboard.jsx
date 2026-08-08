import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
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
  X
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('schedule');

  // Core Data states
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Profile Edit fields
  const [specialty, setSpecialty] = useState('General Medicine');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [bio, setBio] = useState('');
  const [consultationFee, setConsultationFee] = useState(50.00);

  // Consultation completion modal fields
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('7 Days');
  const [instructions, setInstructions] = useState('');
  const [showConsultationModal, setShowConsultationModal] = useState(false);

  // Patient Passport Drawer states
  const [passportPatient, setPassportPatient] = useState(null);
  const [showPassportDrawer, setShowPassportDrawer] = useState(false);
  const [passportLoading, setPassportLoading] = useState(false);

  // Telehealth Video Session
  const [activeVideoSession, setActiveVideoSession] = useState(null);

  // Account Self-Deletion states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCode, setDeleteCode] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

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
      setAppointments(apptRes.data);
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
      setSuccess('Doctor credentials updated.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update credentials.');
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
      setError('Failed to retrieve patient passport.');
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
    if (!window.confirm('Cancel this scheduled consultation?')) return;
    try {
      setActionLoading(true);
      await api.put(`/api/doctor/appointments/cancel/${apptId}`);
      setSuccess('Appointment cancelled.');
      const apptRes = await api.get('/api/doctor/appointments');
      setAppointments(apptRes.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to cancel appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteConsultation = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setActionLoading(true);
    setError('');

    try {
      if (diagnosis.trim()) {
        await api.post('/api/doctor/medical-history', {
          patientId: selectedAppt.patientId,
          diagnosis,
          treatment: instructions || 'Follow prescribed medication instructions.'
        });
      }

      if (medicationName.trim()) {
        await api.post('/api/doctor/prescriptions', {
          patientId: selectedAppt.patientId,
          medicationName,
          dosage,
          frequency,
          instructions
        });
      }

      await api.put(`/api/doctor/appointments/complete/${selectedAppt.appointmentId || selectedAppt.id}`);
      setSuccess('Consultation completed and prescription issued.');
      setShowConsultationModal(false);
      setSelectedAppt(null);

      const apptRes = await api.get('/api/doctor/appointments');
      setAppointments(apptRes.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to complete consultation.');
    } finally {
      setActionLoading(false);
    }
  };

  const sectionTitles = {
    schedule: 'Today\'s Clinical Schedule',
    consultations: 'Patient Consultations',
    passport: 'Patient Passport Viewer',
    profile: 'Doctor Profile & Status'
  };

  return (
    <AppShell
      activeSection={activeTab}
      onSelectSection={setActiveTab}
      sectionTitles={sectionTitles}
    >
      {/* Active Telehealth Room Frame */}
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

      {/* System Alerts */}
      {error && <Alert variant="error" onClose={() => setError('')} className="mb-4">{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} className="mb-4">{success}</Alert>}

      {/* Verification Status Alert */}
      {profile && !profile.isVerified && (
        <Alert variant="warning" title="Credentials Pending Verification" className="mb-6">
          Your medical license is currently under review by the VeloCura Admin Audit team. You will receive verified status once credentials are confirmed.
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
          {/* TAB 1: TODAY'S SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Consultation Appointments</h3>
                  <p className="text-xs text-slate-400">Manage patient appointments, launch video calls, and record clinical prescriptions.</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="teal">{appointments.length} Total Visits</Badge>
                </div>
              </div>

              {appointments.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No Scheduled Visits"
                  description="You have no patient appointments booked for today."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Clinical Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appt) => (
                      <TableRow key={appt.appointmentId || appt.id}>
                        <TableCell>
                          <button
                            onClick={() => handleViewPatientPassport(appt.patientId)}
                            className="font-bold text-cyan-400 hover:underline text-left cursor-pointer"
                          >
                            {appt.patientName}
                          </button>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-300">
                          {appt.appointmentTime}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400 max-w-xs truncate">
                          {appt.reason}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={appt.status} />
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {(appt.status === 'CONFIRMED' || appt.status === 'PENDING') && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                icon={Video}
                                onClick={() => handleStartVideoCall(appt)}
                              >
                                Ring Patient
                              </Button>
                              <Button
                                variant="success"
                                size="sm"
                                icon={CheckCircle2}
                                onClick={() => {
                                  setSelectedAppt(appt);
                                  setShowConsultationModal(true);
                                }}
                              >
                                Complete Visit
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
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {/* TAB 2: CONSULTATIONS WORKSTATION */}
          {activeTab === 'consultations' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-100">Active Consultations</h3>
                <p className="text-xs text-slate-400">Review patient symptom notes and launch telehealth rooms.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').map((appt) => (
                  <Card key={appt.appointmentId || appt.id} hover className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-100">{appt.patientName}</h4>
                        <p className="text-xs text-slate-400 font-mono">{appt.appointmentTime}</p>
                      </div>
                      <StatusBadge status={appt.status} />
                    </div>
                    <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                      "{appt.reason}"
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Video}
                        className="w-full"
                        onClick={() => handleStartVideoCall(appt)}
                      >
                        Launch Consultation Video Room
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={UserCheck}
                        onClick={() => handleViewPatientPassport(appt.patientId)}
                      >
                        Passport
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PATIENT PASSPORT VIEWER */}
          {activeTab === 'passport' && (
            <div className="space-y-6">
              <Card className="space-y-4">
                <CardHeader>
                  <CardTitle subtitle="Select a patient from your appointment roster to view medical history and vitals">
                    Patient Passport Lookup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {appointments.map((appt) => (
                      <div
                        key={appt.appointmentId || appt.id}
                        onClick={() => handleViewPatientPassport(appt.patientId)}
                        className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/40 cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-200">{appt.patientName}</p>
                          <p className="text-[10px] font-mono text-slate-500">Patient ID: #{appt.patientId}</p>
                        </div>
                        <Badge variant="cyan">View Passport</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 4: DOCTOR PROFILE & STATUS */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle subtitle="Update license number, medical specialty, and consultation rates">
                    Doctor Professional Credentials
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

              <Card padding="p-4" className="space-y-3">
                <h4 className="text-xs font-bold font-mono uppercase text-slate-300">Verification Guidelines</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Medical licenses are reviewed against state registers. Ensure your license number is accurate to maintain verified practitioner status.
                </p>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Complete Consultation Modal */}
      <Modal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
        title="Complete Consultation & Prescribe"
        subtitle={selectedAppt ? `Patient: ${selectedAppt.patientName}` : ''}
      >
        <form onSubmit={handleCompleteConsultation} className="space-y-4">
          <Textarea
            label="Clinical Diagnosis Notes"
            placeholder="Record medical diagnosis and observations..."
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            required
          />
          <div className="border-t border-slate-800 pt-3 space-y-3">
            <h5 className="text-xs font-bold font-mono text-cyan-400 uppercase">Issue Prescription (Optional)</h5>
            <Input
              label="Medication Name"
              placeholder="e.g. Amoxicillin"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
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
            </div>
            <Input
              label="Duration"
              placeholder="7 Days"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <Textarea
              label="Special Instructions"
              placeholder="Take after meals..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowConsultationModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading}>
              Complete Visit & Issue Prescription
            </Button>
          </div>
        </form>
      </Modal>

      {/* Patient Passport Drawer */}
      <Drawer
        isOpen={showPassportDrawer}
        onClose={() => setShowPassportDrawer(false)}
        title="Patient Medical Passport"
        subtitle={passportPatient ? `${passportPatient.firstName} ${passportPatient.lastName}` : ''}
      >
        {passportLoading ? (
          <CardSkeleton />
        ) : passportPatient ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <Card padding="p-3">
                <p className="text-[10px] font-mono uppercase text-slate-500">Gender</p>
                <p className="text-xs font-bold text-slate-200">{passportPatient.gender || 'Not recorded'}</p>
              </Card>
              <Card padding="p-3">
                <p className="text-[10px] font-mono uppercase text-slate-500">Blood Group</p>
                <p className="text-xs font-bold text-slate-200">{passportPatient.bloodGroup || 'O+'}</p>
              </Card>
            </div>
            <Card padding="p-4" className="space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-500">Allergies & Critical Warnings</p>
              <p className="text-xs text-amber-400 font-mono">{passportPatient.allergies || 'No known allergies'}</p>
            </Card>
          </div>
        ) : (
          <EmptyState title="No Passport Record" description="Select a valid patient to view their passport." />
        )}
      </Drawer>
    </AppShell>
  );
};

export default DoctorDashboard;
