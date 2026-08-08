import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
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
  Search,
  Plus,
  Clock,
  Key,
  XCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const sub = segments[1];
    if (sub && sub !== 'dashboard' && ['dashboard', 'users', 'doctors', 'security'].includes(sub)) {
      setActiveTab(sub);
    }
  }, [location.pathname]);

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

  // Admin OTP Modal & Expiry timer states
  const [showIssueOtpModal, setShowIssueOtpModal] = useState(false);
  const [issueOtpEmail, setIssueOtpEmail] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  const handleAdminResendOtp = async (userEmail) => {
    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      const res = await api.post('/api/admin/otps/resend', { email: userEmail });
      const newCode = res.data?.code ? ` (${res.data.code})` : '';
      setSuccess(`Fresh security code${newCode} generated and dispatched to ${userEmail}!`);
      await loadActiveOtps();
      setTimeout(() => setSuccess(''), 4000);
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

  const handleAdminIssueOtp = async (e) => {
    e.preventDefault();
    if (!issueOtpEmail) return;
    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      const res = await api.post('/api/admin/otps/issue', { email: issueOtpEmail });
      setSuccess(`Generated 6-digit OTP code (${res.data.code}) for ${issueOtpEmail}`);
      setShowIssueOtpModal(false);
      setIssueOtpEmail('');
      await loadActiveOtps();
      setTimeout(() => setSuccess(''), 4500);
    } catch (err) {
      setError('Failed to issue security OTP code.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeOtp = async (userEmail) => {
    if (!window.confirm(`Revoke active verification code for ${userEmail}?`)) return;
    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      await api.delete(`/api/admin/otps/${encodeURIComponent(userEmail)}`);
      setSuccess(`Revoked OTP session for ${userEmail}`);
      await loadActiveOtps();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to revoke OTP session.');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    let intervalId;
    let clockId;
    if (activeTab === 'doctors') {
      loadUnverifiedDoctors();
      intervalId = setInterval(loadUnverifiedDoctors, 5000);
    } else if (activeTab === 'security') {
      loadActiveOtps();
      intervalId = setInterval(loadActiveOtps, 5000);
      clockId = setInterval(() => setCurrentTime(Date.now()), 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (clockId) clearInterval(clockId);
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

              {/* Active Security OTP Codes Quick Access Panel */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle subtitle="Live verification codes for registration and password resets">
                      <span className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-amber-400" />
                        Active Security OTP Codes ({activeOtps.length})
                      </span>
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" icon={Plus} onClick={() => setShowIssueOtpModal(true)}>
                        Issue OTP
                      </Button>
                      <Button variant="ghost" size="sm" icon={RefreshCw} onClick={loadActiveOtps}>
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {activeOtps.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">No active verification OTP sessions currently running.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {activeOtps.map((o, idx) => {
                        const remainingMs = o.expiryTime ? (o.expiryTime - currentTime) : 0;
                        const isExpired = remainingMs <= 0;
                        const mins = Math.floor(Math.max(0, remainingMs) / 60000);
                        const secs = Math.floor((Math.max(0, remainingMs) % 60000) / 1000);

                        return (
                          <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2.5">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs font-bold text-slate-100 truncate max-w-[170px]" title={o.email}>
                                  {o.email}
                                </p>
                                <p className="text-[11px] text-slate-400">{o.userName} ({o.role})</p>
                              </div>
                              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                                isExpired ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                              }`}>
                                {isExpired ? 'Expired' : `${mins}m ${secs}s`}
                              </span>
                            </div>

                            <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                              <span className="text-xs text-slate-400 font-mono">OTP CODE:</span>
                              <span className="font-mono font-bold text-sm text-amber-300 tracking-wider">
                                {o.code}
                              </span>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                icon={Copy}
                                className="w-full text-xs py-1"
                                onClick={() => {
                                  navigator.clipboard.writeText(o.code);
                                  setSuccess(`Copied OTP (${o.code}) for ${o.email}`);
                                  setTimeout(() => setSuccess(''), 3000);
                                }}
                              >
                                Copy Code
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={Send}
                                className="w-full text-xs py-1"
                                onClick={() => handleAdminResendOtp(o.email)}
                              >
                                Resend
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

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
                      <TableHead>Active OTP</TableHead>
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
                          <TableCell>
                            {u.otp ? (
                              <div className="inline-flex items-center gap-1.5">
                                <span className="font-mono font-bold text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                                  {u.otp}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(u.otp);
                                    setSuccess(`Copied OTP (${u.otp}) for ${displayEmail}`);
                                    setTimeout(() => setSuccess(''), 3000);
                                  }}
                                  className="text-[10px] font-mono text-slate-400 hover:text-amber-300 p-1 hover:bg-slate-800 rounded transition-all cursor-pointer"
                                  title="Copy OTP"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] font-mono text-slate-600">None</span>
                            )}
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
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    Security OTP Monitoring Audit & Dispatch Control
                  </h3>
                  <p className="text-xs text-slate-400">Audit active verification codes and issue or refresh security OTPs for registered users or guests.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowIssueOtpModal(true)}>
                    Issue New OTP
                  </Button>
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
                      <TableHead>Time Remaining</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOtps.map((o, idx) => {
                      const remainingMs = o.expiryTime ? (o.expiryTime - currentTime) : 0;
                      const isExpired = remainingMs <= 0;
                      const mins = Math.floor(Math.max(0, remainingMs) / 60000);
                      const secs = Math.floor((Math.max(0, remainingMs) % 60000) / 1000);

                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-bold text-slate-100">{o.email}</TableCell>
                          <TableCell className="text-xs text-slate-300">{o.userName}</TableCell>
                          <TableCell><Badge variant={o.role === 'GUEST' ? 'slate' : 'cyan'}>{o.role}</Badge></TableCell>
                          <TableCell>
                            <span className="font-mono font-bold text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-md tracking-wider">
                              {o.code}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                              isExpired
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : mins < 1
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              <Clock className="w-3 h-3" />
                              {isExpired ? 'Expired' : `${mins}m ${secs}s`}
                            </span>
                          </TableCell>
                          <TableCell className="text-right space-x-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={Send}
                              isLoading={actionLoading}
                              onClick={() => handleAdminResendOtp(o.email)}
                              title="Override rate limit and dispatch fresh code"
                            >
                              Resend
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Copy}
                              onClick={() => {
                                navigator.clipboard.writeText(o.code);
                                setSuccess(`Copied OTP (${o.code}) for ${o.email}`);
                                setTimeout(() => setSuccess(''), 3000);
                              }}
                            >
                              Copy
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={XCircle}
                              isLoading={actionLoading}
                              onClick={() => handleRevokeOtp(o.email)}
                              title="Revoke active OTP session"
                            >
                              Revoke
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {/* ISSUE NEW OTP MODAL */}
              <Modal
                isOpen={showIssueOtpModal}
                onClose={() => setShowIssueOtpModal(false)}
                title="Issue Security OTP Code"
                subtitle="Generate and dispatch a 6-digit verification code on demand"
              >
                <form onSubmit={handleAdminIssueOtp} className="space-y-4">
                  <Input
                    label="Target Email Address *"
                    type="email"
                    placeholder="user@example.com"
                    value={issueOtpEmail}
                    onChange={(e) => setIssueOtpEmail(e.target.value)}
                    required
                  />
                  <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-start gap-2">
                    <Key className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      Issuing an OTP will generate a fresh 6-digit security code valid for 5 minutes, replacing any existing active OTP for this email.
                    </span>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" type="button" onClick={() => setShowIssueOtpModal(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit" isLoading={actionLoading} icon={Key}>
                      Generate & Dispatch OTP
                    </Button>
                  </div>
                </form>
              </Modal>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
};

export default AdminDashboard;
