import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <section className="w-full max-w-sm rounded-lg border border-line bg-white p-8 text-center">
        <h1 className="text-xl font-semibold">Sign in to AssetFlow</h1>
        <p className="mt-2 text-sm text-ink-muted">Sign-in is built in Phase 7.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block text-sm font-medium text-focus hover:underline"
        >
          Go to dashboard
        </Link>
      </section>
    </main>
  );
}
