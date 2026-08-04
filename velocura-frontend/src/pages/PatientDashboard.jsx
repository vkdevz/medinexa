import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import TelehealthRoom from '../components/TelehealthRoom';

const PatientDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  // Core Data states
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Loading & notification states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Profile Edit fields
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');

  // Booking fields
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingReason, setBookingReason] = useState('');

  // Reschedule fields
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleTime, setRescheduleTime] = useState('');

  // ==========================================
  // STARTUP FEATURE STATES: AI CHAT & VITALS
  // ==========================================
  const [vitalsList, setVitalsList] = useState([
    { id: 1, timestamp: new Date(Date.now() - 86400000 * 2).toLocaleString(), systolic: 120, diastolic: 80, heartRate: 72, bloodSugar: 95 },
    { id: 2, timestamp: new Date(Date.now() - 86400000).toLocaleString(), systolic: 135, diastolic: 85, heartRate: 80, bloodSugar: 110 }
  ]);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your VeloCura AI Symptom Advisor. Describe your symptoms (e.g. 'I have chest pressure and palpitations' or 'I have a sore throat and mild fever'), and I will analyze triage risk and suggest booking matching specialists."
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeVideoSession, setActiveVideoSession] = useState(null);

  // Health Passport States
  const [allergies, setAllergies] = useState('');
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineDate, setTimelineDate] = useState('');
  const [timelineEvent, setTimelineEvent] = useState('');
  const [timelineDesc, setTimelineDesc] = useState('');
  const [passportLoading, setPassportLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setSuccess('Payment processed successfully! Your consultation has been booked and confirmed.');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('payment') === 'cancelled') {
      setError('Payment checkout cancelled. Please complete payment to confirm your booking.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    fetchDashboardData();
  }, []);

  const handleUpdatePassport = async (newAllergies, newTimeline) => {
    try {
      setPassportLoading(true);
      const res = await api.put('/api/patient/passport/update', {
        allergies: newAllergies,
        medicalHistoryTimeline: JSON.stringify(newTimeline)
      });
      setAllergies(res.data.allergies || '');
      setTimelineEvents(JSON.parse(res.data.medicalHistoryTimeline || '[]'));
      setSuccess('Health Passport updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update Health Passport.');
    } finally {
      setPassportLoading(false);
    }
  };

  const handleAddTimelineEvent = (e) => {
    e.preventDefault();
    if (!timelineDate || !timelineEvent) return;
    const newEvent = {
      id: Date.now(),
      date: timelineDate,
      eventType: timelineEvent,
      description: timelineDesc
    };
    const updatedTimeline = [...timelineEvents, newEvent];
    handleUpdatePassport(allergies, updatedTimeline);
    setTimelineDate('');
    setTimelineEvent('');
    setTimelineDesc('');
  };

  const handleDeleteTimelineEvent = (eventId) => {
    if (!window.confirm('Delete this event from your clinical timeline?')) return;
    const updatedTimeline = timelineEvents.filter(ev => ev.id !== eventId);
    handleUpdatePassport(allergies, updatedTimeline);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const profRes = await api.get('/api/patient/profile');
      setProfile(profRes.data);
      
      setDob(profRes.data.dateOfBirth || '');
      setGender(profRes.data.gender || 'Male');
      setPhone(profRes.data.phoneNumber || '');
      setBloodGroup(profRes.data.bloodGroup || 'O+');
      setAddress(profRes.data.address || '');

      const apptRes = await api.get('/api/patient/appointments');
      setAppointments(apptRes.data);

      const histRes = await api.get('/api/patient/medical-history');
      setHistory(histRes.data);

      const presRes = await api.get('/api/patient/prescriptions');
      setPrescriptions(presRes.data);

      const docsRes = await api.get('/api/patient/doctors');
      setDoctors(docsRes.data);
      if (docsRes.data.length > 0) {
        setSelectedDoctorId(docsRes.data[0].id || '');
      }

      // Load Health Passport details
      const passportRes = await api.get('/api/patient/passport');
      setAllergies(passportRes.data.allergies || '');
      setTimelineEvents(JSON.parse(passportRes.data.medicalHistoryTimeline || '[]'));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
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
      const res = await api.put('/api/patient/profile/update', {
        dateOfBirth: dob,
        gender,
        phoneNumber: phone,
        bloodGroup,
        address
      });
      setProfile(res.data);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update profile details.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      await api.put(`/api/patient/appointments/cancel/${apptId}`);
      const apptRes = await api.get('/api/patient/appointments');
      setAppointments(apptRes.data);
      setSuccess('Appointment cancelled successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to cancel appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRescheduleAppointment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!rescheduleTime) {
      setError('Please select a new time slot.');
      return;
    }
    setActionLoading(true);
    try {
      await api.put('/api/patient/appointments/reschedule', {
        appointmentId: rescheduleId,
        newAppointmentTime: rescheduleTime
      });
      const apptRes = await api.get('/api/patient/appointments');
      setAppointments(apptRes.data);
      setRescheduleId(null);
      setRescheduleTime('');
      setSuccess('Appointment rescheduled successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to reschedule appointment slot.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const executeBooking = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedDoctorId || !bookingTime || !bookingReason) {
      setError('Please fill in all booking fields.');
      return;
    }
    setActionLoading(true);
    try {
      // 1. Create the booking entry first in the backend database
      await api.post('/api/patient/appointments/book', {
        doctorId: Number(selectedDoctorId),
        appointmentTime: bookingTime,
        reason: bookingReason
      });

      // 2. Fetch target doctor consultation fee details
      const targetDoc = doctors.find(d => Number(d.id) === Number(selectedDoctorId));
      const fee = targetDoc ? targetDoc.consultationFee : 150.00;

      // 3. Request a Stripe Checkout Session
      const payRes = await api.post('/api/payments/checkout', {
        amount: fee,
        description: `Consultation Booking Fee for Dr. ${targetDoc?.firstName || 'Smith'} (${targetDoc?.specialization || 'General'})`,
        successUrl: window.location.origin + '/patient/dashboard?payment=success',
        cancelUrl: window.location.origin + '/patient/dashboard?payment=cancelled'
      });

      // Redirect user to Stripe Checkout (or fallback success URL)
      window.location.href = payRes.data.sessionUrl;
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Booking failed or slot conflict encountered. Choose another time slot.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // STARTUP FEATURE LOGIC: AI CHAT TRIAGE
  // ==========================================
  const handleSendSymptomQuery = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput.trim().toLowerCase();
    const newUserMessage = { sender: 'user', text: chatInput };
    
    setChatHistory(prev => [...prev, newUserMessage]);
    setChatInput('');
    setChatLoading(true);

    // Simulate AI clinical analysis wait time
    setTimeout(() => {
      let responseText = "";
      let triageLevel = "Mild";
      let recommendedSpecialty = "General Medicine";
      let precautions = [];

      // Core Keyword-based Triage Rules
      if (query.includes('chest') || query.includes('heart') || query.includes('palpitation') || query.includes('breathless') || query.includes('cardiac')) {
        triageLevel = "Critical";
        recommendedSpecialty = "Cardiology";
        responseText = "Warning: Chest symptoms and breathing difficulties can indicate cardiovascular issues. We highly recommend consulting a cardiologist immediately. If you experience severe chest crushing pressure, radiating left arm pain, or sweating, call emergency services (911) immediately.";
        precautions = ["Avoid strenuous physical exertion.", "Sit upright in a well-ventilated area.", "Have someone accompany you."];
      } else if (query.includes('headache') || query.includes('migraine') || query.includes('dizzy') || query.includes('neck pain') || query.includes('seizure')) {
        triageLevel = "Moderate";
        recommendedSpecialty = "Neurology";
        responseText = "Your described symptoms (headache, dizziness, or neck pain) suggest neurological involvement or tension. Rest in a quiet, dark room, hydrate, and consider booking a neurological consultation.";
        precautions = ["Rest in a darkened, noise-free room.", "Avoid screen time.", "Track the headache duration and triggers."];
      } else if (query.includes('skin') || query.includes('rash') || query.includes('itch') || query.includes('spots') || query.includes('acne')) {
        triageLevel = "Mild";
        recommendedSpecialty = "Dermatology";
        responseText = "Your symptoms suggest a dermatological reaction or condition. Avoid scratching the affected area, wash with mild soap, and book a consultation with a dermatologist.";
        precautions = ["Keep the affected area clean and dry.", "Avoid using perfumed lotions.", "Do not scratch."];
      } else if (query.includes('fever') || query.includes('cold') || query.includes('cough') || query.includes('throat') || query.includes('flu') || query.includes('body ache')) {
        triageLevel = "Mild";
        recommendedSpecialty = "General Medicine";
        responseText = "Your symptoms correspond to viral upper respiratory tract symptoms or mild influenza. Rest, keep hydrated, and monitor temperature. Consider consulting a general physician if symptoms persist.";
        precautions = ["Maintain proper hydration (water, warm soups).", "Take steam inhalations.", "Monitor body temperature twice daily."];
      } else {
        triageLevel = "Moderate";
        recommendedSpecialty = "General Medicine";
        responseText = "Based on your input, we recommend an initial triage consultation with a General Medicine practitioner. They will diagnose symptoms and coordinate specialist referrals.";
        precautions = ["Monitor vital statistics.", "Keep records of symptom occurrences."];
      }

      const botMessage = {
        sender: 'bot',
        text: responseText,
        data: {
          triageLevel,
          recommendedSpecialty,
          precautions
        }
      };

      setChatHistory(prev => [...prev, botMessage]);
      setChatLoading(false);
    }, 1200);
  };

  // ==========================================
  // STARTUP FEATURE LOGIC: VITALS TRACKER
  // ==========================================
  const handleAddVitals = (e) => {
    e.preventDefault();
    if (!systolic || !diastolic || !heartRate || !bloodSugar) {
      setError('Please fill out all vital fields.');
      return;
    }

    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      heartRate: parseInt(heartRate),
      bloodSugar: parseInt(bloodSugar)
    };

    setVitalsList(prev => [newEntry, ...prev]);
    setSystolic('');
    setDiastolic('');
    setHeartRate('');
    setBloodSugar('');
    setSuccess('Vitals logged successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const getBPStatus = (sys, dia) => {
    if (sys >= 140 || dia >= 90) return { label: 'Hypertension', color: 'text-red-400 border-red-500/20 bg-red-500/10' };
    if (sys >= 120 || dia >= 80) return { label: 'Elevated', color: 'text-amber-400 border-amber-500/20 bg-amber-500/10' };
    return { label: 'Normal', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' };
  };

  // Aggregates for widgets
  const avgSystolic = vitalsList.length > 0 ? Math.round(vitalsList.reduce((acc, v) => acc + v.systolic, 0) / vitalsList.length) : 120;
  const avgDiastolic = vitalsList.length > 0 ? Math.round(vitalsList.reduce((acc, v) => acc + v.diastolic, 0) / vitalsList.length) : 80;
  const avgHeartRate = vitalsList.length > 0 ? Math.round(vitalsList.reduce((acc, v) => acc + v.heartRate, 0) / vitalsList.length) : 72;
  const avgBloodSugar = vitalsList.length > 0 ? Math.round(vitalsList.reduce((acc, v) => acc + v.bloodSugar, 0) / vitalsList.length) : 90;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500/25 border-t-cyan-500 animate-spin" />
        <p className="text-sm font-medium text-slate-400 font-mono">Loading patient workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[150px] animate-pulse-glow" />

      <div className="flex-1 flex flex-col md:flex-row z-10">
        
        {/* SIDEBAR NAVIGATION PANEL */}
        <aside className="w-full md:w-64 bg-slate-900/40 border-r border-slate-900 px-6 py-8 flex flex-col shrink-0">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-500 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <svg className="w-5 h-5 text-slate-950 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">VeloCura</span>
              <span className="block text-[9px] text-teal-400 font-bold uppercase tracking-widest mt-[-2px]">Patient Portal</span>
            </div>
          </div>

          <nav className="flex-1 flex flex-col space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'overview' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Overview</span>
            </button>

            {/* HEALTH PASSPORT TAB BUTTON */}
            <button
              onClick={() => setActiveTab('passport')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'passport' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-semibold text-cyan-400">Health Passport</span>
            </button>

            {/* AI ASSISTANT STARTUP TAB BUTTON */}
            <button
              onClick={() => setActiveTab('ai-assistant')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'ai-assistant' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <svg className="w-5 h-5 text-teal-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="font-semibold text-teal-400">AI Triage Advisor</span>
            </button>

            {/* VITALS TRACKER STARTUP TAB BUTTON */}
            <button
              onClick={() => setActiveTab('vitals')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'vitals' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Vitals Logger</span>
            </button>

            <button
              onClick={() => setActiveTab('book')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'book' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Book Appointment</span>
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'appointments' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>My Appointments</span>
            </button>

            <button
              onClick={() => setActiveTab('records')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'records' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Medical History</span>
            </button>

            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'prescriptions' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span>Prescriptions</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'profile' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Edit Profile</span>
            </button>
          </nav>

          <div className="border-t border-slate-900 pt-6 mt-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-cyan-400">
                {profile?.firstName ? profile.firstName.charAt(0) : 'P'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{profile?.firstName} {profile?.lastName}</p>
                <p className="text-xs text-slate-500 truncate font-mono">{user?.email}</p>
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
          
          {success && (
            <div className="mb-8 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm flex items-center gap-3 animate-float">
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

          {activeTab === 'passport' && (
            <div className="space-y-8">
              
              {/* Header Info Banner */}
              <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px]" />
                <h2 className="text-3xl font-extrabold text-white">Unified Health Passport</h2>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-xl">
                  This passport consolidates your historical surgeries, fractures, allergies, and clinical diagnosis logs. Present this screen to any doctor for an instant, comprehensive view of your medical history.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Column: Allergies & Salt sensitivities */}
                <div className="md:col-span-1 space-y-6">
                  <div className="glass-card rounded-2xl p-6 border border-slate-900">
                    <h3 className="text-base font-bold text-white mb-4">Allergies & Salt Sensitivities</h3>
                    
                    {/* Render active allergy tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {allergies.trim() ? (
                        allergies.split(',').map((tag, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 font-mono">
                            ⚠️ {tag.trim()}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic">No allergies or drug sensitivities logged.</p>
                      )}
                    </div>

                    <div className="space-y-4 border-t border-slate-900/60 pt-4">
                      <div>
                        <label htmlFor="allg-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">Edit Allergies (Comma-separated)</label>
                        <input
                          id="allg-input"
                          type="text"
                          className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                          placeholder="e.g. Penicillin, Aspirin, Peanuts"
                          value={allergies}
                          onChange={(e) => setAllergies(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => handleUpdatePassport(allergies, timelineEvents)}
                        disabled={passportLoading}
                        className="w-full bg-cyan-500 text-slate-950 font-bold py-2 rounded-xl text-xs hover:bg-cyan-400 cursor-pointer disabled:opacity-50"
                      >
                        {passportLoading ? 'Saving...' : 'Save Allergies'}
                      </button>
                    </div>
                  </div>

                  {/* Add Medical Event Form */}
                  <div className="glass-card rounded-2xl p-6 border border-slate-900">
                    <h3 className="text-base font-bold text-white mb-4">Log Medical Event</h3>
                    
                    <form onSubmit={handleAddTimelineEvent} className="space-y-4">
                      <div>
                        <label htmlFor="evt-date" className="block text-xs text-slate-400 font-semibold mb-2">Event Date *</label>
                        <input
                          id="evt-date"
                          type="date"
                          required
                          className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                          value={timelineDate}
                          onChange={(e) => setTimelineDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="evt-title" className="block text-xs text-slate-400 font-semibold mb-2">Event Name / Surgery *</label>
                        <input
                          id="evt-title"
                          type="text"
                          required
                          className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                          placeholder="e.g. Wrist Fracture, Appendectomy"
                          value={timelineEvent}
                          onChange={(e) => setTimelineEvent(e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="evt-desc" className="block text-xs text-slate-400 font-semibold mb-2">Details / Notes</label>
                        <textarea
                          id="evt-desc"
                          rows="3"
                          className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
                          placeholder="e.g. Left wrist cast applied for 6 weeks at Boston General Hospital."
                          value={timelineDesc}
                          onChange={(e) => setTimelineDesc(e.target.value)}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={passportLoading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold py-2 rounded-xl text-xs hover:scale-[1.01] transition-all cursor-pointer"
                      >
                        Append to Timeline
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right Column: Interactive Medical Timeline */}
                <div className="md:col-span-2">
                  <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-900 min-h-[450px]">
                    <h3 className="text-xl font-bold text-white mb-6">Patient Clinical Timeline</h3>
                    
                    {timelineEvents.length === 0 && history.length === 0 ? (
                      <p className="text-sm text-slate-500 font-mono py-12 text-center">No timeline records logged.</p>
                    ) : (
                      <div className="relative border-l border-slate-900 ml-4 pl-6 space-y-8">
                        
                        {/* 1. Render User-Logged Events */}
                        {timelineEvents.map((ev) => (
                          <div key={ev.id} className="relative">
                            
                            {/* Dot indicator */}
                            <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 border-2 border-cyan-500">
                              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                            </span>

                            <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl flex justify-between items-start hover:border-slate-800 transition-colors duration-200">
                              <div>
                                <span className="text-[10px] text-cyan-400 font-mono font-bold tracking-wider uppercase bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 rounded">
                                  {ev.date}
                                </span>
                                <h4 className="text-base font-bold text-white mt-2.5">{ev.eventType}</h4>
                                {ev.description && (
                                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{ev.description}</p>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeleteTimelineEvent(ev.id)}
                                className="text-slate-600 hover:text-red-400 p-1 cursor-pointer transition-colors duration-200"
                                title="Remove Event"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* 2. Render Completed Doctor Consultations */}
                        {history.map((hist) => (
                          <div key={hist.id} className="relative">
                            
                            {/* Dot indicator */}
                            <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 border-2 border-teal-500">
                              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                            </span>

                            <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl hover:border-slate-800 transition-colors duration-200">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-teal-400 font-mono font-bold tracking-wider uppercase bg-teal-500/10 border border-teal-500/25 px-2 py-0.5 rounded">
                                  {new Date(hist.recordedAt).toLocaleDateString()}
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono font-bold tracking-wider uppercase border border-slate-900 px-2 py-0.5 rounded">
                                  Clinical Record
                                </span>
                              </div>
                              
                              <h4 className="text-base font-bold text-white mt-2.5">Diagnosed: {hist.diagnosis}</h4>
                              {hist.symptoms && (
                                <p className="text-xs text-slate-400 mt-2">
                                  <strong className="text-slate-300">Symptoms:</strong> {hist.symptoms}
                                </p>
                              )}
                              {hist.treatment && (
                                <p className="text-xs text-slate-400 mt-1">
                                  <strong className="text-slate-300">Treatment Plan:</strong> {hist.treatment}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}

                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px]" />
                <h2 className="text-3xl font-extrabold text-white">Hello, {profile?.firstName}!</h2>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-xl">
                  Welcome to your VeloCura Healthcare Workspace. Chat with our AI Triage Advisor for immediate symptoms triage, track your vitals over time, or check active e-prescriptions.
                </p>
                <div className="mt-6 flex gap-4">
                  <button 
                    onClick={() => setActiveTab('ai-assistant')}
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all duration-200 text-sm cursor-pointer"
                  >
                    AI Symptom check
                  </button>
                  <button 
                    onClick={() => setActiveTab('vitals')}
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors duration-200 cursor-pointer"
                  >
                    Log Vital Statistics
                  </button>
                </div>
              </div>

              {/* Stats aggregates showing dynamic vitals log averages */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-2xl p-6 flex items-center space-x-4">
                  <div className="p-4 bg-cyan-500/10 rounded-xl text-cyan-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Average BP</p>
                    <p className="text-2xl font-bold text-white mt-1">{avgSystolic}/{avgDiastolic} <span className="text-xs text-slate-400 font-normal">mmHg</span></p>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 flex items-center space-x-4">
                  <div className="p-4 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Heart Rate (Avg)</p>
                    <p className="text-2xl font-bold text-white mt-1">{avgHeartRate} <span className="text-xs text-slate-400 font-normal">BPM</span></p>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 flex items-center space-x-4">
                  <div className="p-4 bg-amber-500/10 rounded-xl text-amber-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Avg Blood Glucose</p>
                    <p className="text-2xl font-bold text-white mt-1">{avgBloodSugar} <span className="text-xs text-slate-400 font-normal">mg/dL</span></p>
                  </div>
                </div>
              </div>

              {/* Recent prescriptions table list summary */}
              <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Recent E-Prescriptions</h3>
                {prescriptions.length === 0 ? (
                  <p className="text-sm text-slate-500 font-mono py-4 text-center">No active prescriptions available.</p>
                ) : (
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-slate-400">
                      <thead className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-900">
                        <tr>
                          <th className="pb-3">Doctor</th>
                          <th className="pb-3">Medication</th>
                          <th className="pb-3">Dosage</th>
                          <th className="pb-3">Issued</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {prescriptions.slice(0, 3).map((p) => (
                          <tr key={p.id} className="hover:bg-slate-900/10">
                            <td className="py-3.5 font-bold text-white">{p.doctorName}</td>
                            <td className="py-3.5 font-mono text-cyan-400">{p.medication}</td>
                            <td className="py-3.5">{p.dosage}</td>
                            <td className="py-3.5 font-mono text-xs">{new Date(p.issuedAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              STARTUP FEATURE TAB: AI TRIAGE CHAT
             ========================================== */}
          {activeTab === 'ai-assistant' && (
            <div className="glass-card rounded-3xl p-6 flex flex-col h-[650px] relative overflow-hidden">
              <div className="border-b border-slate-900 pb-4 mb-4 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AI Symptom Advisor & Triage Chat</h3>
                  <p className="text-[10px] text-slate-500 font-mono">AUTOMATED CLINICAL INTERACTION PROTOCOL</p>
                </div>
              </div>

              {/* Chat bubbles list */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 rounded-2xl max-w-xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-tr-none'
                        : 'bg-slate-900/60 text-slate-300 border border-slate-900 rounded-tl-none'
                    }`}>
                      <p>{msg.text}</p>

                      {/* Render structured triage advice */}
                      {msg.data && (
                        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono text-slate-400">TRIAGE RISK LEVEL:</span>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                              msg.data.triageLevel === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              msg.data.triageLevel === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {msg.data.triageLevel}
                            </span>
                          </div>

                          <div>
                            <span className="text-xs font-bold font-mono text-slate-400 block mb-1">IMMEDIATE PRECAUTIONS:</span>
                            <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                              {msg.data.precautions.map((prec, i) => (
                                <li key={i}>{prec}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs font-bold font-mono text-teal-400">
                              RECOMENDED SPECIALIST: {msg.data.recommendedSpecialty}
                            </span>
                            <button
                              onClick={() => {
                                // Jump directly to booking
                                setActiveTab('book');
                                // Select doctor matching this specialty if possible
                                const matchingDoc = doctors.find(d => d.specialization.toLowerCase() === msg.data.recommendedSpecialty.toLowerCase());
                                if (matchingDoc) {
                                  setSelectedDoctorId(matchingDoc.id);
                                }
                              }}
                              className="bg-teal-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-[10px] hover:bg-teal-400 transition-colors duration-200 cursor-pointer"
                            >
                              Book with Specialist
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-center space-x-2 text-slate-500 font-mono text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                    <span>Analyzing clinical profiles...</span>
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendSymptomQuery} className="flex gap-3 border-t border-slate-900 pt-4">
                <input
                  type="text"
                  required
                  placeholder="Describe your current symptoms details..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all duration-200"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold px-6 rounded-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all duration-200 text-sm cursor-pointer"
                >
                  Analyze
                </button>
              </form>
            </div>
          )}

          {/* ==========================================
              STARTUP FEATURE TAB: VITALS LOGGER
             ========================================== */}
          {activeTab === 'vitals' && (
            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Logger form column */}
              <div className="glass-card rounded-3xl p-6 md:col-span-1 h-fit">
                <h3 className="text-base font-bold text-white mb-4">Log Vital Statistics</h3>
                <form onSubmit={handleAddVitals} className="space-y-4">
                  <div>
                    <label htmlFor="sys" className="block text-xs text-slate-400 font-semibold mb-1">Blood Pressure Systolic (mmHg)</label>
                    <input
                      id="sys"
                      type="number"
                      required
                      min="50"
                      max="250"
                      placeholder="e.g. 120"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="dia" className="block text-xs text-slate-400 font-semibold mb-1">Blood Pressure Diastolic (mmHg)</label>
                    <input
                      id="dia"
                      type="number"
                      required
                      min="30"
                      max="150"
                      placeholder="e.g. 80"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="hr" className="block text-xs text-slate-400 font-semibold mb-1">Heart Rate (BPM)</label>
                    <input
                      id="hr"
                      type="number"
                      required
                      min="30"
                      max="200"
                      placeholder="e.g. 72"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="bs" className="block text-xs text-slate-400 font-semibold mb-1">Blood Glucose (mg/dL)</label>
                    <input
                      id="bs"
                      type="number"
                      required
                      min="40"
                      max="400"
                      placeholder="e.g. 95"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                      value={bloodSugar}
                      onChange={(e) => setBloodSugar(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs hover:scale-[1.01] transition-transform duration-200 cursor-pointer"
                  >
                    Save Vital Log
                  </button>
                </form>
              </div>

              {/* History list column */}
              <div className="glass-card rounded-3xl p-6 md:col-span-2">
                <h3 className="text-base font-bold text-white mb-4">Historical Health Metrics Log</h3>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-sm text-slate-400">
                    <thead className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-900">
                      <tr>
                        <th className="pb-3">Timestamp</th>
                        <th className="pb-3">Blood Pressure</th>
                        <th className="pb-3">Heart Rate</th>
                        <th className="pb-3">Glucose</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {vitalsList.map((v) => {
                        const status = getBPStatus(v.systolic, v.diastolic);
                        return (
                          <tr key={v.id} className="hover:bg-slate-900/10">
                            <td className="py-3 font-mono text-xs text-slate-500">{v.timestamp}</td>
                            <td className="py-3 font-mono font-bold text-white">{v.systolic}/{v.diastolic} <span className="text-[10px] text-slate-500">mmHg</span></td>
                            <td className="py-3 font-mono">{v.heartRate} <span className="text-[10px] text-slate-500">BPM</span></td>
                            <td className="py-3 font-mono text-cyan-400">{v.bloodSugar} <span className="text-[10px] text-slate-500">mg/dL</span></td>
                            <td className="py-3 text-right">
                              <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono tracking-wide ${status.color}`}>
                                {status.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'profile' && (
            <div className="glass-card rounded-3xl p-8 max-w-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Patient Demographics Form</h3>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">First Name</label>
                    <input
                      type="text"
                      disabled
                      className="w-full bg-slate-950/50 border border-slate-900 text-slate-500 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                      value={profile?.firstName || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">Last Name</label>
                    <input
                      type="text"
                      disabled
                      className="w-full bg-slate-950/50 border border-slate-900 text-slate-500 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                      value={profile?.lastName || ''}
                    />
                  </div>
                  <div>
                    <label htmlFor="dob" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">Date of Birth</label>
                    <input
                      id="dob"
                      type="date"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all duration-200"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">Gender</label>
                    <select
                      id="gender"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all duration-200"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all duration-200"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="bloodGroup" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">Blood Group</label>
                    <select
                      id="bloodGroup"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all duration-200"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                    >
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">Residential Address</label>
                  <textarea
                    id="address"
                    rows="3"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all duration-200 resize-none"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all duration-200 text-sm cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'book' && (
            <div className="glass-card rounded-3xl p-8 max-w-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Schedule Consultation Slot</h3>
              
              <form onSubmit={executeBooking} className="space-y-6">
                <div>
                  <label htmlFor="doctor" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">Select Practitioner</label>
                  {doctors.length === 0 ? (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono">
                      No active verified doctors are currently listed.
                    </div>
                  ) : (
                    <select
                      id="doctor"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all duration-200"
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                    >
                      {doctors.map((d, index) => (
                        <option key={index} value={d.id}>
                          Dr. {d.firstName} {d.lastName} ({d.specialization}) - ${d.consultationFee}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label htmlFor="apptTime" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">Appointment Time</label>
                  <input
                    id="apptTime"
                    type="datetime-local"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all duration-200"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="reason" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">Reason for Visit</label>
                  <textarea
                    id="reason"
                    rows="3"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all duration-200 resize-none"
                    placeholder="Briefly explain your primary medical concerns or symptoms..."
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading || doctors.length === 0}
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all duration-200 text-sm cursor-pointer"
                >
                  {actionLoading ? 'Booking...' : 'Book Consultation'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-6">
              {rescheduleId && (
                <div className="glass-card rounded-2xl p-6 border border-cyan-500/20 max-w-md mb-8">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide font-mono mb-4">Reschedule Appointment Slot</h4>
                  <form onSubmit={handleRescheduleAppointment} className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 font-semibold mb-2">New Time Slot</label>
                      <input
                        type="datetime-local"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50"
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2.5">
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-cyan-400 cursor-pointer"
                      >
                        {actionLoading ? 'Rescheduling...' : 'Reschedule'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setRescheduleId(null); setRescheduleTime(''); }}
                        className="bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 px-4 py-2 rounded-xl text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="glass-card rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Your Appointments Directory</h3>
                {appointments.length === 0 ? (
                  <p className="text-sm text-slate-500 font-mono py-8 text-center">You have no booked consultations.</p>
                ) : (
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-slate-400">
                      <thead className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-900">
                        <tr>
                          <th className="pb-3">Doctor</th>
                          <th className="pb-3">Schedule Date & Time</th>
                          <th className="pb-3">Reason</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {appointments.map((a) => (
                          <tr key={a.id} className="hover:bg-slate-900/10">
                            <td className="py-4 font-bold text-white">{a.doctorName}</td>
                            <td className="py-4 font-mono text-xs text-cyan-400">
                              {new Date(a.appointmentTime).toLocaleString()}
                            </td>
                            <td className="py-4 truncate max-w-xs">{a.reason}</td>
                            <td className="py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono tracking-wide ${
                                a.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                a.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                a.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}>
                                {a.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                                <div className="inline-flex gap-2">
                                  {a.status === 'CONFIRMED' && (
                                    <button
                                      onClick={() => setActiveVideoSession({
                                        roomName: `velocura-room-${a.id}`,
                                        userName: `${profile?.firstName} ${profile?.lastName}`
                                      })}
                                      className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer"
                                    >
                                      Join Video Call
                                    </button>
                                  )}
                                  <button
                                    onClick={() => { setRescheduleId(a.id); setRescheduleTime(''); }}
                                    className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs px-3 py-1.5 rounded-xl border border-cyan-500/20 transition-all duration-200 cursor-pointer"
                                  >
                                    Reschedule
                                  </button>
                                  <button
                                    onClick={() => handleCancelAppointment(a.id)}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-xl border border-red-500/20 transition-all duration-200 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Diagnostic Medical Records</h3>
              {history.length === 0 ? (
                <p className="text-sm text-slate-500 font-mono py-8 text-center">No medical record sheets logged.</p>
              ) : (
                <div className="space-y-6">
                  {history.map((h) => (
                    <div key={h.id} className="p-6 bg-slate-950/40 border border-slate-900 rounded-2xl relative">
                      <div className="absolute top-4 right-6 text-xs text-slate-500 font-mono">
                        Recorded: {new Date(h.recordedAt).toLocaleDateString()}
                      </div>
                      <h4 className="text-base font-bold text-cyan-400">Diagnosis: {h.diagnosis}</h4>
                      {h.symptoms && (
                        <p className="text-sm text-slate-400 mt-2">
                          <strong className="text-slate-300">Symptoms:</strong> {h.symptoms}
                        </p>
                      )}
                      {h.treatment && (
                        <p className="text-sm text-slate-400 mt-1">
                          <strong className="text-slate-300">Treatment Plan:</strong> {h.treatment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Digital Prescriptions Directory</h3>
              {prescriptions.length === 0 ? (
                <p className="text-sm text-slate-500 font-mono py-8 text-center">No digital prescriptions issued.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {prescriptions.map((p) => (
                    <div key={p.id} className="p-6 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-base font-bold text-white">{p.doctorName}</h4>
                            <p className="text-xs text-slate-500 font-mono">{p.doctorSpecialization}</p>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(p.issuedAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="space-y-3 border-t border-slate-900 pt-4">
                          <p className="text-sm text-slate-400">
                            <strong className="text-slate-300 font-mono">Medication:</strong>{' '}
                            <span className="text-cyan-400 font-bold">{p.medication}</span>
                          </p>
                          <p className="text-sm text-slate-400">
                            <strong className="text-slate-300 font-mono">Dosage Guide:</strong> {p.dosage}
                          </p>
                          {p.instructions && (
                            <p className="text-sm text-slate-400">
                              <strong className="text-slate-300 font-mono">Instructions:</strong> {p.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {activeVideoSession && (
        <TelehealthRoom
          roomName={activeVideoSession.roomName}
          userName={activeVideoSession.userName}
          onClose={() => setActiveVideoSession(null)}
        />
      )}
    </div>
  );
};

export default PatientDashboard;
