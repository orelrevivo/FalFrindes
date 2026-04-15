import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "bg-white shadow-lg border border-zinc-100",
            headerTitle: "text-zinc-900",
            headerSubtitle: "text-zinc-500",
            formButtonPrimary: "bg-[#7C3AED] hover:bg-[#6D28D9]",
            footerActionLink: "text-[#7C3AED] hover:text-[#6D28D9]",
          },
        }}
      />
    </div>
  );
}