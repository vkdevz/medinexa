import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import api from './api';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Badge } from './components/ui/Badge';
import { StatusBadge } from './components/ui/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';
import { Alert } from './components/ui/Alert';
import { Activity, Sparkles, Calendar, Stethoscope, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

function LandingPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Public Chatbot States
  const [symptomsInput, setSymptomsInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'ai',
      text: "Welcome to VeloCura Clinical Advisor. Enter symptoms below to analyze clinical urgency, precautions, and home remedies.",
      triageResult: null
    }
  ]);
  const [anonymousChatCount, setAnonymousChatCount] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const count = parseInt(localStorage.getItem('anonymousChatCount') || '0');
    setAnonymousChatCount(count);
  }, []);

  const handleTriageSubmit = async (e) => {
    e.preventDefault();
    if (!symptomsInput.trim()) return;

    setChatLoading(true);
    const userQuery = symptomsInput;
    setSymptomsInput('');

    setChatHistory(prev => [...prev, { sender: 'user', text: userQuery, triageResult: null }]);

    try {
      const res = await api.post('/api/auth/triage', { symptoms: userQuery });
      const triage = res.data;

      const nextCount = anonymousChatCount + 1;
      localStorage.setItem('anonymousChatCount', nextCount.toString());
      setAnonymousChatCount(nextCount);

      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Triage Assessment:\nRisk Category: ${triage.triageLevel.toUpperCase()}\n\nSummary:\n${triage.clinicalSummary}`,
          triageResult: triage
        }
      ]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "Unable to process triage check. Please seek emergency clinical services if symptoms are critical.",
          triageResult: null
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const redirectDashboard = () => {
    if (user.role === 'PATIENT') navigate('/patient/dashboard');
    else if (user.role === 'DOCTOR') navigate('/doctor/dashboard');
    else if (user.role === 'ADMIN') navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Enterprise Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white block">VeloCura</span>
              <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block -mt-1">
                Enterprise Health System
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            <a href="#triage" className="hover:text-white transition-colors">AI Triage Check</a>
            <a href="#features" className="hover:text-white transition-colors">Clinical Platform</a>
            <a href="#plans" className="hover:text-white transition-colors">Enterprise Plans</a>
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <Button variant="primary" size="sm" onClick={redirectDashboard} icon={ArrowRight} iconPosition="right">
                My Workstation
              </Button>
            ) : (
              <>
                <Link to="/login" className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5">
                  Sign In
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3.5 py-1 mb-6">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs text-slate-300 font-mono font-medium">Enterprise Telehealth & AI Triage Workstation</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight max-w-4xl leading-tight text-white">
          Clinical Healthcare Systems & <br />
          <span className="text-cyan-400">Automated Patient Triage</span>
        </h1>

        <p className="mt-4 text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed font-sans">
          VeloCura combines AI symptom assessment, telehealth video consultations, medical passport tracking, and enterprise security workflows for modern clinical teams.
        </p>
      </section>

      {/* PUBLIC INTERACTIVE CHATBOT SECTION */}
      <section id="triage" className="max-w-4xl mx-auto px-6 pb-16 w-full">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <CardTitle subtitle="Anonymous Free Symptom Checkup">AI Clinical Advisor</CardTitle>
            </div>
            <Badge variant="cyan">AI-Assisted Assessment</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[360px] overflow-y-auto space-y-4 pr-2 custom-scrollbar border border-slate-800 rounded-lg p-4 bg-slate-950/60">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xl p-3.5 rounded-lg text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-500 text-slate-950 font-medium'
                      : 'bg-slate-900 border border-slate-800 text-slate-200'
                  }`}>
                    <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
                    {msg.triageResult && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                        <StatusBadge status={msg.triageResult.triageLevel} />
                        {msg.triageResult.clinicalSummary && (
                          <p className="text-slate-300 text-[11px] bg-slate-950 p-2.5 rounded border border-slate-850">
                            {msg.triageResult.clinicalSummary}
                          </p>
                        )}
                        {msg.triageResult.homeRemedies && msg.triageResult.homeRemedies.length > 0 && (
                          <div className="space-y-1">
                            <p className="font-mono text-[10px] uppercase text-slate-400 font-bold">Suggested Care:</p>
                            <ul className="list-disc list-inside text-slate-300 text-[11px]">
                              {msg.triageResult.homeRemedies.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                          </div>
                        )}
                        <div className="pt-2 flex gap-2">
                          <Button variant="primary" size="sm" onClick={() => navigate('/register')} className="w-full">
                            Book Doctor Consultation
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleTriageSubmit} className="flex gap-3">
              <Input
                placeholder="Describe symptoms e.g., 'severe headache, high fever, fatigue'..."
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                disabled={chatLoading}
                required
                className="flex-1"
              />
              <Button type="submit" variant="primary" size="md" isLoading={chatLoading} icon={Sparkles}>
                Check Symptoms
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Enterprise Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>© {new Date().getFullYear()} VeloCura Enterprise Health Technologies Inc. All rights reserved.</span>
          </div>
          <p className="font-mono text-[10px]">WCAG 2.2 AA Compliant Clinical Software Platform</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* SECURED PATIENT ROUTE GROUP */}
      <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
      </Route>

      {/* DOCTOR PORTAL DASHBOARD */}
      <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      </Route>

      {/* ADMIN CONSOLE DASHBOARD */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>
      
      {/* 404 Route */}
      <Route path="*" element={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 p-4 text-center">
          <h2 className="text-2xl font-bold text-white font-mono">404 - Page Not Found</h2>
          <p className="text-xs text-slate-400">The requested clinical workstation route does not exist.</p>
          <Link to="/" className="text-cyan-400 hover:underline text-xs font-mono">Return to Safe Workspace</Link>
        </div>
      } />
    </Routes>
  );
}

export default App;
