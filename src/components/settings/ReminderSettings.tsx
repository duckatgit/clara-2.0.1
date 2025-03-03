import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, MessageCircle, Mail, Radio } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ReminderPreferences } from '../../lib/reminderPreferences';
import toast from 'react-hot-toast';

interface ReminderSettingsProps {
  preferences: ReminderPreferences;
  onUpdate: (preferences: ReminderPreferences) => void;
}

export const ReminderSettings: React.FC<ReminderSettingsProps> = ({
  preferences,
  onUpdate,
}) => {
  const handleToggle = (path: string[], value: any) => {
    const newPreferences = { ...preferences };
    let current = newPreferences;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    onUpdate(newPreferences);
  };

  const handleEmailPushToggle = () => {
    toast.success('Email and push notifications coming soon!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Bell className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Reminder Settings</h3>
            <p className="text-sm text-gray-300">Customize how Clara reminds you about your goals</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleToggle(['enabled'], !preferences.enabled)}
          className={cn(
            "relative w-14 h-7 rounded-full transition-colors",
            preferences.enabled ? "bg-purple-500" : "bg-gray-600"
          )}
        >
          <motion.div
            animate={{ x: preferences.enabled ? 28 : 4 }}
            className="absolute top-1 left-0 w-5 h-5 bg-white rounded-full"
          />
        </motion.button>
      </div>

      {preferences.enabled && (
        <div className="space-y-8">
          {/* Frequency Section */}
          <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-6">
                <Clock className="w-5 h-5 text-purple-400" />
                <label className="text-base font-medium text-white">Reminder Frequency</label>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {(['low', 'medium', 'high'] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => handleToggle(['frequency'], freq)}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium",
                      "transition-all duration-200",
                      preferences.frequency === freq
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-gray-900/50 text-gray-400 hover:text-white border border-gray-700/50 hover:border-gray-600/50"
                    )}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quiet Hours Section */}
          <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-6">
                <Clock className="w-5 h-5 text-purple-400" />
                <label className="text-base font-medium text-white">Quiet Hours</label>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Start Time</label>
                  <select
                    value={preferences.quiet_hours.start}
                    onChange={(e) => handleToggle(['quiet_hours', 'start'], parseInt(e.target.value))}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg",
                      "bg-gray-900/50 border border-gray-700/50",
                      "text-white",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    )}
                  >
                    {[...Array(24)].map((_, i) => (
                      <option key={i} value={i} className="bg-gray-800">
                        {i.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">End Time</label>
                  <select
                    value={preferences.quiet_hours.end}
                    onChange={(e) => handleToggle(['quiet_hours', 'end'], parseInt(e.target.value))}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg",
                      "bg-gray-900/50 border border-gray-700/50",
                      "text-white",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    )}
                  >
                    {[...Array(24)].map((_, i) => (
                      <option key={i} value={i} className="bg-gray-800">
                        {i.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Channels Section */}
          <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Radio className="w-5 h-5 text-purple-400" />
                <label className="text-base font-medium text-white">Notification Channels</label>
              </div>
              <div className="space-y-4">
                {/* In-Chat Reminders */}
                <div className={cn(
                  "flex items-center justify-between p-4 rounded-lg",
                  "bg-gray-900/30 border border-gray-700/30",
                  "transition-colors duration-200",
                  preferences.channels.chat && "bg-purple-500/10 border-purple-500/20"
                )}>
                  <div className="flex items-center space-x-3">
                    <MessageCircle className={cn(
                      "w-5 h-5",
                      preferences.channels.chat ? "text-purple-400" : "text-gray-400"
                    )} />
                    <span className={cn(
                      preferences.channels.chat ? "text-white" : "text-gray-300"
                    )}>In-Chat Reminders</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggle(['channels', 'chat'], !preferences.channels.chat)}
                    className={cn(
                      "relative w-12 h-6 rounded-full transition-colors",
                      preferences.channels.chat ? "bg-purple-500" : "bg-gray-600"
                    )}
                  >
                    <motion.div
                      animate={{ x: preferences.channels.chat ? 24 : 4 }}
                      className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full"
                    />
                  </motion.button>
                </div>

                {/* Email Notifications - Coming Soon */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-gray-300">Email Notifications</span>
                      <span className="ml-2 text-xs text-purple-400">Coming Soon</span>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEmailPushToggle}
                    className="relative w-12 h-6 rounded-full bg-gray-600 opacity-50 cursor-not-allowed"
                  >
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                  </motion.button>
                </div>

                {/* Push Notifications - Coming Soon */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
                  <div className="flex items-center space-x-3">
                    <Radio className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-gray-300">Push Notifications</span>
                      <span className="ml-2 text-xs text-purple-400">Coming Soon</span>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEmailPushToggle}
                    className="relative w-12 h-6 rounded-full bg-gray-600 opacity-50 cursor-not-allowed"
                  >
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};