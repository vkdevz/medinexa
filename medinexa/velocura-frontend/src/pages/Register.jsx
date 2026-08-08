import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Alert } from '../components/ui/Alert';
import { Modal } from '../components/ui/Modal';
import { Activity, Mail, Lock, User, Phone, ShieldCheck, Stethoscope } from 'lucide-react';

const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form Registration states
  const [role, setRole] = useState('PATIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');

  // Doctor Specific fields
  const [specialty, setSpecialty] = useState('General Medicine');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [bio, setBio] = useState('');

  // OTP Modal & State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [cachedRegisterData, setCachedRegisterData] = useState(null);

  // 30s Cooldown Timer
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const payload = {
      email: email.toLowerCase().trim(),
      password,
      role,
      firstName,
      lastName,
      phone,
      dob,
      gender,
      bloodGroup,
      specialty: role === 'DOCTOR' ? specialty : undefined,
      licenseNumber: role === 'DOCTOR' ? licenseNumber : undefined,
      bio: role === 'DOCTOR' ? bio : undefined
    };

    setCachedRegisterData(payload);
    setLoading(true);

    try {
      await api.post('/api/auth/otp/send', { email: payload.email });
      setOtpSuccess(`6-digit Security OTP sent to ${payload.email}`);
      setShowOtpModal(true);
      setResendCooldown(30);
    } catch (err) {
      if (err.response && err.response.data && typeof err.response.data === 'string') {
        setError(err.response.data);
      } else {
        setError('Failed to dispatch registration OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !cachedRegisterData) return;
    setOtpError('');
    setOtpSuccess('');
    setLoading(true);

    try {
      await api.post('/api/auth/otp/send', { email: cachedRegisterData.email });
      setOtpSuccess('Fresh security OTP generated and sent.');
      setResendCooldown(30);
    } catch (err) {
      if (err.response && err.response.data && typeof err.response.data === 'string') {
        setOtpError(err.response.data);
      } else {
        setOtpError('Failed to resend code.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Enter a valid 6-digit OTP code.');
      return;
    }

    setOtpError('');
    setLoading(true);

    try {
      await api.post('/api/auth/otp/verify', { email: cachedRegisterData.email, code: otpCode });
      const regRes = await api.post('/api/auth/register', cachedRegisterData);
      const { token, email: userEmail, role: userRole, firstName: fName, lastName: lName } = regRes.data;

      login(token, userEmail, userRole, fName, lName);
      setShowOtpModal(false);

      if (userRole === 'PATIENT') navigate('/patient/dashboard');
      else if (userRole === 'DOCTOR') navigate('/doctor/dashboard');
      else navigate('/');
    } catch (err) {
      if (err.response && err.response.data && typeof err.response.data === 'string') {
        setOtpError(err.response.data);
      } else {
        setOtpError('Verification failed. Invalid OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500 text-slate-950 font-bold shadow-sm">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Create VeloCura Account</h2>
          <p className="text-xs text-slate-400 font-mono">Join the enterprise digital health network</p>
        </div>

        {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

        <div className="surface-card p-6 space-y-6">
          {/* Account Role Selector */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setRole('PATIENT')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md font-mono transition-colors cursor-pointer ${
                role === 'PATIENT' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" /> Patient Account
            </button>
            <button
              type="button"
              onClick={() => setRole('DOCTOR')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md font-mono transition-colors cursor-pointer ${
                role === 'DOCTOR' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Stethoscope className="w-4 h-4" /> Doctor Account
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Phone Number"
                placeholder="+1 555-0199"
                icon={Phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Input
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
              <Select
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                options={['Male', 'Female', 'Other']}
              />
            </div>

            {/* Doctor Specific Registration Fields */}
            {role === 'DOCTOR' && (
              <div className="pt-3 border-t border-slate-800 space-y-4">
                <h4 className="text-xs font-bold font-mono text-teal-400 uppercase">Medical Credentials</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    options={['General Medicine', 'Cardiology', 'Neurology', 'Pediatrics', 'Dermatology']}
                    required
                  />
                  <Input
                    label="License Number"
                    placeholder="MD-884920"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                  />
                </div>
                <Textarea
                  label="Professional Bio"
                  placeholder="Summary of medical practice..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <Button type="submit" variant="primary" size="md" isLoading={loading} className="w-full">
              Proceed to Security Verification
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* 6-Digit Security OTP Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Verify Email Ownership"
        subtitle={`Enter 6-digit code sent to ${cachedRegisterData?.email || ''}`}
      >
        {otpError && <Alert variant="error" className="mb-4">{otpError}</Alert>}
        {otpSuccess && <Alert variant="success" className="mb-4">{otpSuccess}</Alert>}

        <form onSubmit={handleVerifyAndRegister} className="space-y-4">
          <Input
            label="6-Digit Verification Code"
            placeholder="123456"
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            required
          />
          <div className="flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || loading}
              className="font-mono text-cyan-400 hover:underline disabled:opacity-50 cursor-pointer"
            >
              {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend OTP'}
            </button>
          </div>
          <Button type="submit" variant="primary" size="sm" isLoading={loading} className="w-full">
            Complete Account Registration
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Register;
