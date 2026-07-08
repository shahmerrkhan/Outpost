import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(220,38,38,0.2), transparent 70%)" }}
      />
      <div className="relative z-10">
        <SignUp
          appearance={{
            variables: {
              colorPrimary: "#dc2626",
              colorBackground: "#0f0f0f",
              colorInputBackground: "#050505",
              colorInputText: "#f5f5f5",
              borderRadius: "0.75rem",
            },
            elements: {
              card: "border border-white/10 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "border border-white/10 hover:bg-white/5",
              formButtonPrimary: "bg-red-600 hover:bg-red-500",
              footerActionLink: "text-red-400 hover:text-red-300",
            },
          }}
        />
      </div>
    </div>
  );
}