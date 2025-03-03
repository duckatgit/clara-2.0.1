import React, { createContext, useContext, useState } from 'react';

export type OnboardingRole = 'companion' | 'coach' | 'discovery' | 'journal' | 'thought' | 'combination';
export type OnboardingTone = 'friendly' | 'formal' | 'adaptive';
export type OnboardingFocus = 'improvement' | 'emotional' | 'goals' | 'journal' | 'general';
export type OnboardingFrequency = 'daily' | 'weekly' | 'onDemand';

interface OnboardingData {
  role: OnboardingRole[];
  tone: OnboardingTone;
  focus: OnboardingFocus[];
  frequency: OnboardingFrequency;
  aboutMe: string;
}

interface OnboardingContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
}

const defaultOnboardingData: OnboardingData = {
  role: [],
  tone: 'friendly',
  focus: [],
  frequency: 'daily',
  aboutMe: '',
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboardingData);

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        onboardingData,
        updateOnboardingData,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};