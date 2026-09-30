import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>
      <section className="w-full max-w-sm rounded-3xl border border-line/70 bg-surface/85 p-8 text-center shadow-xl shadow-black/5 backdrop-blur-sm">
        <span className="mx-auto inline-flex h-10 w-14 items-center justify-end rounded-xl bg-tag pr-2.5 text-sm font-semibold text-tag-ink">
          AF
        </span>
        <h1 className="mt-5 text-2xl font-light tracking-tight">Sign in to AssetFlow</h1>
        <p className="mt-2 text-sm text-ink-muted">Sign-in is built in Phase 7.</p>
        <Link
          href="/dashboard"
          className="mt-7 inline-flex h-10 items-center rounded-full bg-contrast px-5 text-sm font-medium text-contrast-fg transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          Go to dashboard
        </Link>
      </section>
    </main>
  );
}
