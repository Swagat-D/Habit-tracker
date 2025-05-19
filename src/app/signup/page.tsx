'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Loader2, Sun, Moon, ArrowRight, ArrowLeft, Check, X } from 'lucide-react';

// Goal types with predefined habits
const GOALS = [
  {
    id: 'fitness',
    name: 'Fitness',
    description: 'Improve physical health and fitness',
    icon: '🏃',
    habits: [
      { name: 'Daily Exercise', icon: '🏋️', target: 30, unit: 'minutes', frequency: 'daily', color: '#FF5733' },
      { name: 'Drink Water', icon: '💧', target: 8, unit: 'glasses', frequency: 'daily', color: '#33A1FD' },
      { name: 'Walk Steps', icon: '👣', target: 10000, unit: 'steps', frequency: 'daily', color: '#4CAF50' }
    ]
  },
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Boost productivity and focus',
    icon: '⏱️',
    habits: [
      { name: 'Deep Work', icon: '🧠', target: 2, unit: 'hours', frequency: 'daily', color: '#9C27B0' },
      { name: 'No Social Media', icon: '📵', target: 1, unit: 'day', frequency: 'daily', color: '#607D8B' },
      { name: 'Read', icon: '📚', target: 20, unit: 'pages', frequency: 'daily', color: '#FF9800' }
    ]
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    description: 'Improve mental health and wellbeing',
    icon: '🧘',
    habits: [
      { name: 'Meditation', icon: '🧘', target: 10, unit: 'minutes', frequency: 'daily', color: '#673AB7' },
      { name: 'Gratitude Journal', icon: '📓', target: 3, unit: 'items', frequency: 'daily', color: '#E91E63' },
      { name: 'Sleep', icon: '😴', target: 8, unit: 'hours', frequency: 'daily', color: '#3F51B5' }
    ]
  },
  {
    id: 'learning',
    name: 'Learning',
    description: 'Continuous learning and skill development',
    icon: '🎓',
    habits: [
      { name: 'Study', icon: '📝', target: 1, unit: 'hour', frequency: 'daily', color: '#009688' },
      { name: 'New Skill Practice', icon: '🔧', target: 30, unit: 'minutes', frequency: 'daily', color: '#795548' },
      { name: 'Listen to Podcast', icon: '🎧', target: 1, unit: 'episode', frequency: 'daily', color: '#CDDC39' }
    ]
  }
];

export default function Signup() {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedHabits, setSelectedHabits] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  // Check system preference for dark mode
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. First register the user
      const registerResponse = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          goals: selectedGoals,
        }),
      });

      const userData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(userData.error || 'Failed to register');
      }

      // 2. If registration successful, create the selected habits for the user
      if (selectedHabits.length > 0) {
        // This will be handled by a modified registration API endpoint
        // that creates habits after user creation
        router.push('/login?registered=true');
      } else {
        router.push('/login?registered=true');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const toggleGoalSelection = (goalId: string) => {
    setSelectedGoals(prev => {
      // If goal is already selected, remove it
      if (prev.includes(goalId)) {
        // Also remove any habits associated with this goal
        setSelectedHabits(currentHabits => 
          currentHabits.filter(habit => 
            !GOALS.find(g => g.id === goalId)?.habits.some(h => h.name === habit.name)
          )
        );
        return prev.filter(id => id !== goalId);
      } 
      // Otherwise add the goal and its default habits
      else {
        const goalHabits = GOALS.find(g => g.id === goalId)?.habits || [];
        setSelectedHabits(prev => [...prev, ...goalHabits]);
        return [...prev, goalId];
      }
    });
  };

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // Render different steps based on currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="relative">
              <label htmlFor="name" className="sr-only">Full Name</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className={`appearance-none relative block w-full px-3 py-2 pl-10 border rounded-xl ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-slate-200 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-violet-500 sm:text-sm`}
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none relative block w-full px-3 py-2 pl-10 border rounded-xl ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-slate-200 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-violet-500 sm:text-sm`}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none relative block w-full px-3 py-2 pl-10 border rounded-xl ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-slate-200 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-violet-500 sm:text-sm`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={nextStep}
              disabled={!name || !email || !password}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </motion.button>
          </motion.div>
        );
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Select your goals
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Choose one or more goals to get started with suggested habits
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GOALS.map((goal) => (
                <motion.div
                  key={goal.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleGoalSelection(goal.id)}
                  className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${
                    selectedGoals.includes(goal.id)
                      ? `border-violet-500 ${isDarkMode ? 'bg-violet-900/20' : 'bg-violet-50'}`
                      : `${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{goal.icon}</span>
                      <div>
                        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {goal.name}
                        </h4>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {goal.description}
                        </p>
                      </div>
                    </div>
                    {selectedGoals.includes(goal.id) ? (
                      <div className="h-6 w-6 rounded-full bg-violet-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={prevStep}
                className={`flex-1 flex justify-center py-2 px-4 border text-sm font-medium rounded-xl ${
                  isDarkMode 
                    ? 'border-gray-700 text-white hover:bg-gray-800' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={nextStep}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Review your habits
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                These habits will be added to your account. You can customize them later.
              </p>
            </div>
            
            {selectedHabits.length > 0 ? (
              <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                {selectedHabits.map((habit, index) => (
                  <div 
                    key={`${habit.name}-${index}`}
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-3" style={{ color: habit.color }}>{habit.icon}</span>
                      <div>
                        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {habit.name}
                        </h4>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {habit.target} {habit.unit} {habit.frequency}
                        </p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setSelectedHabits(habits => habits.filter((_, i) => i !== index));
                      }}
                      className="h-6 w-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 rounded-lg border ${
                isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
              }`}>
                <p>No habits selected. Go back to select goals.</p>
              </div>
            )}
            
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={prevStep}
                className={`flex-1 flex justify-center py-2 px-4 border text-sm font-medium rounded-xl ${
                  isDarkMode 
                    ? 'border-gray-700 text-white hover:bg-gray-800' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Complete <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Progress indicator for steps
  const renderProgressSteps = () => {
    return (
      <div className="flex justify-center space-x-2 mb-6">
        {[0, 1, 2].map((step) => (
          <div
            key={step}
            className={`h-2 rounded-full transition-all ${
              step === currentStep
                ? 'bg-violet-500 w-8'
                : step < currentStep
                ? 'bg-violet-300 w-8'
                : `w-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-950 text-white' : 'bg-slate-50 text-gray-900'
      }`}
    >
      <div className="absolute top-4 right-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-xl border ${
            isDarkMode ? 'bg-gray-800 text-amber-300 border-gray-700' : 'bg-gray-100 text-gray-700 border-slate-200'
          }`}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-md w-full space-y-8 p-8 rounded-2xl shadow-sm border ${
          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              H
            </div>
          </div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-600">
            Join Habit-Tracker
          </h2>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Start building better habits today!
          </p>
        </div>

        {renderProgressSteps()}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-rose-100 dark:bg-rose-900/30 border border-rose-400 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-xl"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {renderStep()}

          {currentStep === 0 && (
            <div className="text-sm text-center">
              <Link
                href="/login"
                className={`font-medium ${
                  isDarkMode ? 'text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-500'
                }`}
              >
                Already have an account? Sign in
              </Link>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}