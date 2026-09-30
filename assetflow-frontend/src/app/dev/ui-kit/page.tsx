import { notFound } from 'next/navigation';
import UiKitPage from '@/containers/ui-kit-page';

export default function Page() {
  // Playground only exists while developing, never in production builds
  if (process.env.NODE_ENV === 'production') notFound();
  return <UiKitPage />;
}
