import React from 'react';
import { Outlet } from 'react-router-dom';
import { Brain } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-2xl bg-white/5 backdrop-blur-sm mb-4">
            <Brain className="w-12 h-12 text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Clara AI</h1>
          <p className="text-gray-300">Your personal AI companion</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;