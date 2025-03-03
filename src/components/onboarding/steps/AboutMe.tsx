import React from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '../OnboardingContext';
import { cn } from '../../../utils/cn';

export const AboutMe = () => {
  const { onboardingData, updateOnboardingData } = useOnboarding();

  return (
    <div className="space-y-4">
      <textarea
        value={onboardingData.aboutMe}
        onChange={(e) => updateOnboardingData({ aboutMe: e.target.value })}
        placeholder="Share anything that might help Clara understand you better. For example:
• What are you currently working on?
• What challenges are you facing?
• What are your dreams and aspirations?
• What makes you unique?"
        className={cn(
          "w-full h-48 p-4 rounded-xl",
          "bg-white/5 border border-white/10",
          "text-white placeholder-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-purple-500/50",
          "transition-all duration-200",
          "resize-none"
        )}
      />
      <p className="text-sm text-gray-400">
        This helps Clara provide more personalized and meaningful interactions.
      </p>
    </div>
  );
};