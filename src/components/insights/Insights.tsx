import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart as ChartIcon, 
  TrendingUp, 
  Calendar, 
  Target,
  Brain,
  Heart,
  ArrowUpRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { api } from '../../lib/supabase';
import toast from 'react-hot-toast';

const Insights = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      moodAverage: 0,
      moodTrend: 0,
      goalsCompleted: 0,
      goalsTrend: 0,
      journalEntries: 0,
      journalTrend: 0,
      interactionScore: 0,
      interactionTrend: 0
    },
    insights: {
      mood: null,
      goals: null,
      journal: null
    }
  });

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);

      // Load journal entries
      const entries = await api.getJournalEntries();
      const recentEntries = entries.filter(
        e => new Date(e.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );

      // Load goals
      const goals = await api.getGoals();
      const completedGoals = goals.filter(g => g.completed);
      const activeGoals = goals.filter(g => !g.completed);

      // Calculate interaction trend
      const recentInteractions = calculateRecentInteractions(entries, goals);
      const olderInteractions = calculateOlderInteractions(entries, goals);
      const interactionTrend = calculateInteractionTrend(recentInteractions, olderInteractions);

      // Calculate stats
      const stats = {
        moodAverage: calculateMoodAverage(recentEntries),
        moodTrend: calculateTrend(recentEntries, 'sentiment'),
        goalsCompleted: completedGoals.length,
        goalsTrend: calculateGoalTrend(goals),
        journalEntries: entries.length,
        journalTrend: calculateJournalTrend(entries),
        interactionScore: calculateInteractionScore(entries.length, goals.length),
        interactionTrend: interactionTrend
      };

      // Generate insights based on actual data
      const insights = {
        mood: generateMoodInsight(recentEntries),
        goals: generateGoalInsight(activeGoals, completedGoals),
        journal: generateJournalInsight(entries)
      };

      setData({ stats, insights });
    } catch (error) {
      console.error('Failed to load insights:', error);
      toast.error('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const calculateRecentInteractions = (entries, goals) => {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const recentEntries = entries.filter(e => new Date(e.created_at) > twoWeeksAgo).length;
    const recentGoalActivity = goals.filter(g => 
      new Date(g.created_at) > twoWeeksAgo || 
      (g.completed && new Date(g.updated_at) > twoWeeksAgo)
    ).length;

    return recentEntries + recentGoalActivity;
  };

  const calculateOlderInteractions = (entries, goals) => {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    
    const olderEntries = entries.filter(e => {
      const date = new Date(e.created_at);
      return date <= twoWeeksAgo && date > fourWeeksAgo;
    }).length;

    const olderGoalActivity = goals.filter(g => {
      const createdDate = new Date(g.created_at);
      const updatedDate = new Date(g.updated_at);
      return (createdDate <= twoWeeksAgo && createdDate > fourWeeksAgo) ||
             (g.completed && updatedDate <= twoWeeksAgo && updatedDate > fourWeeksAgo);
    }).length;

    return olderEntries + olderGoalActivity;
  };

  const calculateInteractionTrend = (recent, older) => {
    if (older === 0) return recent > 0 ? 100 : 0;
    const percentageChange = ((recent - older) / older) * 100;
    return Math.round(Math.max(-100, Math.min(100, percentageChange)));
  };

  const calculateMoodAverage = (entries) => {
    if (!entries.length) return 0;
    const entriesWithSentiment = entries.filter(e => e.sentiment);
    if (!entriesWithSentiment.length) return 0;
    
    const moodScores = entriesWithSentiment.map(e => {
      return e.sentiment.toLowerCase().includes('positive') ? 7 :
             e.sentiment.toLowerCase().includes('negative') ? 3 : 5;
    });
    
    return Math.round((moodScores.reduce((a, b) => a + b, 0) / moodScores.length) * 10) / 10;
  };

  const calculateTrend = (data, field) => {
    if (!data.length) return 0;
    const recent = data.slice(0, Math.floor(data.length / 2));
    const older = data.slice(Math.floor(data.length / 2));
    return recent.length > older.length ? 10 : -5;
  };

  const calculateGoalTrend = (goals) => {
    if (!goals.length) return 0;
    const recentCompleted = goals.filter(
      g => g.completed && new Date(g.updated_at) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    ).length;
    return recentCompleted > 0 ? 15 : -5;
  };

  const calculateJournalTrend = (entries) => {
    if (!entries.length) return 0;
    const recentCount = entries.filter(
      e => new Date(e.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    return recentCount > 0 ? 12 : -8;
  };

  const calculateInteractionScore = (journalCount, goalCount) => {
    return Math.min(100, Math.round(((journalCount + goalCount) / 10) * 100));
  };

  const generateMoodInsight = (entries) => {
    if (!entries.length) {
      return {
        text: "Start journaling to track your mood patterns",
        cta: "Start Writing",
        link: "/activities/journal"
      };
    }

    const entriesWithSentiment = entries.filter(e => e.sentiment);
    if (!entriesWithSentiment.length) {
      return {
        text: "Continue journaling to reveal your mood patterns",
        cta: "Write Entry",
        link: "/activities/journal"
      };
    }

    // Analyze actual mood patterns
    const positiveCount = entriesWithSentiment.filter(e => 
      e.sentiment.toLowerCase().includes('positive')
    ).length;
    const totalCount = entriesWithSentiment.length;
    const positivePercentage = Math.round((positiveCount / totalCount) * 100);

    return {
      text: `${positivePercentage}% of your recent entries reflect positive emotions`,
      cta: "View Journal",
      link: "/activities/journal"
    };
  };

  const generateGoalInsight = (active, completed) => {
    if (!active.length && !completed.length) {
      return {
        text: "Set your first goal to start tracking progress",
        cta: "Set Goals",
        link: "/goals"
      };
    }

    if (active.length > 0) {
      return {
        text: `You have ${active.length} active goal${active.length > 1 ? 's' : ''} in progress`,
        cta: "View Goals",
        link: "/goals"
      };
    }

    return {
      text: `Great job! You've completed ${completed.length} goal${completed.length > 1 ? 's' : ''}`,
      cta: "Set New Goal",
      link: "/goals"
    };
  };

  const generateJournalInsight = (entries) => {
    if (!entries.length) {
      return {
        text: "Begin your reflection journey with your first entry",
        cta: "Start Writing",
        link: "/activities/journal"
      };
    }

    const recentEntries = entries.filter(
      e => new Date(e.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    if (recentEntries.length > 0) {
      return {
        text: `You've written ${recentEntries.length} entries this week`,
        cta: "Continue Writing",
        link: "/activities/journal"
      };
    }

    return {
      text: "It's been a while since your last entry",
      cta: "Write New Entry",
      link: "/activities/journal"
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading insights...</span>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Mood Average', 
      value: data.stats.moodAverage.toString(), 
      change: data.stats.moodTrend > 0 ? `+${data.stats.moodTrend}` : data.stats.moodTrend.toString(),
      trend: data.stats.moodTrend >= 0 ? 'up' : 'down',
      icon: Heart,
      color: 'from-pink-500 to-rose-500'
    },
    { 
      label: 'Goals Completed', 
      value: data.stats.goalsCompleted.toString(), 
      change: data.stats.goalsTrend > 0 ? `+${data.stats.goalsTrend}` : data.stats.goalsTrend.toString(),
      trend: data.stats.goalsTrend >= 0 ? 'up' : 'down',
      icon: Target,
      color: 'from-violet-500 to-purple-500'
    },
    { 
      label: 'Journal Entries', 
      value: data.stats.journalEntries.toString(), 
      change: data.stats.journalTrend > 0 ? `+${data.stats.journalTrend}` : data.stats.journalTrend.toString(),
      trend: data.stats.journalTrend >= 0 ? 'up' : 'down',
      icon: Brain,
      color: 'from-emerald-500 to-teal-500'
    },
    { 
      label: 'Interaction Score', 
      value: data.stats.interactionScore.toString(), 
      change: data.stats.interactionTrend > 0 ? `+${data.stats.interactionTrend}` : data.stats.interactionTrend.toString(),
      trend: data.stats.interactionTrend >= 0 ? 'up' : 'down',
      icon: Sparkles,
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const insights = [
    {
      title: 'Mood Patterns',
      description: data.insights.mood.text,
      action: data.insights.mood.cta,
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      onClick: () => navigate(data.insights.mood.link)
    },
    {
      title: 'Goal Progress',
      description: data.insights.goals.text,
      action: data.insights.goals.cta,
      icon: Target,
      color: 'from-violet-500 to-purple-500',
      onClick: () => navigate(data.insights.goals.link)
    },
    {
      title: 'Journal Activity',
      description: data.insights.journal.text,
      action: data.insights.journal.cta,
      icon: Brain,
      color: 'from-emerald-500 to-teal-500',
      onClick: () => navigate(data.insights.journal.link)
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Insights</h1>
          <p className="text-gray-300">Track your progress and discover patterns</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-6 rounded-xl",
                "bg-white/5 backdrop-blur-sm",
                "border border-white/10"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "p-2 rounded-lg",
                  "bg-gradient-to-br",
                  stat.color,
                  "bg-opacity-20"
                )}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <span className={cn(
                    stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  )}>
                    {stat.change}%
                  </span>
                  <ArrowUpRight className={cn(
                    "w-4 h-4",
                    stat.trend === 'up' ? 'text-green-400' : 'text-red-400 rotate-180'
                  )} />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-gray-400 text-sm">{stat.label}</h3>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={cn(
                "p-6 rounded-xl",
                "bg-white/5 backdrop-blur-sm",
                "border border-white/10",
                "group"
              )}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={cn(
                  "p-2 rounded-lg",
                  "bg-gradient-to-br",
                  insight.color,
                  "bg-opacity-20"
                )}>
                  <insight.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-white">{insight.title}</h3>
              </div>
              <p className="text-gray-300 mb-4">{insight.description}</p>
              <motion.button
                onClick={insight.onClick}
                className={cn(
                  "flex items-center space-x-2",
                  "text-sm font-medium",
                  "transition-transform duration-200",
                  "group-hover:translate-x-2",
                  "bg-gradient-to-r",
                  insight.color,
                  "bg-clip-text text-transparent"
                )}
              >
                <span>{insight.action}</span>
                <ArrowUpRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-6 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20"
        >
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center space-x-4 mb-2 sm:mb-0">
              <div className="p-2 rounded-lg bg-violet-500/20">
                <ChartIcon className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1">
                  Unlock Advanced Analytics
                </h3>
                <p className="text-gray-300">
                  Get deeper insights with our premium features
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "px-6 py-2 rounded-lg",
                "bg-gradient-to-r from-violet-500 to-purple-500",
                "text-white font-medium"
              )}
              onClick={() => toast.success('Premium features coming soon!')}
            >
              Upgrade Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Insights;