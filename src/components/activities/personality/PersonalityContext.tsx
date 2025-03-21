import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { api } from '../../../lib/supabase';
import toast from 'react-hot-toast';

interface PersonalityResults {
  traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  values: string[];
  strengths: string[];
  growthAreas: string[];
  insights: string[];
}

interface PersonalityContextType {
  answers: Record<string, number>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  results: PersonalityResults | null;
  calculateResults: () => Promise<void>;
  isPremium: boolean;
  isLoading: boolean;
  history: PersonalityResults[];
  hasCompletedTest: boolean;
}

const PersonalityContext = createContext<PersonalityContextType | undefined>(undefined);

export const PersonalityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<PersonalityResults | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<PersonalityResults[]>([]);
  const [hasCompletedTest, setHasCompletedTest] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      // Check premium status
      const premium = await api.isPremiumUser();
      setIsPremium(premium);

      // Load latest results
      const { data: latestResults, error } = await supabase
        .from('personality_results')
        .select('results')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (latestResults?.results) {
        setResults(latestResults.results);
        setHasCompletedTest(true);
      }

      // Load history for premium users
      if (premium) {
        const { data: resultsHistory, error: historyError } = await supabase
          .from('personality_results')
          .select('results')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (historyError && historyError.code !== 'PGRST116') {
          throw historyError;
        }

        if (resultsHistory) {
          setHistory(resultsHistory.map(r => r.results));
        }
      }
    } catch (error) {
      console.error('Failed to load personality data:', error);
      toast.error('Failed to load personality data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateResults = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No user session found');

      // Calculate trait scores based on answers
      const traitScores = {
        openness: Math.round((answers['q4'] / 5) * 100),
        conscientiousness: Math.round((answers['q2'] / 5) * 100),
        extraversion: Math.round((answers['q1'] / 5) * 100),
        agreeableness: Math.round((answers['q3'] / 5) * 100),
        neuroticism: Math.round((answers['q5'] / 5) * 100),
      };

      // Generate values based on highest scores
      const values = [];
      if (traitScores.openness > 70) values.push('Innovation', 'Creativity');
      if (traitScores.conscientiousness > 70) values.push('Reliability', 'Excellence');
      if (traitScores.extraversion > 70) values.push('Connection', 'Energy');
      if (traitScores.agreeableness > 70) values.push('Harmony', 'Empathy');
      if (answers['q6'] >= 4) values.push('Leadership', 'Collaboration');

      // Generate strengths based on highest scores
      const strengths = [];
      if (traitScores.openness > 60) strengths.push('Creative problem-solving', 'Adaptability');
      if (traitScores.conscientiousness > 60) strengths.push('Organization', 'Attention to detail');
      if (traitScores.extraversion > 60) strengths.push('Social engagement', 'Communication');
      if (traitScores.agreeableness > 60) strengths.push('Empathy', 'Collaboration');
      if (answers['q6'] >= 3) strengths.push('Leadership', 'Team dynamics');

      // Generate growth areas based on lower scores
      const growthAreas = [];
      if (traitScores.openness < 50) growthAreas.push('Creative thinking', 'Flexibility');
      if (traitScores.conscientiousness < 50) growthAreas.push('Planning', 'Task completion');
      if (traitScores.extraversion < 50) growthAreas.push('Social confidence', 'Networking');
      if (traitScores.agreeableness < 50) growthAreas.push('Emotional expression', 'Conflict resolution');
      if (answers['q5'] >= 3) growthAreas.push('Stress management', 'Resilience');

      // Generate insights based on overall pattern
      const insights = [
        `Your ${traitScores.openness > 60 ? 'high' : 'moderate'} openness suggests you ${traitScores.openness > 60 ? 'thrive on' : 'could benefit from more'
        } exploration and creative thinking.`,
        `Your approach to challenges is ${traitScores.conscientiousness > 60 ? 'methodical and organized' : 'flexible and adaptable'
        }, which serves you well in ${traitScores.conscientiousness > 60 ? 'structured environments' : 'dynamic situations'
        }.`,
        `In social situations, you tend to ${traitScores.extraversion > 60 ? 'energize others and lead discussions' : 'observe and provide thoughtful input'
        }.`,
        `Your ${traitScores.agreeableness > 60 ? 'strong' : 'developing'} interpersonal skills help you ${traitScores.agreeableness > 60 ? 'build deep connections' : 'maintain balanced relationships'
        }.`
      ];

      const newResults = {
        traits: traitScores,
        values: values.slice(0, 5),
        strengths: strengths.slice(0, 5),
        growthAreas: growthAreas.slice(0, 4),
        insights
      };

      // Save results to database
      const { error } = await supabase
        .from('personality_results')
        .insert({
          user_id: session.user.id,
          results: newResults
        });

      if (error) throw error;

      setResults(newResults);
      setHasCompletedTest(true);

      // Update history for premium users
      if (isPremium) {
        setHistory(prev => [newResults, ...prev]);
      }

      return newResults;
    } catch (error) {
      console.error('Failed to calculate personality results:', error);
      toast.error('Failed to save personality results');
      throw error;
    }
  };

  return (
    <PersonalityContext.Provider
      value={{
        answers,
        setAnswers,
        results,
        calculateResults,
        isPremium,
        isLoading,
        history,
        hasCompletedTest
      }}
    >
      {children}
    </PersonalityContext.Provider>
  );
};

export const usePersonality = () => {
  const context = useContext(PersonalityContext);
  if (context === undefined) {
    throw new Error('usePersonality must be used within a PersonalityProvider');
  }
  return context;
};