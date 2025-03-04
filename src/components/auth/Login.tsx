import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LogIn, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../utils/cn";
import { FaGoogle } from "react-icons/fa";
import { supabase } from "@/lib/supabase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const handleGoogleSignUp = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !email || !password) return;

    try {
      setLoading(true);
      await signIn(email, password);
    } catch (error) {
      // Error is handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
        <p className="text-gray-400">Sign in to continue your journey</p>
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
            placeholder="Enter your password"
          />
        </div>

        <motion.button
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          type="submit"
          disabled={loading || !email || !password}
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
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>Sign In</span>
            </>
          )}
        </motion.button>
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
      </form>

      <div className="text-center text-sm">
        <span className="text-gray-400">Don't have an account? </span>
        <Link
          to="/signup"
          className="text-violet-400 hover:text-violet-300 font-medium"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default Login;
