import { getCurrentUser } from "@/lib/session";
import { LoginScreen } from "@/components/login-screen";
import { Dashboard } from "@/components/dashboard";

// Uses cookies(), so this route is always rendered dynamically.
export default async function Home() {
  const user = await getCurrentUser();
  if (!user) return <LoginScreen />;
  return <Dashboard user={user} />;
}
