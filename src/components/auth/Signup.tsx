import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Loader2 } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../utils/cn";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  // Google sign-up handler
  const handleGoogleSignUp = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !email || !password || !confirmPassword) return;

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Create Account</h2>
        <p className="text-gray-400">Start your journey with Clara AI</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className={cn(
              "w-full px-4 py-2 rounded-lg",
              "bg-white/5 border border-white/10",
              "text-white placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-violet-500/50",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className={cn(
              "w-full px-4 py-2 rounded-lg",
              "bg-white/5 border border-white/10",
              "text-white placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-violet-500/50",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            placeholder="Create a password (min. 6 characters)"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-300"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            className={cn(
              "w-full px-4 py-2 rounded-lg",
              "bg-white/5 border border-white/10",
              "text-white placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-violet-500/50",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            placeholder="Confirm your password"
          />
        </div>

        <motion.button
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          type="submit"
          disabled={loading || !email || !password || !confirmPassword}
          className={cn(
            "w-full px-4 py-2 rounded-lg",
            "bg-gradient-to-r from-violet-500 to-purple-500",
            "text-white font-medium",
            "flex items-center justify-center space-x-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              <span>Create Account</span>
            </>
          )}
        </motion.button>
      </form>

      <div className="text-center text-sm space-y-2">
        <button
          onClick={handleGoogleSignUp}
          className={cn(
            "w-full px-4 py-2 rounded-lg",
            "bg-white/10 border border-white/10",
            "text-white font-medium",
            "flex items-center justify-center space-x-2",
            "transition-all duration-200 hover:bg-white/20"
          )}
          disabled={loading}
        >
          <FaGoogle className="w-5 h-5" />
          <span>Sign up with Google</span>
        </button>

        <span className="text-gray-400">Already have an account? </span>
        <Link
          to="/login"
          className="text-violet-400 hover:text-violet-300 font-medium"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default Signup;
