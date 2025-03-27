import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ReminderSettings } from './ReminderSettings';
import { api } from '../../lib/supabase';
import { defaultPreferences } from '../../lib/reminderPreferences';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const Settings = () => {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const profile = await api.getUserProfile();
      if (profile?.reminder_preferences) {
        setPreferences(profile.reminder_preferences);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async (newPreferences: any) => {
    try {
      setUpdating(true);

      // Get current profile first
      const profile = await api.getUserProfile();

      // Prepare update data
      const updateData = {
        // Keep existing values
        role: profile?.role || [],
        tone: profile?.tone || 'friendly',
        focus_areas: profile?.focus_areas || [],
        interaction_frequency: profile?.interaction_frequency || 'daily',
        about_me: profile?.about_me || '',
        // Add the new reminder preferences
        reminder_preferences: newPreferences
      };
      // Update profile
      await api.updateUserProfile(updateData);

      // Update local state
      setPreferences(newPreferences);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update settings');
      // Revert to previous preferences on error
      setPreferences(preferences);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.3,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, '-100vh'],
              opacity: [null, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Customize your Clara AI experience</p>
          </div>

          <div className="relative">
            {updating && (
              <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                <div className="flex items-center space-x-2 text-white">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Updating settings...</span>
                </div>
              </div>
            )}

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-2 sm:p-6">
              <ReminderSettings
                preferences={preferences}
                onUpdate={handleUpdatePreferences}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;