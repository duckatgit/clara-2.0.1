import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from './OnboardingContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { api } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Step {
  component: React.ComponentType;
  title: string;
  subtitle: string;
}

interface OnboardingStepProps {
  steps: Step[];
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({ steps }) => {
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, onboardingData } = useOnboarding();
  const { user, updateUser } = useAuth();
  const CurrentStepComponent = steps[currentStep].component;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        if (!user) {
          console.error('No user found when trying to save preferences');
          throw new Error('No active user session');
        }

        console.log('Saving preferences:', {
          role: onboardingData.role,
          tone: onboardingData.tone,
          focus_areas: onboardingData.focus,
          interaction_frequency: onboardingData.frequency,
          about_me: onboardingData.aboutMe,
          onboarded: true
        });

        // Save onboarding preferences
        await api.updateUserProfile({
          role: onboardingData.role,
          tone: onboardingData.tone,
          focus_areas: onboardingData.focus,
          interaction_frequency: onboardingData.frequency,
          about_me: onboardingData.aboutMe,
          onboarded: true
        });

        // Update user as onboarded
        await updateUser({ onboarded: true });

        toast.success('Preferences saved successfully');
        navigate('/');
      } catch (error: any) {
        console.error('Failed to save preferences:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        toast.error(error.message || 'Failed to save preferences');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20"
    >
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              className={cn(
                "h-1 flex-1 mx-1 rounded-full",
                index <= currentStep ? "bg-purple-500" : "bg-gray-600"
              )}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
          ))}
        </div>
        <div className="text-sm text-gray-400">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      {/* Step content */}
      <div className="mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white mb-2"
        >
          {steps[currentStep].title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-300"
        >
          {steps[currentStep].subtitle}
        </motion.p>
      </div>

      <CurrentStepComponent />

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBack}
          className={cn(
            "px-6 py-2 rounded-lg",
            "text-white font-medium",
            "flex items-center space-x-2",
            "transition-colors duration-200",
            currentStep === 0 ? "opacity-0 pointer-events-none" : "hover:bg-white/10"
          )}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className={cn(
            "px-6 py-2 rounded-lg",
            "bg-gradient-to-r from-purple-500 to-indigo-500",
            "text-white font-medium",
            "flex items-center space-x-2",
            "transition-all duration-200"
          )}
        >
          <span>{isLastStep ? "Get Started" : "Continue"}</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default OnboardingStep;