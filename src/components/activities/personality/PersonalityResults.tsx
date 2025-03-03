import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Heart, Target, Sparkles, ArrowLeft, Lock, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import { usePersonality } from './PersonalityContext';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const PersonalityResults = () => {
  const { results, isPremium } = usePersonality();
  const { user } = useAuth();

  const handleUpgradeClick = () => {
    toast.success('Upgrade feature coming soon!');
  };

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No Results Available</h2>
          <p className="text-gray-300 mb-6">Please complete the personality test first.</p>
          <Link
            to="/activities/personality"
            className={cn(
              "px-6 py-2 rounded-lg",
              "bg-gradient-to-r from-violet-500 to-purple-500",
              "text-white font-medium",
              "inline-flex items-center space-x-2"
            )}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Take the Test</span>
          </Link>
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
              <h1 className="text-3xl font-bold text-white">Your Personality Profile</h1>
              <p className="text-gray-300">Understanding your unique patterns</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-6 rounded-2xl",
              "bg-white/5 backdrop-blur-sm",
              "border border-white/10"
            )}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-violet-500/20">
                <Brain className="w-6 h-6 text-violet-400" />
              </div>
              <h2 className="text-xl font-medium text-white">Core Traits</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(results.traits).map(([trait, score]) => (
                <div key={trait} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300 capitalize">{trait}</span>
                    <span className="text-gray-400">{score}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "p-6 rounded-2xl",
              "bg-white/5 backdrop-blur-sm",
              "border border-white/10",
              !isPremium && "relative overflow-hidden"
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-pink-500/20">
                  <Heart className="w-6 h-6 text-pink-400" />
                </div>
                <h2 className="text-xl font-medium text-white">Core Values</h2>
              </div>
              {!isPremium && (
                <div className="flex items-center space-x-2 text-yellow-400">
                  <Crown className="w-5 h-5" />
                  <span className="text-sm font-medium">Premium</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {isPremium ? (
                results.values.map((value, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20"
                  >
                    {value}
                  </div>
                ))
              ) : (
                <>
                  {results.values.slice(0, 2).map((value, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20"
                    >
                      {value}
                    </div>
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent" />
                </>
              )}
            </div>

            {!isPremium && (
              <div className="absolute bottom-0 inset-x-0 p-6 text-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpgradeClick}
                  className={cn(
                    "px-6 py-2 rounded-lg",
                    "bg-gradient-to-r from-yellow-500 to-amber-500",
                    "text-white font-medium",
                    "flex items-center justify-center space-x-2",
                    "mx-auto"
                  )}
                >
                  <Lock className="w-4 h-4" />
                  <span>Unlock Full Analysis</span>
                </motion.button>
              </div>
            )}
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={cn(
                "p-6 rounded-2xl",
                "bg-white/5 backdrop-blur-sm",
                "border border-white/10"
              )}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-xl font-medium text-white">Key Strengths</h2>
              </div>

              <ul className="space-y-4">
                {results.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 mt-2 rounded-full bg-emerald-500" />
                    <span className="text-gray-300">{strength}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={cn(
                "p-6 rounded-2xl",
                "bg-white/5 backdrop-blur-sm",
                "border border-white/10"
              )}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Target className="w-6 h-6 text-amber-400" />
                </div>
                <h2 className="text-xl font-medium text-white">Growth Areas</h2>
              </div>

              <ul className="space-y-4">
                {results.growthAreas.map((area, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 mt-2 rounded-full bg-amber-500" />
                    <span className="text-gray-300">{area}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className={cn(
              "p-6 rounded-2xl",
              "bg-gradient-to-br from-violet-500/10 to-purple-500/10",
              "border border-violet-500/20",
              !isPremium && "relative overflow-hidden"
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-violet-500/20">
                  <Sparkles className="w-6 h-6 text-violet-400" />
                </div>
                <h2 className="text-xl font-medium text-white">Key Insights</h2>
              </div>
              {!isPremium && (
                <div className="flex items-center space-x-2 text-yellow-400">
                  <Crown className="w-5 h-5" />
                  <span className="text-sm font-medium">Premium</span>
                </div>
              )}
            </div>

            {isPremium ? (
              <div className="space-y-4">
                {results.insights.map((insight, index) => (
                  <p key={index} className="text-gray-300">{insight}</p>
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-4 opacity-50">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                  <div className="h-4 bg-white/10 rounded w-4/5" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-6 text-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpgradeClick}
                    className={cn(
                      "px-6 py-2 rounded-lg",
                      "bg-gradient-to-r from-yellow-500 to-amber-500",
                      "text-white font-medium",
                      "flex items-center justify-center space-x-2",
                      "mx-auto"
                    )}
                  >
                    <Lock className="w-4 h-4" />
                    <span>Unlock Premium Insights</span>
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityResults;