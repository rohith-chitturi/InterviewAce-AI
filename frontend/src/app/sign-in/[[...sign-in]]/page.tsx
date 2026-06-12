import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
      <SignIn appearance={{ elements: { formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-sm normal-case" } }} />
    </div>
  );
}
