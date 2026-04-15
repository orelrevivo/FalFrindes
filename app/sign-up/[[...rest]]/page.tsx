import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
      <SignUp
        routing="hash"
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800",
            headerTitle: "text-zinc-900 dark:text-white",
            headerSubtitle: "text-zinc-600 dark:text-zinc-400",
            socialButtonsBlockButton: "border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800",
            socialButtonsBlockButtonText: "text-zinc-700 dark:text-zinc-300",
            dividerLine: "bg-zinc-200 dark:bg-zinc-700",
            dividerText: "text-zinc-500 dark:text-zinc-400",
            formFieldLabel: "text-zinc-700 dark:text-zinc-300",
            formFieldInput: "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white",
            formButtonPrimary: "bg-[#7C3AED] hover:bg-[#6D28D9] text-white",
            footerActionLink: "text-[#7C3AED] hover:text-[#6D28D9]",
          },
        }}
      />
    </div>
  );
}