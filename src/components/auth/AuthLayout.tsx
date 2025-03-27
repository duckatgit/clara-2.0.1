import React from 'react';
import { Outlet } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { FaBrain, FaBullseye, FaChartBar, FaComments } from 'react-icons/fa';
import { BsStars } from 'react-icons/bs';

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="flex items-center bg-white/5 backdrop-blur-sm border-white/10 p-4 rounded-xl ">
      <div className="bg-purple-600 p-3 rounded-lg mr-4">{icon}</div>
      <div className='text-left '>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm opacity-80 pr-10">{description}</p>
      </div>
    </div>
  );
}

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center w-screen">
      <div className="w-full flex">
        <div className='w-1/2 hidden lg:block'>
          <div className="min-h-screen hidden lg:flex items-center justify-center p-6">
            <div className="max-w-lg text-center text-white">
              <h1 className="text-3xl font-bold mb-2">Welcome to Clara AI</h1>
              <p className="text-lg mb-6">
                Your personal AI companion for growth, reflection, and meaningful conversations.
              </p>

              <div className="space-y-4">
                <FeatureCard
                  icon={<Brain className="text-2xl text-violet-100" />}
                  title="Adaptive Intelligence"
                  description="Clara learns and evolves with you, providing personalized support tailored to your needs."
                />
                <FeatureCard
                  icon={<FaComments className="text-2xl text-violet-100" />}
                  title="Natural Conversations"
                  description="Engage in meaningful dialogue with an AI that understands context and emotion."
                />
                <FeatureCard
                  icon={<FaBullseye className="text-2xl text-violet-100" />}
                  title="Goal Tracking"
                  description="Set, track, and achieve your personal and professional goals with guided support."
                />
                <FeatureCard
                  icon={<FaChartBar className="text-2xl text-violet-100" />}
                  title="Progress Insights"
                  description="Gain valuable insights into your growth journey through detailed analytics."
                />
              </div>
            </div>
          </div>
        </div>

        <div className='w-full lg:w-1/2 h-screen flex flex-col justify-center items-center'>
          <div className='flex pb-5 gap-2'>
            <BsStars className='text-2xl text-white' />
            <span className='text-white font-medium text-xl'>Clara AI</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm w-full sm:w-1/2 rounded-2xl p-8 shadow-xl border border-white/10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;