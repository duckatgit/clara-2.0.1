import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Heart, Target, Book, Globe } from 'lucide-react';
import { useOnboarding, OnboardingFocus } from '../OnboardingContext';
import { cn } from '../../../utils/cn';

const focuses = [
  { id: 'improvement' as OnboardingFocus, icon: Rocket, label: 'Self-Improvement', description: 'Work on personal growth and development' },
  { id: 'emotional' as OnboardingFocus, icon: Heart, label: 'Emotional Support', description: 'Find comfort and understanding' },
  { id: 'goals' as OnboardingFocus, icon: Target, label: 'Goal Setting', description: 'Define and achieve your objectives' },
  { id: 'journal' as OnboardingFocus, icon: Book, label: 'Journaling & Reflection', description: 'Document and process your thoughts' },
  { id: 'general' as OnboardingFocus, icon: Globe, label: 'General Chat & Fun', description: 'Engage in casual conversation' },
];

export const FocusSelection = () => {
  const { onboardingData, updateOnboardingData } = useOnboarding();

  const toggleFocus = (focus: OnboardingFocus) => {
    const newFocuses = onboardingData.focus.includes(focus)
      ? onboardingData.focus.filter(f => f !== focus)
      : [...onboardingData.focus, focus];
    updateOnboardingData({ focus: newFocuses });
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {focuses.map(({ id, icon: Icon, label, description }) => (
        <motion.button
          key={id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => toggleFocus(id)}
          className={cn(
            "p-4 rounded-xl text-left",
            "border transition-all duration-200",
            "flex items-start space-x-4",
            onboardingData.focus.includes(id)
              ? "bg-purple-500/20 border-purple-500/50"
              : "bg-white/5 border-white/10 hover:bg-white/10"
          )}
        >
          <div className={cn(
            "p-2 rounded-lg",
            onboardingData.focus.includes(id)
              ? "bg-purple-500/20"
              : "bg-white/5"
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-medium text-white">{label}</div>
            <div className="text-sm text-gray-300">{description}</div>
          </div>
        </motion.button>
      ))}
    </div>
  );
};