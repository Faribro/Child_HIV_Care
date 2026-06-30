import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ChevronLeft, ShieldAlert, CheckCircle } from 'lucide-react';
import { HolographicBackground } from '@/components/ui/HolographicBackground';

interface SignupFormProps {
  onBackToLogin?: () => void;
  onSwitchToLogin?: () => void;
}

export function SignupForm({ onBackToLogin, onSwitchToLogin }: SignupFormProps) {
  const signup = useStore((state) => state.signup);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name || !email || !password || !role) {
      setError('Please fill in all requested profile details.');
      return;
    }

    setLoading(true);
    try {
      const res = await signup(email, password, name, role);
      if (res.success) {
        setSuccessMsg(res.message || 'Account registered successfully! Contact admin to activate.');
        setName('');
        setEmail('');
        setPassword('');
        setRole('Viewer');
      } else {
        setError(res.error || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Network connectivity error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center bg-[#071310] px-4 overflow-hidden select-none">
      <HolographicBackground theme="dark" intensity={1.3} />

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06)_0%,transparent_70%)] z-0" />
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
          backgroundSize: '100% 4px'
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 70 }}
        style={{ perspective: 1000 }}
        className="relative w-full max-w-md border border-blue-500/30 bg-[#0A1A15]/85 backdrop-blur-[24px] shadow-[0_0_50px_rgba(59,130,246,0.15)] rounded-2xl p-8 z-10 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500/60" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500/60" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500/60" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500/60" />

        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="flex items-center justify-center h-14 w-14 rounded-full bg-white/5 border border-blue-500/30 mb-2 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.2)] overflow-hidden p-2"
          >
            <img src="/alliance-india-logo.png" alt="Alliance India Logo" className="h-10 w-10 object-contain" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-blue-200">
            Register Account
          </h1>
          <p className="font-sans text-xs text-blue-400">
            Request portal access matching your organizational role
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 mb-5"
          >
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-sans font-medium">{error}</p>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 mb-5"
          >
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-sans font-medium">{successMsg}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            placeholder="Dr. Farid Sayyed"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="font-mono text-xs bg-black/40 border-blue-500/20 text-blue-100 focus:border-blue-500/80"
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="worker@allianceindia.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="font-mono text-xs bg-black/40 border-blue-500/20 text-blue-100 focus:border-blue-500/80"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="font-mono text-xs bg-black/40 border-blue-500/20 text-blue-100 focus:border-blue-500/80"
          />

          <Select
            label="Access Role Request"
            value={role}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
            disabled={loading}
            className="font-mono text-xs bg-black/40 border-blue-500/20 text-blue-100 focus:border-blue-500/80"
            options={[
              { value: 'Viewer', label: 'Viewer (Read Only access)' },
              { value: 'Editor', label: 'Editor (Add and update child data)' },
              { value: 'Admin', label: 'Administrator (Full database controls)' }
            ]}
          />

          <Button
            type="submit"
            className="w-full mt-3 font-display text-sm py-2.5 bg-blue-500 border border-blue-500/40 hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] text-white font-bold transition-all duration-300"
            disabled={loading}
          >
            {loading ? 'Submitting registration request...' : 'Register Workspace User'}
          </Button>

          <button
            type="button"
            onClick={onBackToLogin || onSwitchToLogin}
            className="inline-flex items-center justify-center gap-2 mt-2 font-display text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200"
            disabled={loading}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to login portal
          </button>
        </form>
      </motion.div>
    </div>
  );
}
export default SignupForm;
