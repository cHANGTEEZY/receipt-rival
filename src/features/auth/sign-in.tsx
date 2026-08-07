import { AuthScreenShell } from "./components/auth-screen-shell";
import { SignInForm } from "./components/sign-in-form";

export default function SignIn() {
  return (
    <AuthScreenShell
      title="Welcome"
      titleLine2="back"
      description="Sign in to continue."
      heroRatio={0.22}
    >
      <SignInForm />
    </AuthScreenShell>
  );
}
