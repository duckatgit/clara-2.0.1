import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingProvider } from './OnboardingContext';
import OnboardingStep from './OnboardingStep';
import { RoleSelection } from './steps/RoleSelection';
import { ToneSelection } from './steps/ToneSelection';
import { FocusSelection } from './steps/FocusSelection';
import { FrequencySelection } from './steps/FrequencySelection';
import { AboutMe } from './steps/AboutMe';

const steps = [
  {
    component: RoleSelection,
    title: "What do you want Clara AI to be for you?",
    subtitle: "Choose one or multiple roles that resonate with you",
  },
  {
    component: ToneSelection,
    title: "How do you want Clara AI to talk to you?",
    subtitle: "Select the communication style that suits you best",
  },
  {
    component: FocusSelection,
    title: "What do you want to focus on right now?",
    subtitle: "Choose the areas you'd like to explore with Clara",
  },
  {
    component: FrequencySelection,
    title: "How often do you want Clara to check in on you?",
    subtitle: "Set your preferred interaction frequency",
  },
  {
    component: AboutMe,
    title: "Tell Clara something about yourself",
    subtitle: "Help Clara understand you better (optional)",
  },
];

const Onboarding = () => {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className=" mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <AnimatePresence mode="wait">
              <OnboardingStep steps={steps} />
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </OnboardingProvider>
  );
};

export default Onboarding;