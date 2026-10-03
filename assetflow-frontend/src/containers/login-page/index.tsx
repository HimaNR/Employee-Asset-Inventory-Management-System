'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { LogIn } from 'lucide-react';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import Input from '@/components/Input';
import ThemeToggle from '@/components/ThemeToggle';
import { homePathFor } from '@/config/navigation.config';
import { ApiError } from '@/libs/api/api-error';
import { friendlyMessage } from '@/libs/api/friendly-error';
import { clearSession, setSession } from '@/libs/session-storage';
import { authService } from '@/services/auth/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const tokens = await authService.login(email.trim(), password);
      const home = homePathFor(tokens.user);
      if (!home) {
        // Valid password, but this role can open no page: tell the user instead of spinning
        setSession(tokens);
        await authService.logout().catch(() => undefined);
        clearSession();
        setError(
          'Your account has no access yet. Ask an administrator to link your employee record or change your role.',
        );
        setIsSubmitting(false);
        return;
      }
      setSession(tokens);
      // Go back to the page the user wanted, or to their home page
      const next = new URLSearchParams(window.location.search).get('next');
      router.replace(next && next.startsWith('/') && next !== '/login' ? next : home);
    } catch (err) {
      const apiError = ApiError.from(err);
      // 401 = wrong email/password (the server never says which one)
      setError(apiError.status === 401 ? 'Invalid email or password.' : friendlyMessage(apiError));
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-4">
        <section className="rounded-3xl border border-line/70 bg-surface/85 p-8 shadow-xl shadow-black/5 backdrop-blur-sm">
          <span className="relative inline-flex h-10 w-14 items-center justify-end rounded-xl bg-tag pr-2.5 text-sm font-semibold text-tag-ink">
            <span className="absolute left-2.5 h-2 w-2 rounded-full bg-sidebar" />
            AF
          </span>
          <h1 className="mt-5 text-3xl font-light tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-muted">Sign in to AssetFlow</p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="username"
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error && <Banner tone="error">{error}</Banner>}
            <Button type="submit" isLoading={isSubmitting} className="w-full">
              {!isSubmitting && <LogIn className="h-4 w-4" aria-hidden="true" />}
              Sign in
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
