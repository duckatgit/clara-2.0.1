import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Target, Search, Book, Brain, Sparkles } from 'lucide-react';
import { useOnboarding, OnboardingRole } from '../OnboardingContext';
import { cn } from '../../../utils/cn';

const roles = [
  { id: 'companion' as OnboardingRole, icon: Heart, label: 'A Companion', description: 'Someone to talk to and share your thoughts with' },
  { id: 'coach' as OnboardingRole, icon: Target, label: 'A Personal Coach', description: 'Help you achieve your goals and stay motivated' },
  { id: 'discovery' as OnboardingRole, icon: Search, label: 'A Self-Discovery Tool', description: 'Guide you in understanding yourself better' },
  { id: 'journal' as OnboardingRole, icon: Book, label: 'A Journaling Assistant', description: 'Help you reflect and document your journey' },
  { id: 'thought' as OnboardingRole, icon: Brain, label: 'A Thought Partner', description: 'Engage in deep, meaningful conversations' },
  { id: 'combination' as OnboardingRole, icon: Sparkles, label: 'A Combination', description: 'Adapt to different roles based on your needs' },
];

export const RoleSelection = () => {
  const { onboardingData, updateOnboardingData } = useOnboarding();

  const toggleRole = (role: OnboardingRole) => {
    const newRoles = onboardingData.role.includes(role)
      ? onboardingData.role.filter(r => r !== role)
      : [...onboardingData.role, role];
    updateOnboardingData({ role: newRoles });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {roles.map(({ id, icon: Icon, label, description }) => (
        <motion.button
          key={id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => toggleRole(id)}
          className={cn(
            "p-4 rounded-xl text-left",
            "border transition-all duration-200",
            "flex items-start space-x-4",
            onboardingData.role.includes(id)
              ? "bg-purple-500/20 border-purple-500/50"
              : "bg-white/5 border-white/10 hover:bg-white/10"
          )}
        >
          <div className={cn(
            "p-2 rounded-lg",
            onboardingData.role.includes(id)
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