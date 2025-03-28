import { motion } from 'framer-motion';
import { Book, Brain, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Link } from 'react-router-dom';


const activities = [
  {
    id: 'journal',
    title: 'Personal Journal',
    description: 'Document your thoughts, feelings, and daily reflections',
    icon: Book,
    link: '/activities/journal',
    color: 'from-emerald-500 to-teal-500',
    comingSoon: false
  },
  {
    id: 'personality',
    title: 'Personality Insights',
    description: 'Discover more about yourself through guided assessments',
    icon: Brain,
    link: '/activities/personality',
    color: 'from-violet-500 to-purple-500',
    comingSoon: false
  },
];

const Activities = () => {
  return (
    <div className="min-h-screen">
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

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Activities</h1>
          <p className="text-gray-300">Explore tools for self-discovery and growth</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "relative p-6 rounded-2xl",
                "bg-white/5 backdrop-blur-sm",
                "border border-white/10",
                "overflow-hidden group"
              )}
            >
              {/* Background gradient */}
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-10",
                "bg-gradient-to-r",
                activity.color,
                "transition-opacity duration-500"
              )} />

              <div className="relative">
                <div className="flex items-center space-x-4 mb-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    "bg-gradient-to-br",
                    activity.color,
                    "bg-opacity-20"
                  )}>
                    <activity.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{activity.title}</h3>
                    <p className="text-gray-300">{activity.description}</p>
                  </div>
                </div>

                {activity.comingSoon ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Coming Soon</span>
                    <div className="px-4 py-2 rounded-lg bg-white/5 text-gray-400">
                      Stay Tuned
                    </div>
                  </div>
                ) : (
                  <Link
                    to={activity.link}
                    className={cn(
                      "flex items-center justify-between",
                      "px-4 py-2 rounded-lg",
                      "bg-gradient-to-r",
                      activity.color,
                      "text-white font-medium",
                      "transition-transform duration-200",
                      "hover:translate-x-2"
                    )}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Activities;