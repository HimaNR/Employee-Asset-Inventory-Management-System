import { useSyncExternalStore } from 'react';
import { getSession, subscribeSession, type Session } from '@/libs/session-storage';

const getServerSession = (): Session | null => null;

/** The signed-in session (null = signed out). Re-renders on sign-in / sign-out. */
export function useSession(): Session | null {
  return useSyncExternalStore(subscribeSession, getSession, getServerSession);
}

/** can('assets:write') -> true / false for the signed-in user */
export function useCan(): (permission: string) => boolean {
  const session = useSession();
  return (permission) => session?.user.permissions.includes(permission) ?? false;
}

/** "Nimal" for a linked employee, otherwise the email name: "admin@..." -> "Admin" */
export function greetingNameFor(user: { email: string; employee: { fullName: string } | null }): string {
  if (user.employee) return user.employee.fullName.split(' ')[0];
  const local = user.email.split('@')[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}
