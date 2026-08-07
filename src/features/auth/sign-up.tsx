import { AuthScreenShell } from "./components/auth-screen-shell";
import { SignUpForm } from "./components/sign-up-form";

export default function SignUp() {
  return (
    <AuthScreenShell
      title="Create"
      titleLine2="account"
      description="Get started in seconds."
      heroRatio={0.22}
    >
      <SignUpForm />
    </AuthScreenShell>
  );
}
