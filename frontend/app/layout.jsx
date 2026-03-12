import { Playfair_Display, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/authContext";
import { ToastProvider } from "@/lib/toastContext";
import ToastContainer from "@/components/ToastContainer";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Smart AI Outfits",
  description: "AI-powered fashion recommendations for your perfect look",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} font-sans antialiased overflow-x-hidden`}>
        <AuthProvider>
          <ToastProvider>
            <main className="animate-in fade-in duration-1000">
              {children}
            </main>
            <ToastContainer />
          </ToastProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
