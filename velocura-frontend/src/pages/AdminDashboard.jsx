import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  // Core Data states
  const [stats, setStats] = useState(null);
  const [unverifiedDoctors, setUnverifiedDoctors] = useState([]);
  const [users, setUsers] = useState([]);

  // Loading & notification states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Load system analytics counts
      const statsRes = await api.get('/api/admin/dashboard-stats');
      setStats(statsRes.data);

      // 2. Load all users for directory auditing
      const usersRes = await api.get('/api/admin/users');
      setUsers(usersRes.data);

      // Filter unverified doctors from users or retrieve from backend?
      // Since our GET /api/admin/users returns user details, let's extract doctors who are unverified.
      // Wait, we need to load unverified doctors.
      // In the backend, AdminService has getDashboardStats which queries pending counts.
      // But we can get unverified doctors list. Wait! Did we expose an endpoint to list unverified doctors?
      // No, we didn't write an endpoint specifically for listing unverified doctors!
      // But wait! We have `GET /api/admin/users` which returns user list. We can filter unverified doctors from there?
      // No, `users` returns role and user names, but doctor profiles (containing `isVerified`) are separate entities.
      // Wait! In `DoctorRepository` we have `findByIsVerified(false)`.
      // Let's check if we can list unverified doctors?
      // Oh! In `AdminServiceImpl.java` or `AdminController.java`, we did NOT expose `GET /api/admin/unverified-doctors`!
      // Wait, let's check: does `AdminService` have a method to list unverified doctors?
      // No, it has `getAllUsers`, `verifyDoctor`, and `getDashboardStats`.
      // Let's add a method to get unverified doctors, or can we return them?
      // Wait! We can easily get unverified doctors from the `users` list if we modify the `UserResponse` DTO to return verification status? No, `UserResponse` has role.
      // What if we expose a `GET /api/admin/unverified-doctors`? Yes, that is incredibly clean!
      // Let's look at `AdminService.java`. It can define:
      // `List<DoctorProfileResponse> getUnverifiedDoctors();`
      // And `AdminController.java` can map it as `GET /api/admin/doctors/unverified`.
      // Let's add this backend API first, so that the admin can view and verify doctors from the list!
      // Wait! Let's check: is this method needed?
      // Yes! To display unverified doctors in the UI panel, the admin needs an endpoint to fetch them.
      // Let's add `getUnverifiedDoctors` to `AdminService` and implement it!
    } catch (err) {
      console.error(err);
      setError('Failed to fetch admin dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  // I will write the complete AdminDashboard.jsx file assuming the backend endpoint exists, and then modify the backend files.
  // The endpoint will be: `GET /api/admin/doctors/unverified` -> returns `List<DoctorProfileResponse>`

  const handleVerifyDoctor = async (doctorId) => {
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      await api.put(`/api/admin/doctors/${doctorId}/verify`);
      setSuccess('Doctor credential verified and account activated successfully!');
      
      // Refresh dashboard data
      const statsRes = await api.get('/api/admin/dashboard-stats');
      setStats(statsRes.data);
      
      const docsRes = await api.get('/api/admin/doctors/unverified');
      setUnverifiedDoctors(docsRes.data);

      const usersRes = await api.get('/api/admin/users');
      setUsers(usersRes.data);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to verify doctor account.');
    } finally {
      setActionLoading(false);
    }
  };

  const loadUnverifiedDoctors = async () => {
    try {
      const res = await api.get('/api/admin/doctors/unverified');
      setUnverifiedDoctors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'verifications') {
      loadUnverifiedDoctors();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500/25 border-t-cyan-500 animate-spin" />
        <p className="text-sm font-medium text-slate-400 font-mono">Loading administrative console...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative">
      {/* Background decoration elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] animate-pulse-glow" />

      {/* Main dashboard grid layout */}
      <div className="flex-1 flex flex-col md:flex-row z-10">
        
        {/* SIDEBAR NAVIGATION PANEL */}
        <aside className="w-full md:w-64 bg-slate-900/40 border-r border-slate-900 px-6 py-8 flex flex-col shrink-0">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-500/20">
              <svg className="w-5 h-5 text-slate-950 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white font-sans">VeloCura</span>
              <span className="block text-[9px] text-purple-400 font-bold uppercase tracking-widest mt-[-2px]">Admin Console</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 flex flex-col space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('verifications')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'verifications'
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Doctor Verification</span>
              {stats?.pendingVerificationsCount > 0 && (
                <span className="bg-purple-500 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px] ml-auto">
                  {stats.pendingVerificationsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>User Directory</span>
            </button>
          </nav>

          {/* User profile brief & logout */}
          <div className="border-t border-slate-900 pt-6 mt-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-purple-400">
                A
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">Administrator</p>
                <p className="text-xs text-slate-500 truncate font-mono">admin@velocura.com</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full bg-slate-950 border border-slate-900 hover:border-red-500/20 hover:text-red-400 text-slate-400 text-xs font-semibold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT SPACE */}
        <main className="flex-1 px-8 py-10 overflow-y-auto max-w-5xl">
          
          {/* Action alerts */}
          {success && (
            <div className="mb-8 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm flex items-center gap-3 animate-float">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* TAB CONTENT CONDITIONAL SWITCH */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Welcome card banner */}
              <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px]" />
                <h2 className="text-3xl font-extrabold text-white">Hello, Admin!</h2>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-xl">
                  Welcome to the VeloCura System Administration Workspace. You can monitor platform performance, verify medical credentials, and audit active users.
                </p>
              </div>

              {/* Stats aggregates */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card rounded-2xl p-6 flex items-center space-x-4">
                  <div className="p-4 bg-purple-500/10 rounded-xl text-purple-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Total Patients</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats?.patientCount}</p>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 flex items-center space-x-4">
                  <div className="p-4 bg-teal-500/10 rounded-xl text-teal-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Total Doctors</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats?.doctorCount}</p>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 flex items-center space-x-4">
                  <div className="p-4 bg-cyan-500/10 rounded-xl text-cyan-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Appointments</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats?.appointmentCount}</p>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 flex items-center space-x-4">
                  <div className="p-4 bg-amber-500/10 rounded-xl text-amber-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Pending Verif.</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats?.pendingVerificationsCount}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verifications' && (
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Doctor Credentials Verification Queue</h3>
              {unverifiedDoctors.length === 0 ? (
                <p className="text-sm text-slate-500 font-mono py-8 text-center">No doctor credentials awaiting verification.</p>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-sm text-slate-400">
                    <thead className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-900">
                      <tr>
                        <th className="pb-3">Doctor Name</th>
                        <th className="pb-3">License Number</th>
                        <th className="pb-3">Specialization</th>
                        <th className="pb-3">Experience</th>
                        <th className="pb-3">Fee</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {unverifiedDoctors.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-900/10">
                          <td className="py-4 font-bold text-white">Dr. {d.firstName} {d.lastName}</td>
                          <td className="py-4 font-mono text-xs text-cyan-400">{d.licenseNumber}</td>
                          <td className="py-4">{d.specialization}</td>
                          <td className="py-4">{d.experienceYears} yrs</td>
                          <td className="py-4 font-mono">${d.consultationFee}</td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => handleVerifyDoctor(d.id)}
                              disabled={actionLoading}
                              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 cursor-pointer"
                            >
                              Approve Credentials
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">User Auditing Directory</h3>
              {users.length === 0 ? (
                <p className="text-sm text-slate-500 font-mono py-8 text-center">No registered users found.</p>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-sm text-slate-400">
                    <thead className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-900">
                      <tr>
                        <th className="pb-3">ID</th>
                        <th className="pb-3">Email Address</th>
                        <th className="pb-3">First Name</th>
                        <th className="pb-3">Last Name</th>
                        <th className="pb-3">System Role</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900/10">
                          <td className="py-4 font-mono text-xs text-slate-500">#{u.id}</td>
                          <td className="py-4 font-bold text-white">{u.email}</td>
                          <td className="py-4">{u.firstName}</td>
                          <td className="py-4">{u.lastName}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono tracking-wide ${
                              u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                              u.role === 'DOCTOR' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
                              'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono tracking-wide ${
                              u.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {u.active ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
