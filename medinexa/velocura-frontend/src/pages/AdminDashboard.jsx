import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton, CardSkeleton } from '../components/ui/Skeleton';

import {
  Activity,
  Users,
  Stethoscope,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Send,
  UserCheck,
  UserX,
  Trash2,
  Search
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Core Data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [unverifiedDoctors, setUnverifiedDoctors] = useState([]);
  const [activeOtps, setActiveOtps] = useState([]);

  // UI & Feedback states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [otpShowActiveOnly, setOtpShowActiveOnly] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const statsRes = await api.get('/api/admin/dashboard-stats');
      setStats(statsRes.data);

      const usersRes = await api.get('/api/admin/users');
      setUsers(usersRes.data);

      const otpsRes = await api.get('/api/admin/otps');
      setActiveOtps(otpsRes.data);

      const docsRes = await api.get('/api/admin/doctors/unverified');
      setUnverifiedDoctors(docsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch admin dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  const loadUnverifiedDoctors = async () => {
    try {
      const res = await api.get('/api/admin/doctors/unverified');
      setUnverifiedDoctors(res.data);
    } catch (err) {}
  };

  const loadActiveOtps = async () => {
    try {
      const res = await api.get('/api/admin/otps');
      setActiveOtps(res.data);
    } catch (err) {}
  };

  const handleVerifyDoctor = async (doctorId) => {
    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      await api.put(`/api/admin/doctors/${doctorId}/verify`);
      setSuccess('Doctor account verified successfully.');
      const statsRes = await api.get('/api/admin/dashboard-stats');
      setStats(statsRes.data);
      const docsRes = await api.get('/api/admin/doctors/unverified');
      setUnverifiedDoctors(docsRes.data);
      const usersRes = await api.get('/api/admin/users');
      setUsers(usersRes.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to verify doctor application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      await api.put(`/api/admin/users/${userId}/toggle-active`);
      setSuccess('User active status updated.');
      const usersRes = await api.get('/api/admin/users');
      setUsers(usersRes.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update user status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Permanently delete this user account? Action cannot be undone.')) return;
    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setSuccess('User account deleted permanently.');
      const usersRes = await api.get('/api/admin/users');
      setUsers(usersRes.data);
      const statsRes = await api.get('/api/admin/dashboard-stats');
      setStats(statsRes.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete user account.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminResendOtp = async (userEmail) => {
    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      await api.post('/api/auth/otp/send', { email: userEmail });
      setSuccess(`Fresh security code generated and dispatched to ${userEmail}!`);
      await loadActiveOtps();
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      if (err.response && err.response.data && typeof err.response.data === 'string') {
        setError(err.response.data);
      } else {
        setError('Failed to resend OTP for ' + userEmail);
      }
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    let intervalId;
    if (activeTab === 'doctors') {
      loadUnverifiedDoctors();
      intervalId = setInterval(loadUnverifiedDoctors, 5000);
    } else if (activeTab === 'security') {
      loadActiveOtps();
      intervalId = setInterval(loadActiveOtps, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTab]);

  const sectionTitles = {
    dashboard: 'Admin System Control Panel',
    users: 'Platform User Management',
    doctors: 'Doctor Verifications Queue',
    security: 'Security OTP Audit Monitor'
  };

  const filteredUsers = users.filter(u =>
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.lastName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOtps = activeOtps.filter(o =>
    (o.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.userName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell
      activeSection={activeTab}
      onSelectSection={setActiveTab}
      sectionTitles={sectionTitles}
    >
      {/* System Feedback Alerts */}
      {error && <Alert variant="error" onClose={() => setError('')} className="mb-4">{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} className="mb-4">{success}</Alert>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <>
          {/* TAB 1: DASHBOARD METRICS OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card padding="p-4" className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-mono uppercase">Total Users</p>
                    <p className="text-xl font-bold text-slate-100">{stats?.totalUsers || 0}</p>
                  </div>
                </Card>
                <Card padding="p-4" className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-mono uppercase">Registered Patients</p>
                    <p className="text-xl font-bold text-slate-100">{stats?.totalPatients || 0}</p>
                  </div>
                </Card>
                <Card padding="p-4" className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-mono uppercase">Verified Doctors</p>
                    <p className="text-xl font-bold text-slate-100">{stats?.verifiedDoctors || 0}</p>
                  </div>
                </Card>
                <Card padding="p-4" className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-mono uppercase">Active OTP Sessions</p>
                    <p className="text-xl font-bold text-slate-100">{activeOtps.length}</p>
                  </div>
                </Card>
              </div>

              {/* Unverified Doctors Queue Quick Banner */}
              {unverifiedDoctors.length > 0 && (
                <Alert variant="warning" title="Doctor Verification Requests Pending">
                  There are {unverifiedDoctors.length} practitioner credentials awaiting admin review.
                  <Button variant="outline" size="sm" className="ml-3 mt-2 sm:mt-0" onClick={() => setActiveTab('doctors')}>
                    Review Queue
                  </Button>
                </Alert>
              )}

              {/* System Audit Summary */}
              <Card>
                <CardHeader>
                  <CardTitle subtitle="Platform compliance and security status">Security Compliance Overview</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">JWT Expiration Policy</p>
                    <p className="text-xs font-bold text-emerald-400">24-Hour Stateless Session Tokens</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Database Persistence</p>
                    <p className="text-xs font-bold text-cyan-400">Managed PostgreSQL Storage Active</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">OTP Rate Limiting</p>
                    <p className="text-xs font-bold text-purple-400">30s Cooldown / 5m Expiry Algorithm</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100">User Accounts Roster</h3>
                  <p className="text-xs text-slate-400">Manage patient, doctor, and admin system accounts.</p>
                </div>
                <Input
                  placeholder="Search user name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64"
                />
              </div>

              {filteredUsers.length === 0 ? (
                <EmptyState icon={Users} title="No Users Found" description="No user accounts match your search parameters." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Email Address</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>System Role</TableHead>
                      <TableHead>Account Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => {
                      const displayEmail = (u.email || '').includes('_deleted_') ? u.email.split('_deleted_')[0] : u.email;
                      return (
                        <TableRow key={u.id}>
                          <TableCell className="font-mono text-xs text-slate-500">#{u.id}</TableCell>
                          <TableCell className="font-bold text-slate-100">{displayEmail}</TableCell>
                          <TableCell>{u.firstName} {u.lastName}</TableCell>
                          <TableCell>
                            <Badge variant={u.role === 'ADMIN' ? 'purple' : u.role === 'DOCTOR' ? 'teal' : 'cyan'}>
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 text-xs font-mono font-semibold ${
                              u.active ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                              {u.active ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleUserStatus(u.id)}
                            >
                              {u.active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={Trash2}
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {/* TAB 3: DOCTOR VERIFICATIONS */}
          {activeTab === 'doctors' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Doctor Verification Queue</h3>
                  <p className="text-xs text-slate-400">Review and verify practitioner credentials.</p>
                </div>
                <Button variant="ghost" size="sm" icon={RefreshCw} onClick={loadUnverifiedDoctors}>
                  Refresh Queue
                </Button>
              </div>

              {unverifiedDoctors.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="Verification Queue Empty"
                  description="All registered medical practitioner accounts have been verified."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor Name</TableHead>
                      <TableHead>Email Address</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>License Number</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unverifiedDoctors.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-bold text-slate-100">Dr. {doc.name}</TableCell>
                        <TableCell className="font-mono text-xs">{doc.email}</TableCell>
                        <TableCell><Badge variant="teal">{doc.specialty}</Badge></TableCell>
                        <TableCell className="font-mono text-xs text-amber-400">{doc.licenseNumber || 'PENDING'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="success"
                            size="sm"
                            icon={CheckCircle2}
                            isLoading={actionLoading}
                            onClick={() => handleVerifyDoctor(doc.id)}
                          >
                            Approve & Verify
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {/* TAB 4: SECURITY OTP AUDIT */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Security OTP Monitoring Audit</h3>
                  <p className="text-xs text-slate-400">Audit active verification codes generated across registration and password reset workflows.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" icon={RefreshCw} onClick={loadActiveOtps}>Refresh</Button>
                </div>
              </div>

              {filteredOtps.length === 0 ? (
                <EmptyState
                  icon={ShieldAlert}
                  title="No Active OTP Sessions"
                  description="There are currently no active verification sessions."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email Address</TableHead>
                      <TableHead>User / Identity</TableHead>
                      <TableHead>System Role</TableHead>
                      <TableHead>Active OTP Code</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOtps.map((o, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-bold text-slate-100">{o.email}</TableCell>
                        <TableCell className="text-xs text-slate-300">{o.userName}</TableCell>
                        <TableCell><Badge variant={o.role === 'GUEST' ? 'slate' : 'cyan'}>{o.role}</Badge></TableCell>
                        <TableCell>
                          <span className="font-mono font-bold text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded">
                            {o.code}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Send}
                            onClick={() => handleAdminResendOtp(o.email)}
                          >
                            Resend OTP
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Copy}
                            onClick={() => {
                              navigator.clipboard.writeText(o.code);
                              setSuccess(`Copied OTP for ${o.email}`);
                              setTimeout(() => setSuccess(''), 3000);
                            }}
                          >
                            Copy Code
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
};

export default AdminDashboard;
