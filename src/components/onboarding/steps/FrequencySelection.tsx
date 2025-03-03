import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Bell } from 'lucide-react';
import { useOnboarding, OnboardingFrequency } from '../OnboardingContext';
import { cn } from '../../../utils/cn';

const frequencies = [
  { id: 'daily' as OnboardingFrequency, icon: Zap, label: 'Every Day', description: 'Regular daily check-ins and conversations' },
  { id: 'weekly' as OnboardingFrequency, icon: Clock, label: 'Every Week', description: 'Weekly sessions for deeper discussions' },
  { id: 'onDemand' as OnboardingFrequency, icon: Bell, label: 'Only When I Ask', description: 'You initiate conversations as needed' },
];

export const FrequencySelection = () => {
  const { onboardingData, updateOnboardingData } = useOnboarding();

  return (
    <div className="grid grid-cols-1 gap-4">
      {frequencies.map(({ id, icon: Icon, label, description }) => (
        <motion.button
          key={id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => updateOnboardingData({ frequency: id })}
          className={cn(
            "p-4 rounded-xl text-left",
            "border transition-all duration-200",
            "flex items-start space-x-4",
            onboardingData.frequency === id
              ? "bg-purple-500/20 border-purple-500/50"
              : "bg-white/5 border-white/10 hover:bg-white/10"
          )}
        >
          <div className={cn(
            "p-2 rounded-lg",
            onboardingData.frequency === id
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