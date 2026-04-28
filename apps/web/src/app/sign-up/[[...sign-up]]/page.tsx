import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="grid place-items-center py-12">
      <SignUp />
    </div>
  );
}
