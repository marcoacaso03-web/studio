
import { redirect } from 'next/navigation';

/**
 * The root page now redirects to the dashboard (route /calendario), which is the main screen of the application.
 */
export default function Home() {
  redirect('/calendario');
}
