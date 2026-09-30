import { ShieldCheck } from 'lucide-react';

export default function RolesPage() {
  return (
    <section className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-tag text-tag-ink transition-transform duration-300 hover:scale-110 hover:rotate-6">
        <ShieldCheck className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-4 text-lg font-light">Control what each role is allowed to do.</p>
      <p className="mt-1 text-sm text-ink-muted">This screen is built in Phase 7.</p>
    </section>
  );
}
