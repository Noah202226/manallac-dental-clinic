"use client";

import "./globals.css";
import { useInitTheme } from "./components/layout/ThemeProvider";
import Footer from "./components/layout/Footer";
import { Toaster } from "react-hot-toast";

// Theme Variables
const MAIN_DARK_BG = "bg-gray-950"; // Deep dark background (Consistent with SalesDashboard)
const TEXT_COLOR = "text-gray-100"; // Light text color

export default function RootLayout({ children }) {
  // Assuming useInitTheme() might be handling a theme toggle,
  // but we set a default dark background here for the dashboard look.
  useInitTheme();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${MAIN_DARK_BG} ${TEXT_COLOR} transition-colors duration-300`}
      >
        {/* <Header /> */}

        <main className="min-h-screen">{children}</main>
        {/* <Footer /> */}
        {/* Background Logo - Style preserved as requested */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none"
          style={{
            backgroundImage: "url('/manallac-logo.png')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "400px",
          }}
        ></div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "8px",
              padding: "12px 16px",
              // Applying a dark toast style for consistency
              background: "#374151", // gray-700
              color: "#F9FAFB", // gray-50
            },
          }}
        />
      </body>
    </html>
  );
}
