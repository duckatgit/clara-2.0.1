import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Brain, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user, loading } = useAuth();
  console.log('user', user)
  const location = useLocation();

  // Add a timeout to prevent infinite loading
  const [showLoader, setShowLoader] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, []);

  // If still loading and within timeout, show loading state
  if (loading && showLoader) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center relative"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-xl bg-violet-500/20 blur-xl" />
            <div className={cn(
              "relative p-4 rounded-xl",
              "bg-white/5 backdrop-blur-sm",
              "border border-white/10"
            )}>
              <Brain className="w-12 h-12 text-violet-400" />
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "flex items-center space-x-3",
              "bg-white/5 backdrop-blur-sm",
              "rounded-lg px-4 py-2",
              "border border-white/10"
            )}
          >
            <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
            <p className="text-white/80 font-medium">Loading...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // If loading timed out or no user, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Special handling for onboarding route
  if (location.pathname === '/onboarding') {
    // If already onboarded, redirect to chat
    if (user.onboarded) {
      return <Navigate to="/chat" replace />;
    }
    // Otherwise, allow access to onboarding
    return <>{children}</>;
  }

  // For all other protected routes, require onboarding to be completed
  if (!user.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;