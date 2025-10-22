"use client";

import { AnimatePresence, motion } from "framer-motion";
import AuthForm from "../AuthForm";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../stores/authStore";
import { useEffect, useState } from "react";

// 🎨 THEME VARIABLES FOR CONSISTENCY
const MAIN_DARK_BG = "bg-gray-950"; // Deep dark background (Replaces --theme-text-muted)
const TEXT_COLOR = "text-gray-100"; // Light text on dark background (Replaces --theme-text)
const ACCENT_TEXT = "text-amber-400"; // Vibrant amber accent (Replaces text-primary)
const CARD_BG = "bg-gray-800"; // Slightly lighter dark background for the form card (Replaces bg-base-200)
const AUTH_FORM_BG = "bg-gray-900"; // Dark background for the form wrapper (Replaces bg-[var(--theme-text)])

export default function Hero() {
  const { login, register, getCurrentUser, current, loading } = useAuthStore(
    (state) => state
  );
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  // On mount, check if a user is already authenticated
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  // Redirect to the main page if the user is already logged in
  useEffect(() => {
    if (current && !loading) {
      router.push("/");
    }
  }, [current, loading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const user = await login(form.get("email"), form.get("password"));
    if (user) router.push("/"); // Direct redirect on success
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const user = await register(form.get("email"), form.get("password"));
    if (user) router.push("/"); // Direct redirect on success
  };

  // Show spinner while checking auth status
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${MAIN_DARK_BG}`}
      >
        {/* Placeholder for a stylish spinner, e.g., a Tailwind/DaisyUI spinner */}
        <span className={`${ACCENT_TEXT} text-4xl animate-spin`}>⚙️</span>
      </div>
    );
  }

  return (
    <section
      className={`min-h-screen flex flex-col md:flex-row ${MAIN_DARK_BG} ${TEXT_COLOR}`}
    >
      {/* Left Side - Illustration + Text */}
      <div className="flex flex-col justify-center items-center text-center px-6 py-10 md:flex-1 md:px-12 lg:px-16">
        <motion.img
          src="/1.svg"
          alt="Clinic Illustration"
          className="w-40 sm:w-56 md:w-72 lg:w-80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        />

        <motion.h1
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold ${ACCENT_TEXT} mt-6 leading-tight`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Manage Your{" "}
          <span className={`bg-gray-900 ${TEXT_COLOR} px-5 rounded-2xl`}>
            Clinic
          </span>{" "}
          <span className={`${ACCENT_TEXT} px-5 rounded-2xl underline`}>
            Smarter
          </span>
        </motion.h1>

        <motion.p
          className="mt-4 text-base sm:text-lg md:text-xl text-gray-400 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Simplify your clinic operations with our modern, secure, and
          user-friendly platform.
        </motion.p>
      </div>

      {/* Right Side - Auth Form */}
      <div
        className={`flex-1 flex items-center justify-center ${AUTH_FORM_BG} px-6 py-10 md:px-12`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isSignUp ? "signup" : "login"}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`w-full max-w-sm sm:max-w-md ${CARD_BG} p-8 rounded-xl shadow-2xl border border-gray-700`}
          >
            {/* NOTE: The AuthForm component itself must also be updated
              to use the same consistent theme variables (Amber/Dark) 
            */}
            <AuthForm
              handleSubmit={isSignUp ? handleRegister : handleLogin}
              submitType={isSignUp ? "Sign Up" : "Log In"}
              onToggle={() => setIsSignUp(!isSignUp)}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
