// components/auth/SignupForm.tsx
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignupSchema } from '@/lib/schemas';
import { useStore } from '@/lib/store';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import {
  Mail, Lock, User as UserIcon, Send, CheckCircle2,
  AlertCircle, ChevronLeft, Shield,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';

type SignupFormValues = z.infer<typeof SignupSchema>;

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const ROLE_OPTIONS = [
  {
    value: 'Viewer',
    label: 'Viewer',
    desc: 'Read-only access to dashboard data',
  },
  {
    value: 'DataEntry',
    label: 'Data Entry',
    desc: 'Add & edit equipment mapping forms',
  },
  {
    value: 'Editor',
    label: 'Editor',
    desc: 'Full edit & delete permissions',
  },
  {
    value: 'Admin',
    label: 'Admin',
    desc: 'Reports, alerts & audit log access',
  },
] as const;

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const signup = useStore((s) => s.signup);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(SignupSchema),
    mode: 'onBlur',       // validate on blur, not on every keystroke
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      name: '',
      role: 'Viewer',
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    setSuccessMsg(null);

    try {
      const res = await signup(values.email, values.password, values.name, values.role);
      if (res.success) {
        setSuccessMsg(res.message || 'Account created! You can now sign in.');
      } else {
        setServerError(res.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setServerError(err.message || 'An error occurred during account creation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Success State ── */
  if (successMsg) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center gap-5 py-4 select-none"
      >
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="text-lg font-bold text-white">Account Created!</h3>
          <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">{successMsg}</p>
        </div>
        <div className="w-full pt-2 border-t border-zinc-800 mt-1">
          <p className="text-[10px] text-zinc-600 mb-3">
            You can now sign in with your registered credentials.
          </p>
          <Button variant="primary" className="w-full" onClick={onSwitchToLogin}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Go to Sign In
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full" noValidate>
      {/* Header */}
      <div className="flex flex-col gap-1 select-none">
        <h2 className="text-xl font-bold text-white tracking-tight">Request Account</h2>
        <p className="text-xs text-zinc-500 font-medium">
          Create your MPAC portal account to get started
        </p>
      </div>

      {/* Full Name */}
      <Input
        id="signup-name"
        label="Full Name"
        type="text"
        placeholder="e.g. Farid Sayyed"
        prefixIcon={<UserIcon className="w-4 h-4 text-zinc-500" />}
        error={errors.name?.message}
        disabled={isSubmitting}
        autoComplete="name"
        {...register('name')}
      />

      {/* Email — changed to type="text" to prevent browser's own email tooltip interfering */}
      <Input
        id="signup-email"
        label="Email Address"
        type="text"
        inputMode="email"
        placeholder="e.g. faridsayyed1010@gmail.com"
        prefixIcon={<Mail className="w-4 h-4 text-zinc-500" />}
        error={errors.email?.message}
        disabled={isSubmitting}
        autoComplete="email"
        {...register('email')}
      />

      {/* Password */}
      <Input
        id="signup-password"
        label="Password"
        type="password"
        placeholder="Minimum 4 characters"
        prefixIcon={<Lock className="w-4 h-4 text-zinc-500" />}
        error={errors.password?.message}
        disabled={isSubmitting}
        autoComplete="new-password"
        {...register('password')}
      />

      {/* Role Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-400 select-none">
          Desired Role
        </label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={isSubmitting}
            >
              <SelectTrigger id="signup-role">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex flex-col">
                      <span className="font-semibold">{opt.label}</span>
                      <span className="text-[10px] text-zinc-500">{opt.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.role && (
          <p className="text-xs font-medium text-red-400">{errors.role.message}</p>
        )}
      </div>

      {/* Role Info Banner */}
      <div className="flex items-start gap-2 p-2.5 bg-blue-950/30 border border-blue-800/30 rounded-lg select-none">
        <Shield className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-zinc-500 leading-relaxed">
          Role assignment is subject to Admin approval. Your account will be active immediately after submission.
        </p>
      </div>

      {/* Server Error */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium select-none overflow-hidden"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{serverError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <Button
        id="signup-submit"
        variant="primary"
        type="submit"
        className="w-full"
        isLoading={isSubmitting}
      >
        {!isSubmitting && <Send className="w-4 h-4 mr-2" />}
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>

      {/* Switch to login */}
      <div className="text-center text-xs select-none">
        <span className="text-zinc-500">Already have an account? </span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          disabled={isSubmitting}
          className="text-blue-400 font-semibold hover:text-blue-300 transition-colors inline-flex items-center gap-0.5 bg-transparent border-none p-0 cursor-pointer disabled:opacity-50"
        >
          <ChevronLeft className="w-3 h-3" />
          Sign in
        </button>
      </div>
    </form>
  );
};

SignupForm.displayName = 'SignupForm';
