
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/login');
  // The return value is not used because redirect() will interrupt rendering.
  // However, to satisfy TypeScript and ESLint, a return statement is needed.
  return null;
}
