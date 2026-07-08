import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(220,38,38,0.2), transparent 70%)" }}
      />
      <div className="relative z-10">
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#dc2626",
            },
            elements: {
              rootBox: "opacity-100",
              card: "bg-[#0f0f0f] border border-white/10 shadow-2xl opacity-100",
              headerTitle: "text-white font-bold",
              headerSubtitle: "text-gray-300",
              socialButtonsBlockButton: "border border-white/10 hover:bg-white/5 text-white",
              socialButtonsBlockButtonText: "text-white font-medium",
              dividerRow: "text-gray-300",
              dividerText: "text-gray-300",
              dividerLine: "bg-white/20",
              formFieldLabel: "text-gray-200",
              formFieldInput: "bg-[#050505] border border-white/10 text-white",
              formButtonPrimary: "bg-red-600 hover:bg-red-500 text-white",
              footer: "text-gray-300",
              footerAction: "text-gray-300",
              footerActionText: "text-gray-300",
              footerActionLink: "text-red-400 hover:text-red-300 font-semibold",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-red-400",
              footerPages: "text-gray-400",
              footerPagesLink: "text-gray-400",
              badge: "bg-yellow-400 text-black",
            },
          }}
        />
      </div>
    </div>
  );
}