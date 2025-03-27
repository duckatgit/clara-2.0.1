import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { api } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Goal {
  id: string;
  title: string;
  description: string;
  deadline?: string;
  completed: boolean;
  created_at: string;
}

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await api.getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Failed to load goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !formData.title) return;

    try {
      setSaving(true);
      const newGoal = await api.createGoal(formData);
      setGoals(prev => [newGoal, ...prev]);
      setFormData({ title: '', description: '', deadline: '' });
      setShowForm(false);
      toast.success('Goal created successfully');
    } catch (error) {
      console.error('Failed to create goal:', error);
      toast.error('Failed to create goal');
    } finally {
      setSaving(false);
    }
  };

  const toggleGoalCompletion = async (id: string, completed: boolean) => {
    try {
      const updatedGoal = await api.updateGoal(id, { completed: !completed });
      setGoals(prev =>
        prev.map(goal =>
          goal.id === id ? updatedGoal : goal
        )
      );
      toast.success(completed ? 'Goal marked as incomplete' : 'Goal completed!');
    } catch (error) {
      console.error('Failed to update goal:', error);
      toast.error('Failed to update goal');
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await api.deleteGoal(id);
      setGoals(prev => prev.filter(goal => goal.id !== id));
      toast.success('Goal deleted');
    } catch (error) {
      console.error('Failed to delete goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading goals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Goals</h1>
            <p className="text-gray-300 mb-2 sm:mb-0">Track and achieve your aspirations</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className={cn(
              "px-4 py-2 rounded-lg",
              "bg-gradient-to-r from-violet-500 to-purple-500",
              "text-white font-medium",
              "flex items-center space-x-2"
            )}
          >
            <Plus className="w-5 h-5" />
            <span>New Goal</span>
          </motion.button>
        </div>

        {/* Goal Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className={cn(
                "p-5  rounded-xl",
                "bg-white/5 backdrop-blur-sm",
                "border border-white/10"
              )}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className={cn(
                        "w-full px-4 py-2 rounded-lg",
                        "bg-white/5 border border-white/10",
                        "text-white placeholder-gray-400",
                        "focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      )}
                      placeholder="What do you want to achieve?"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className={cn(
                        "w-full px-4 py-2 rounded-lg",
                        "bg-white/5 border border-white/10",
                        "text-white placeholder-gray-400",
                        "focus:outline-none focus:ring-2 focus:ring-violet-500/50",
                        "resize-none h-24"
                      )}
                      placeholder="Add some details about your goal..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Deadline (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={e => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      className={cn(
                        "w-full px-4 py-2 rounded-lg",
                        "bg-white/5 border border-white/10",
                        "text-white placeholder-gray-400",
                        "focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 rounded-lg text-gray-300 hover:text-white"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={saving || !formData.title}
                      className={cn(
                        "px-6 py-2 rounded-lg",
                        "bg-gradient-to-r from-violet-500 to-purple-500",
                        "text-white font-medium",
                        "flex items-center space-x-2",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <Target className="w-5 h-5" />
                          <span>Create Goal</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals List */}
        <div className="space-y-4">
          <AnimatePresence>
            {goals.length > 0 ? (
              goals.map(goal => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    "p-2 md:p-6 rounded-xl",
                    "bg-white/5 backdrop-blur-sm",
                    "border border-white/10",
                    "transition-colors duration-200",
                    goal.completed && "bg-green-500/5 border-green-500/20"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <button
                        onClick={() => toggleGoalCompletion(goal.id, goal.completed)}
                        className={cn(
                          "mt-1 p-1 rounded-full transition-colors duration-200",
                          goal.completed ? "text-green-400" : "text-gray-400 hover:text-white"
                        )}
                      >
                        {goal.completed ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <div>
                        <h3 className={cn(
                          "text-lg font-medium",
                          goal.completed ? "text-green-400" : "text-white"
                        )}>
                          {goal.title}
                        </h3>
                        <p className="text-gray-300 mt-1">{goal.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center text-sm text-gray-400">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>
                              {new Date(goal.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {goal.deadline && (
                            <div className="flex items-center text-sm text-gray-400">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>Due {new Date(goal.deadline).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteGoal(goal.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-400 transition-colors duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No goals yet</h3>
                <p className="text-gray-400">
                  Start by adding your first goal
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Goals;