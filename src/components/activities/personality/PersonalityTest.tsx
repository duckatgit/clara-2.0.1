import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, ArrowLeft, Sparkles, Navigation, RefreshCw, Crown, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import { usePersonality } from './PersonalityContext';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  text: string;
  category: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism' | 'values' | 'eq' | 'growth';
  type: 'scenario' | 'reflection' | 'preference';
  options: {
    text: string;
    score: number;
    insight?: string;
  }[];
  insight: string;
}

const questions: Question[] = [
  {
    id: 'q1',
    text: "You're planning a weekend. Which scenario energizes you the most?",
    category: 'extraversion',
    type: 'scenario',
    options: [
      {
        text: "Hosting a dinner party with friends and meeting new people",
        score: 5,
        insight: "You thrive in social settings and gain energy from interactions. Your natural ability to connect with others can be a powerful tool for building meaningful relationships."
      },
      {
        text: "A quiet evening with a book or your favorite show",
        score: 1,
        insight: "You recharge through peaceful solitude and self-reflection. This introspective nature allows you to develop deep insights and maintain inner balance."
      },
      {
        text: "A small gathering with close friends",
        score: 3,
        insight: "You value meaningful connections in comfortable settings. This balanced approach helps you maintain deep relationships while respecting your energy levels."
      }
    ],
    insight: "Your social preferences reveal how you recharge and connect with others"
  },
  {
    id: 'q2',
    text: "When facing a challenging project, what's your first instinct?",
    category: 'conscientiousness',
    type: 'scenario',
    options: [
      {
        text: "Break it down into smaller, manageable steps",
        score: 5,
        insight: "You have a methodical approach to challenges. This structured thinking helps you tackle complex problems effectively and maintain steady progress."
      },
      {
        text: "Dive in and figure it out as you go",
        score: 2,
        insight: "You're adaptable and learn through experience. This flexible approach allows you to discover creative solutions and adjust quickly to changes."
      },
      {
        text: "Research thoroughly before starting",
        score: 4,
        insight: "You value preparation and understanding. This analytical approach helps you make informed decisions and avoid potential pitfalls."
      }
    ],
    insight: "Your approach to challenges reflects your planning and execution style"
  },
  {
    id: 'q3',
    text: "Your friend shares a creative idea that you think won't work. How do you respond?",
    category: 'agreeableness',
    type: 'scenario',
    options: [
      {
        text: "Honestly express your concerns while acknowledging their creativity",
        score: 4,
        insight: "You balance honesty with empathy. This approach helps build trust while maintaining authenticity in your relationships."
      },
      {
        text: "Enthusiastically support them despite your doubts",
        score: 2,
        insight: "You prioritize harmony and emotional support. This nurturing approach strengthens bonds but might sometimes come at the cost of complete honesty."
      },
      {
        text: "Ask questions to help them discover potential issues themselves",
        score: 5,
        insight: "You guide others while respecting their autonomy. This collaborative approach fosters growth and mutual understanding."
      }
    ],
    insight: "Your communication style reveals how you balance truth with relationships"
  },
  {
    id: 'q4',
    text: "When learning something new, which approach resonates with you most?",
    category: 'openness',
    type: 'preference',
    options: [
      {
        text: "Explore unconventional methods and experiment with different approaches",
        score: 5,
        insight: "Your curiosity and openness to new experiences drive your learning. This innovative mindset helps you discover unique solutions and perspectives."
      },
      {
        text: "Follow established methods but look for ways to optimize them",
        score: 3,
        insight: "You balance tradition with innovation. This practical approach helps you build on proven methods while finding room for improvement."
      },
      {
        text: "Master the fundamentals before exploring alternatives",
        score: 1,
        insight: "You value solid foundations and systematic learning. This methodical approach ensures deep understanding and reliable results."
      }
    ],
    insight: "Your learning style reflects your balance of curiosity and structure"
  },
  {
    id: 'q5',
    text: "When things don't go as planned, how do you typically react?",
    category: 'neuroticism',
    type: 'reflection',
    options: [
      {
        text: "Take a step back to process emotions before making new plans",
        score: 3,
        insight: "You're emotionally aware and thoughtful in your responses. This balanced approach helps you learn from setbacks while maintaining resilience."
      },
      {
        text: "Immediately look for alternative solutions and adapt",
        score: 1,
        insight: "You're resilient and solution-focused under pressure. This adaptable mindset helps you navigate challenges effectively."
      },
      {
        text: "Analyze what went wrong to prevent similar issues in the future",
        score: 4,
        insight: "You're reflective and growth-oriented in facing challenges. This analytical approach helps you turn setbacks into learning opportunities."
      }
    ],
    insight: "Your response to setbacks reveals your emotional resilience and adaptability"
  },
  {
    id: 'q6',
    text: "In group discussions, which role do you naturally gravitate towards?",
    category: 'eq',
    type: 'reflection',
    options: [
      {
        text: "The mediator who helps find common ground",
        score: 5,
        insight: "You have a natural talent for understanding and bridging different perspectives. This skill makes you valuable in building team harmony."
      },
      {
        text: "The observer who offers thoughtful insights",
        score: 3,
        insight: "You're perceptive and analytical in group dynamics. This perspective allows you to contribute meaningful insights at key moments."
      },
      {
        text: "The catalyst who energizes the discussion",
        score: 4,
        insight: "You naturally stimulate engagement and creativity in groups. This energy helps teams explore ideas more deeply and stay motivated."
      }
    ],
    insight: "Your role in group dynamics shows your interpersonal strengths"
  }
];

const PersonalityTest = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showingInsight, setShowingInsight] = useState(false);
  const { answers, setAnswers, calculateResults, hasCompletedTest, isPremium } = usePersonality();

  const handleAnswer = (score: number) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: score
    });
    setShowingInsight(true);
  };

  const handleNext = async () => {
    setShowingInsight(false);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      try {
        await calculateResults();
        navigate('/activities/personality/results');
      } catch (error) {
        // Error is handled by PersonalityContext
      }
    }
  };

  const handlePrevious = () => {
    setShowingInsight(false);
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const startNewTest = () => {
    if (!isPremium) {
      toast.error('Retaking the test is a premium feature');
      return;
    }
    setAnswers({});
    setCurrentQuestion(0);
    setShowingInsight(false);
  };

  const question = questions[currentQuestion];

  if (hasCompletedTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="relative max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link
                to="/activities"
                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Personality Insights</h1>
                <p className="text-gray-300">View your results or take the test again</p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-8 rounded-2xl",
              "bg-white/5 backdrop-blur-sm",
              "border border-white/10"
            )}
          >
            <div className="text-center space-y-6">
              <div className="p-4 inline-block rounded-xl bg-violet-500/20 mb-4">
                <Brain className="w-12 h-12 text-violet-400" />
              </div>

              <h2 className="text-2xl font-bold text-white">
                You've Already Completed the Test
              </h2>

              <p className="text-gray-300 max-w-lg mx-auto">
                {isPremium
                  ? "You can view your previous results or take the test again to see how your personality traits have evolved."
                  : "Upgrade to premium to track how your personality traits evolve over time by retaking the test."}
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/activities/personality/results')}
                  className={cn(
                    "px-6 py-3 rounded-lg",
                    "bg-gradient-to-r from-violet-500 to-purple-500",
                    "text-white font-medium",
                    "flex items-center justify-center space-x-2"
                  )}
                >
                  <Navigation className="w-5 h-5" />
                  <span>View Your Results</span>
                </motion.button>

                {isPremium ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startNewTest}
                    className={cn(
                      "px-6 py-3 rounded-lg",
                      "bg-white/10 hover:bg-white/20",
                      "text-white font-medium",
                      "flex items-center justify-center space-x-2",
                      "border border-white/10"
                    )}
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Take Test Again</span>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toast.success('Premium features coming soon!')}
                    className={cn(
                      "px-6 py-3 rounded-lg",
                      "bg-gradient-to-r from-yellow-500 to-amber-500",
                      "text-white font-medium",
                      "flex items-center justify-center space-x-2"
                    )}
                  >
                    <Crown className="w-5 h-5" />
                    <span>Upgrade to Premium</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="relative max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/activities"
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Personality Insights</h1>
              <p className="text-gray-300">Discover your unique traits and patterns</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {questions.map((_, index) => (
              <motion.div
                key={index}
                className={cn(
                  "h-1 flex-1 mx-1 rounded-full",
                  index <= currentQuestion ? "bg-violet-500" : "bg-gray-600"
                )}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            ))}
          </div>
          <div className="text-sm text-gray-400">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>

        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "p-8 rounded-2xl",
            "bg-white/5 backdrop-blur-sm",
            "border border-white/10"
          )}
        >
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-violet-500/20">
                <Brain className="w-6 h-6 text-violet-400" />
              </div>
              <h2 className="text-xl font-medium text-white">{question.text}</h2>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!showingInsight ? (
              <motion.div
                key="options"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {question.options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option.score)}
                    className={cn(
                      "w-full p-4 rounded-xl text-left",
                      "bg-white/10 border border-white/20",
                      "hover:bg-white/20 hover:border-violet-500/30",
                      "transition-all duration-200",
                      "text-white",
                      answers[question.id] === option.score && "bg-violet-500/20 border-violet-500/50"
                    )}
                  >
                    {option.text}
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="insight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                    <h3 className="text-lg font-medium text-white">Insight</h3>
                  </div>
                  <p className="text-gray-300">
                    {question.options.find(opt => opt.score === answers[question.id])?.insight}
                  </p>
                </div>

                <div className="flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePrevious}
                    // disabled={currentQuestion === 0}
                    className={cn(
                      "px-4 py-2 rounded-lg",
                      "text-gray-400 hover:text-white",
                      "flex items-center space-x-2",
                      "transition-colors duration-200",
                      // currentQuestion === 0 && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Previous</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    className={cn(
                      "px-6 py-2 rounded-lg",
                      "bg-gradient-to-r from-violet-500 to-purple-500",
                      "text-white font-medium",
                      "flex items-center space-x-2"
                    )}
                  >
                    <span>{currentQuestion === questions.length - 1 ? 'See Results' : 'Continue'}</span>
                    {currentQuestion === questions.length - 1 ? (
                      <Navigation className="w-5 h-5" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default PersonalityTest;