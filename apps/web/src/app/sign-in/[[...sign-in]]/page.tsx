import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="grid place-items-center py-12">
      <SignIn />
    </div>
  );
}
