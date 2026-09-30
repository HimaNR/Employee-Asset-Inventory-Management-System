import { UserCog } from 'lucide-react';

export default function UsersPage() {
  return (
    <section className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-tag text-tag-ink transition-transform duration-300 hover:scale-110 hover:rotate-6">
        <UserCog className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-4 text-lg font-light">Manage who can sign in to AssetFlow.</p>
      <p className="mt-1 text-sm text-ink-muted">This screen is built in Phase 7.</p>
    </section>
  );
}
