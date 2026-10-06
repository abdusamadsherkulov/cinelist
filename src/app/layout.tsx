import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UsernameGate from "@/components/UsernameGate";
import { getUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import WelcomeSplash from "@/components/WelcomeSplash";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "CineList — your movie diary",
  description: "Rate, save and talk about the movies you love.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  const showSplash = !!user && (await cookies()).has("cinelist-splash");
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased md:flex">
        <Navbar />
        <AppShell footer={<Footer />}>{children}</AppShell>
        <UsernameGate needs={!!user && !user.username} />
        <WelcomeSplash initialShow={showSplash} />
      </body>
    </html>
  );
}