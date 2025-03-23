import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { api, supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Admin = () => {
  const [newLimit, setNewLimit] = useState<number>(0); // Track new limit
  const [loading, setLoading] = useState<boolean>(false);
 const {user}=useAuth();
  // Handle updating the message limit for all users
  const handleUpdateLimit = async () => {
    if (newLimit <= 0) {
      toast.error('Please provide a valid message limit');
      return;
    }
    try {
      if (user?.email) {
        const info = await api.increaseMessageLimitForAllUsers(user.email, newLimit);
      } 

    } catch (error) {
      console.error("Error updating message limit:", error);
      toast.error('Failed to update message limit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen max-h-screen p-8 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <h1 className="text-2xl font-bold text-white mb-4 text-center">Admin Panel - Update Message Limit for All Users</h1>

      {/* Box Container */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4 w-full max-w-md">
        {/* New Limit Input */}
        <div className="mb-4">
          <label htmlFor="messageLimit" className="text-white">New Message Limit</label>
          <input
            type="number"
            id="messageLimit"
            value={newLimit}
            onChange={(e) => setNewLimit(Number(e.target.value))}
            className="mt-2 p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-purple-500 w-full"
            min="1"
          />
        </div>

        {/* Update Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUpdateLimit}
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium flex items-center space-x-2 transition-all duration-200 w-full"
        >
          <span>{loading ? 'Updating...' : 'Update Message Limit for All Users'}</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default Admin;
