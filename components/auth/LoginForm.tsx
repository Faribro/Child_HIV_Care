// components/auth/LoginForm.tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '@/lib/schemas';
import { useStore } from '@/lib/store';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';

type LoginFormValues = z.infer<typeof LoginSchema>;

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const LOG_STEPS = [
  'Resolving edge proxy at /api/proxy...',
  'Initiating HMAC gateway handshake...',
  'Querying User_Profiles database...',
  'Verifying credential signature...',
];

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const login = useStore((s) => s.login);
  const [logStep, setLogStep] = React.useState(-1);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    setLogStep(0);
    setIsSuccess(false);

    try {
      // Stagger each log step
      for (let i = 0; i < LOG_STEPS.length; i++) {
        setLogStep(i);
        await new Promise((r) => setTimeout(r, 350 + i * 120));
      }

      const res = await login(values.email, values.password, values.rememberMe);

      if (res.success) {
        setIsSuccess(true);
      } else {
        setFormError(res.error || 'Invalid credentials. Please try again.');
        setLogStep(-1);
      }
    } catch (err: any) {
      setFormError(err.message || 'Network failure — please try again.');
      setLogStep(-1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full" noValidate>
      <div className="flex flex-col gap-1 select-none">
        <h2 className="text-xl font-bold text-white tracking-tight">Welcome back</h2>
        <p className="text-xs text-zinc-500 font-medium">Sign in with your authorised credentials</p>
      </div>

      {/* Email */}
      <Input
        id="login-email"
        label="Email Address"
        type="email"
        placeholder="you@alliance.org.in"
        prefixIcon={<Mail className="w-4 h-4 text-zinc-500" />}
        error={errors.email?.message}
        disabled={isSubmitting}
        autoComplete="email"
        {...register('email')}
      />

      {/* Password */}
      <div className="flex flex-col gap-1">
        <Input
          id="login-password"
          label="Password"
          type="password"
          placeholder="••••••••"
          prefixIcon={<Lock className="w-4 h-4 text-zinc-500" />}
          error={errors.password?.message}
          disabled={isSubmitting}
          autoComplete="current-password"
          {...register('password')}
        />
        <AnimatePresence>
          {formError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-400 mt-0.5 select-none overflow-hidden"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{formError}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Remember me */}
      <div className="flex items-center justify-between select-none">
        <label htmlFor="rememberMe" className="flex items-center gap-2 text-xs text-zinc-400 font-medium cursor-pointer group">
          <input
            id="rememberMe"
            type="checkbox"
            disabled={isSubmitting}
            className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-900 cursor-pointer"
            {...register('rememberMe')}
          />
          <span className="group-hover:text-zinc-300 transition-colors">Remember me for 30 days</span>
        </label>
      </div>

      {/* Auth Console Log */}
      <AnimatePresence>
        {logStep >= 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-[10px] flex flex-col gap-1.5 overflow-hidden"
          >
            {LOG_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={i <= logStep ? { opacity: 1, x: 0 } : {}}
                className={`flex items-center gap-2 ${
                  isSuccess && i === LOG_STEPS.length - 1
                    ? 'text-emerald-400'
                    : i < logStep
                    ? 'text-zinc-500'
                    : i === logStep
                    ? 'text-zinc-200'
                    : 'text-zinc-700'
                }`}
              >
                {isSuccess && i === LOG_STEPS.length - 1 ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                ) : i < logStep ? (
                  <span className="w-3 flex-shrink-0 text-zinc-600">✓</span>
                ) : i === logStep ? (
                  <span className="w-3 flex-shrink-0 animate-pulse text-blue-400">›</span>
                ) : (
                  <span className="w-3 flex-shrink-0 text-zinc-700">·</span>
                )}
                <span>{step}</span>
              </motion.div>
            ))}
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-emerald-400 mt-0.5"
              >
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                <span>Authentication successful — loading workspace...</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <Button
        id="login-submit"
        variant="primary"
        type="submit"
        className="w-full"
        isLoading={isSubmitting}
      >
        {!isSubmitting && <LogIn className="w-4 h-4 mr-2" />}
        {isSubmitting ? 'Authenticating...' : 'Sign In'}
      </Button>

      {/* Switch to signup */}
      <div className="text-center text-xs select-none">
        <span className="text-zinc-500">Don&apos;t have access? </span>
        <button
          type="button"
          onClick={onSwitchToSignup}
          disabled={isSubmitting}
          className="text-blue-400 font-semibold hover:text-blue-300 inline-flex items-center gap-0.5 transition-colors disabled:opacity-50 bg-transparent border-none p-0 cursor-pointer"
        >
          Request an account
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </form>
  );
};

LoginForm.displayName = 'LoginForm';
