import React from 'react';
import { motion } from 'framer-motion';
import { Smile, BookOpen, Sparkles } from 'lucide-react';
import { useOnboarding, OnboardingTone } from '../OnboardingContext';
import { cn } from '../../../utils/cn';

const tones = [
  { id: 'friendly' as OnboardingTone, icon: Smile, label: 'Friendly & Casual', description: 'Warm, approachable, and conversational' },
  { id: 'formal' as OnboardingTone, icon: BookOpen, label: 'Serious & Formal', description: 'Professional, structured, and focused' },
  { id: 'adaptive' as OnboardingTone, icon: Sparkles, label: 'Adaptive Mix', description: 'Adjusts based on the context and situation' },
];

export const ToneSelection = () => {
  const { onboardingData, updateOnboardingData } = useOnboarding();

  return (
    <div className="grid grid-cols-1 gap-4">
      {tones.map(({ id, icon: Icon, label, description }) => (
        <motion.button
          key={id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => updateOnboardingData({ tone: id })}
          className={cn(
            "p-4 rounded-xl text-left",
            "border transition-all duration-200",
            "flex items-start space-x-4",
            onboardingData.tone === id
              ? "bg-purple-500/20 border-purple-500/50"
              : "bg-white/5 border-white/10 hover:bg-white/10"
          )}
        >
          <div className={cn(
            "p-2 rounded-lg",
            onboardingData.tone === id
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