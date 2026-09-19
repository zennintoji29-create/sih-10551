import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AegisRisk AI — Continuous Cyber Risk Quantification & ROSI Optimization",
  description:
    "AI-powered continuous cyber risk quantification and investment optimization platform. Real-time EAL, Value-at-Risk, and ROSI calculations backed by OpenFAIR and Monte Carlo simulations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#E3FDFD] text-[#0C262D] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
