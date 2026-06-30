import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SignupForm } from './SignupForm';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, Activity } from 'lucide-react';
import { HolographicBackground } from '@/components/ui/HolographicBackground';

const playSound = (freq: number, type: OscillatorType = 'sine', duration = 0.06) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    // Ignore autoplay block errors
  }
};

interface LoginFormProps {
  onSwitchToSignup?: () => void;
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps = {}) {
  const login = useStore((state) => state.login);
  const authLoading = useStore((state) => state.authLoading);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [hudLogs, setHudLogs] = useState<string[]>(['SYS_READY: STANDBY']);

  const logConsole = (msg: string) => {
    setHudLogs(prev => [...prev.slice(-3), msg]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    playSound(600, 'sine', 0.12);
    logConsole('AUTH: INITIALIZING HANDSHAKE...');

    if (!email || !password) {
      setError('Please fill in all credentials.');
      playSound(220, 'triangle', 0.25);
      logConsole('ERROR: EMPTY_CREDENTIALS');
      return;
    }

    try {
      logConsole('SECURE: DECRYPTING CIPHER...');
      const res = await login(email, password, rememberMe);
      if (!res.success) {
        setError(res.error || 'Invalid username or password.');
        playSound(220, 'sawtooth', 0.25);
        logConsole('AUTH: VALIDATION_FAILED');
      } else {
        playSound(900, 'sine', 0.15);
        logConsole('AUTH: DECRYPT_SUCCESS. LOADING HUD...');
      }
    } catch (err: any) {
      setError(err.message || 'Network connectivity error.');
      playSound(180, 'sawtooth', 0.3);
      logConsole('CONN_ERR: TIMEOUT');
    }
  };

  if (isSigningUp) {
    return <SignupForm onBackToLogin={() => setIsSigningUp(false)} />;
  }

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

        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            onMouseEnter={() => playSound(1200, 'sine', 0.04)}
            className="flex items-center justify-center h-14 w-14 rounded-full bg-white/5 border border-blue-500/30 mb-2 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.2)] overflow-hidden p-2"
          >
            <img src="/alliance-india-logo.png" alt="Alliance India Logo" className="h-10 w-10 object-contain" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold tracking-widest text-blue-200 uppercase text-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
            CNSP // CORE
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-blue-400">
            Child Nutrition & Support Portal
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-start gap-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400 mb-6 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
          >
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-mono uppercase tracking-wide">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative">
            <Mail className="absolute left-3 top-9.5 h-4.5 w-4.5 text-blue-500/40" />
            <Input
              label="CASEWORKER IDENTIFIER"
              type="text"
              inputMode="email"
              placeholder="johnsmith@allianceindia.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 font-mono text-xs uppercase tracking-wide bg-black/40 border-blue-500/20 text-blue-100 focus:border-blue-500/80"
              disabled={authLoading}
              onMouseEnter={() => playSound(800, 'sine', 0.02)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-9.5 h-4.5 w-4.5 text-blue-500/40" />
            <Input
              label="QUANTUM ACCESS PASS"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 font-mono text-xs bg-black/40 border-blue-500/20 text-blue-100 focus:border-blue-500/80"
              disabled={authLoading}
              onMouseEnter={() => playSound(800, 'sine', 0.02)}
            />
            <button
              type="button"
              onClick={() => { setShowPassword(!showPassword); playSound(700, 'sine', 0.05); }}
              className="absolute right-3 top-9.5 text-blue-500/40 hover:text-blue-500 transition-colors duration-200"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>

          <div className="flex items-center justify-between mt-1 text-xs">
            <label 
              onMouseEnter={() => playSound(950, 'sine', 0.02)}
              className="flex items-center gap-2 font-mono text-[10px] text-blue-400 cursor-pointer select-none tracking-widest uppercase hover:text-blue-200 transition-colors duration-200"
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => { setRememberMe(e.target.checked); playSound(650, 'sine', 0.04); }}
                className="rounded border-blue-500/30 bg-black/30 text-blue-500 focus:ring-blue-500/20 focus:ring-offset-0"
                disabled={authLoading}
              />
              REMEMBER SESSION
            </label>
          </div>

          <Button
            type="submit"
            className="w-full mt-2 font-mono tracking-widest text-xs py-3 uppercase bg-blue-500 border border-blue-500/40 hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] text-white font-bold transition-all duration-300"
            disabled={authLoading}
            onMouseEnter={() => playSound(1000, 'sine', 0.04)}
          >
            {authLoading ? 'ESTABLISHING CONNECTION...' : 'SIGN IN'}
          </Button>

          <div className="mt-4 p-3 bg-black/50 border border-blue-500/10 rounded-lg font-mono text-[9px] text-blue-400 select-none">
            <div className="flex items-center gap-1.5 mb-1.5 border-b border-blue-500/10 pb-1 text-[8px] uppercase tracking-widest text-blue-500/50">
              <Activity className="h-3 w-3 animate-pulse" />
              <span>Diagnostic Console</span>
            </div>
            {hudLogs.map((log, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-blue-500/30">&gt;&gt;</span>
                <span className="truncate">{log}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-2">
            <span className="font-mono text-[10px] tracking-wider text-blue-500/45">
              NEW IDENTIFIER?{' '}
              <button
                type="button"
                onClick={() => { 
                  if (onSwitchToSignup) onSwitchToSignup();
                  else setIsSigningUp(true);
                  playSound(500, 'sine', 0.08); 
                }}
                className="font-bold text-blue-500 hover:text-blue-300 transition-colors duration-200 uppercase hover:underline"
                disabled={authLoading}
              >
                REQUEST REGISTRATION
              </button>
            </span>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
export default LoginForm;
