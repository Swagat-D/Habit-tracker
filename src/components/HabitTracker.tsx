"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from 'recharts';

// Type definitions
type Habit = {
  id: string;
  name: string;
  icon: string;
  target: number;
  unit: string;
  frequency: string;
  progress: number;
  streak: number;
  lastUpdated?: string | null;
  history: { date: string; value: number }[];
  color: string;
};

type User = {
  name: string;
  avatar: string;
  joinedDate: string;
  currentStreak: number;
  longestStreak: number;
};

type WeeklySummary = {
  day: string;
  sleep: number;
  water: number;
  exercise: number;
  meditation: number;
  reading: number;
};

type DailyProgress = {
  habit: string;
  progress: number;
  target: number;
  unit: string;
  color: string;
};

// Mock data
const generateWeeklyData = (): WeeklySummary[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    sleep: 5 + Math.random() * 4,
    water: 1 + Math.random() * 7,
    exercise: Math.random() * 60,
    meditation: Math.random() * 30,
    reading: Math.random() * 120,
  }));
};

const generateHabits = (): Habit[] => {
  return [
    {
      id: '1',
      name: 'Sleep',
      icon: '😴',
      target: 8,
      unit: 'hours',
      frequency: 'daily',
      progress: 7.5,
      streak: 5,
      history: Array(30).fill(0).map((_, i) => ({ 
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: 5 + Math.random() * 4
      })),
      color: '#6366F1'
    },
    {
      id: '2',
      name: 'Water',
      icon: '💧',
      target: 8,
      unit: 'glasses',
      frequency: 'daily',
      progress: 6,
      streak: 12,
      history: Array(30).fill(0).map((_, i) => ({ 
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: 4 + Math.random() * 5
      })),
      color: '#38BDF8'
    },
    {
      id: '3',
      name: 'Exercise',
      icon: '🏃',
      target: 30,
      unit: 'minutes',
      frequency: 'daily',
      progress: 15,
      streak: 3,
      history: Array(30).fill(0).map((_, i) => ({ 
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.random() * 60
      })),
      color: '#FB923C'
    },
    {
      id: '4',
      name: 'Meditation',
      icon: '🧘',
      target: 20,
      unit: 'minutes',
      frequency: 'daily',
      progress: 20,
      streak: 8,
      history: Array(30).fill(0).map((_, i) => ({ 
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: 5 + Math.random() * 25
      })),
      color: '#A855F7'
    },
    {
      id: '5',
      name: 'Reading',
      icon: '📚',
      target: 30,
      unit: 'minutes',
      frequency: 'daily',
      progress: 25,
      streak: 4,
      history: Array(30).fill(0).map((_, i) => ({ 
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.random() * 60
      })),
      color: '#14B8A6'
    },
    {
      id: '6',
      name: 'Screen Time',
      icon: '📱',
      target: 120,
      unit: 'minutes',
      frequency: 'daily',
      progress: 180,
      streak: 0,
      history: Array(30).fill(0).map((_, i) => ({ 
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: 60 + Math.random() * 240
      })),
      color: '#F43F5E'
    }
  ];
};

const App = () => {
  // State
  const [user, setUser] = useState<User>({
    name: 'Swagat Kumar Dash',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    joinedDate: '2023-11-15',
    currentStreak: 5,
    longestStreak: 21,
  });
  
  const [habits, setHabits] = useState<Habit[]>(generateHabits());
  const [weeklyData] = useState<WeeklySummary[]>(generateWeeklyData());
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week');
  const [selectedHabit, setSelectedHabit] = useState<string>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isNewHabitModalOpen, setIsNewHabitModalOpen] = useState<boolean>(false);
  const [isHabitDetailOpen, setIsHabitDetailOpen] = useState<boolean>(false);
  const [currentDetailHabit, setCurrentDetailHabit] = useState<Habit | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Effect to show today's date
  const [currentDate, setCurrentDate] = useState<string>('');
  
  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    
    // Check user's preferred color scheme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  // Helper function to display toast
  const showToast = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Function to update habit progress
// Function to update habit progress
const updateHabitProgress = (habitId: string, newProgress: number) => {
  const today = new Date().toISOString().split('T')[0];
  
  setHabits(prevHabits => 
    prevHabits.map(habit => {
      if (habit.id === habitId) {
        // Get the current habit
        const wasCompleted = habit.progress >= habit.target;
        const isNowCompleted = newProgress >= habit.target;
        
        // Calculate streak - only increment if:
        // 1. The habit wasn't already completed today (prevent multiple increments)
        // 2. The habit is now completed
        // 3. The habit was either completed yesterday or this is a new streak
        let newStreak = habit.streak;
        
        // If the habit is now completed AND wasn't already completed today
        if (isNowCompleted && (!wasCompleted || habit.lastUpdated !== today)) {
          newStreak = habit.streak + 1;
        } 
        // If the habit is not completed (and we're resetting progress), reset streak
        else if (newProgress === 0) {
          newStreak = 0;
        }
        // If just decreasing but still complete, maintain streak
        
        return { 
          ...habit, 
          progress: newProgress,
          streak: newStreak,
          lastUpdated: today,
          history: [
            ...habit.history.slice(0, -1),
            { ...habit.history[habit.history.length - 1], value: newProgress }
          ]
        };
      }
      return habit;
    })
  );
  
  const habitName = habits.find(h => h.id === habitId)?.name;
  showToast(`Updated ${habitName} progress!`);
};

  // Function to add a new habit
// Function to add a new habit
const addNewHabit = (newHabit: Omit<Habit, 'id' | 'history' | 'streak' | 'progress' | 'lastUpdated'>) => {
  const id = (habits.length + 1).toString();
  const newHabitComplete: Habit = {
    ...newHabit,
    id,
    progress: 0,
    streak: 0,
    lastUpdated: null,
    history: Array(30).fill(0).map((_, i) => ({ 
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.random() * newHabit.target
    })),
  };
  
  setHabits(prev => [...prev, newHabitComplete]);
  setIsNewHabitModalOpen(false);
  showToast(`Added new habit: ${newHabit.name}`);
};

  // Function to delete a habit
  const deleteHabit = (habitId: string) => {
    const habitName = habits.find(h => h.id === habitId)?.name;
    setHabits(habits.filter(habit => habit.id !== habitId));
    setIsHabitDetailOpen(false);
    showToast(`Deleted habit: ${habitName}`);
  };

  // Filtered habits based on search
  const filteredHabits = habits.filter(habit => 
    habit.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate daily progress
  const dailyProgress: DailyProgress[] = habits.map(habit => ({
    habit: habit.name,
    progress: habit.progress,
    target: habit.target,
    unit: habit.unit,
    color: habit.color
  }));

  // Calculate completion percentages for pie chart
  const completionData = [
    { name: 'Completed', value: habits.filter(h => h.progress >= h.target).length, color: '#10B981' },
    { name: 'Remaining', value: habits.filter(h => h.progress < h.target).length, color: '#E4E4E7' }
  ];

  // Function to open habit details
  const openHabitDetail = (habit: Habit) => {
    setCurrentDetailHabit(habit);
    setIsHabitDetailOpen(true);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navigation */}
      <nav className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg"
              >
                H
              </motion.div>
              <span className="ml-3 text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">HabitHub</span>
            </div>
            <div className="hidden md:flex md:space-x-8 items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : `${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'insights' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : `${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}`}
                onClick={() => {
                  setActiveTab('insights');
                  showToast('Insights coming soon!');
                }}
              >
                Insights
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'community' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : `${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}`}
                onClick={() => {
                  setActiveTab('community');
                  showToast('Community features coming soon!');
                }}
              >
                Community
              </motion.button>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
              >
                {isDarkMode ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <button
                  type="button"
                  className="flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 overflow-hidden"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <span className="sr-only">Open user menu</span>
                  <img className="h-10 w-10 rounded-full object-cover border-2 border-indigo-300" src={user.avatar} alt="User avatar" />
                </button>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setIsNewHabitModalOpen(true)}
              >
                <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Habit</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="md:flex md:items-center md:justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold leading-7 sm:text-4xl sm:truncate bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Hey, {user.name.split(' ')[0]}!
            </h2>
            <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{currentDate}</p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <div className={`relative rounded-full shadow-sm overflow-hidden transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <input
                type="text"
                className={`block w-full pl-4 pr-10 py-2 border-0 text-sm rounded-full focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'}`}
                placeholder="Search habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <motion.select
              whileHover={{ scale: 1.03 }}
              className={`block pl-3 pr-10 py-2 text-sm rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </motion.select>

            <motion.select
              whileHover={{ scale: 1.03 }}
              className={`block pl-3 pr-10 py-2 text-sm rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
              value={selectedHabit}
              onChange={(e) => setSelectedHabit(e.target.value)}
            >
              <option value="all">All Habits</option>
              {habits.map(habit => (
                <option key={habit.id} value={habit.id}>{habit.name}</option>
              ))}
            </motion.select>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8"
        >
          <motion.div
            variants={itemVariants}
            className={`rounded-2xl shadow-sm overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className={`px-4 py-5 sm:p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white`}>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-white/70 truncate">Current Streak</dt>
                    <dd>
                      <div className="text-2xl font-bold">{user.currentStreak} days</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className={`rounded-2xl shadow-sm overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className={`px-4 py-5 sm:p-6 bg-gradient-to-br from-green-500 to-teal-600 text-white`}>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-white/70 truncate">Completed Today</dt>
                    <dd>
                      <div className="text-2xl font-bold">
                        {habits.filter(h => h.progress >= h.target).length} / {habits.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className={`rounded-2xl shadow-sm overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className={`px-4 py-5 sm:p-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white`}>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-white/70 truncate">Longest Streak</dt>
                    <dd>
                      <div className="text-2xl font-bold">{user.longestStreak} days</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className={`rounded-2xl shadow-sm overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className={`px-4 py-5 sm:p-6 ${isDarkMode ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white' : 'bg-gradient-to-br from-gray-100 to-gray-200'}`}>
              <div className="flex items-center">
                <div className="h-12 w-12 mr-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={completionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={15}
                        outerRadius={24}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {completionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Completion Rate</dt>
                    <dd>
                      <div className="text-2xl font-bold">
                        {Math.round((habits.filter(h => h.progress >= h.target).length / habits.length) * 100)}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Daily Check-ins */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`rounded-2xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <h3 className={`text-lg font-semibold mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
</svg>
Today&#39;s Progress
</h3>
<div className="space-y-5">
{filteredHabits.length === 0 ? (
<div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
  <svg className="mx-auto h-12 w-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
  <p className="text-sm">No habits found matching your search.</p>
  <button 
    className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded-full text-sm font-medium"
    onClick={() => setSearchQuery('')}
  >
    Clear search
  </button>
</div>
) : (
filteredHabits.map(habit => (
  <motion.div 
    key={habit.id} 
    className={`relative p-4 rounded-xl ${isDarkMode ? 'bg-gray-750' : 'bg-gray-50'}`}
    whileHover={{ scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center">
        <span className="flex items-center justify-center text-xl h-8 w-8 rounded-lg bg-opacity-20" style={{ backgroundColor: `${habit.color}30` }}>{habit.icon}</span>
        <span className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{habit.name}</span>
      </div>
      <div className="flex items-center">
        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {habit.progress}/{habit.target} {habit.unit}
        </span>
        <button 
          className={`ml-2 p-1 rounded-full ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => openHabitDetail(habit)}
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      </div>
    </div>
    <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, (habit.progress / habit.target) * 100)}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-3 rounded-full"
        style={{ backgroundColor: habit.color }}
      ></motion.div>
    </div>
    <div className="mt-3 flex justify-between items-center">
      <div className="flex items-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${habit.streak > 0 ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
          {habit.streak > 0 ? `${habit.streak} day streak 🔥` : 'Start a streak!'}
        </span>
      </div>
      <div className="flex space-x-1">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => updateHabitProgress(habit.id, Math.max(0, habit.progress - 1))}
        >
          <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => updateHabitProgress(habit.id, habit.progress + 1)}
        >
          <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </motion.button>
        <motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  className={`inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white ${habit.progress >= habit.target ? 'bg-green-500 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
  onClick={() => {
    const today = new Date().toISOString().split('T')[0];
    // Only mark complete if not already completed today
    if (!(habit.progress >= habit.target && habit.lastUpdated === today)) {
      updateHabitProgress(habit.id, habit.target);
    }
  }}
>
  <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
</motion.button>
      </div>
    </div>
  </motion.div>
))
)}
</div>
</motion.div>

<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5, delay: 0.2 }}
className={`rounded-2xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
>
<h3 className={`text-lg font-semibold mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
<svg className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
</svg>
Priority Reminders
</h3>
<div className="space-y-3">
<motion.div 
whileHover={{ scale: 1.02, x: 5 }}
transition={{ type: 'spring', stiffness: 400, damping: 10 }}
className="flex justify-between items-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800"
>
<div className="flex items-center">
  <div className="flex-shrink-0 text-amber-500 dark:text-amber-400 text-xl">⚠️</div>
  <div className="ml-3">
    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Screen time goal exceeded</p>
    <p className="text-xs text-amber-700 dark:text-amber-400">You&#39;re 60 minutes over your goal</p>
  </div>
</div>
<button className="p-1 rounded-full text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300">
  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
</button>
</motion.div>

<motion.div 
whileHover={{ scale: 1.02, x: 5 }}
transition={{ type: 'spring', stiffness: 400, damping: 10 }}
className="flex justify-between items-center p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800"
>
<div className="flex items-center">
  <div className="flex-shrink-0 text-blue-500 dark:text-blue-400 text-xl">💧</div>
  <div className="ml-3">
    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Drink more water</p>
    <p className="text-xs text-blue-700 dark:text-blue-400">2 more glasses needed today</p>
  </div>
</div>
<button className="p-1 rounded-full text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
</button>
</motion.div>

<motion.div 
whileHover={{ scale: 1.02, x: 5 }}
transition={{ type: 'spring', stiffness: 400, damping: 10 }}
className="flex justify-between items-center p-3 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800"
>
<div className="flex items-center">
  <div className="flex-shrink-0 text-green-500 dark:text-green-400 text-xl">🏃</div>
  <div className="ml-3">
    <p className="text-sm font-medium text-green-800 dark:text-green-300">Exercise reminder</p>
    <p className="text-xs text-green-700 dark:text-green-400">You haven&#39;t exercised in 2 days</p>
  </div>
</div>
<button className="p-1 rounded-full text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
</button>
</motion.div>
</div>
</motion.div>
</div>

{/* Middle/Right Columns - Charts */}
<div className="lg:col-span-2 space-y-6">
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5, delay: 0.1 }}
className={`rounded-2xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
>
<div className="flex items-center justify-between mb-6">
<h3 className={`text-lg font-semibold flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
<svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
</svg>
Weekly Progress
</h3>
<div className="flex space-x-3">
<span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${isDarkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-800'}`}>
  Week {new Date().getWeek()}
</span>
</div>
</div>
<div className="h-72">
<ResponsiveContainer width="100%" height="100%">
<LineChart
  data={weeklyData}
  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
>
  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
  <XAxis dataKey="day" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
  <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
  <Tooltip 
    contentStyle={{ 
      backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
      borderColor: isDarkMode ? '#374151' : '#E5E7EB',
      color: isDarkMode ? '#FFFFFF' : '#000000'
    }} 
  />
  <Legend />
  {selectedHabit === 'all' || selectedHabit === '1' ? (
    <Line type="monotone" dataKey="sleep" stroke="#6366F1" activeDot={{ r: 8 }} name="Sleep (hours)" strokeWidth={2} />
  ) : null}
  {selectedHabit === 'all' || selectedHabit === '2' ? (
    <Line type="monotone" dataKey="water" stroke="#38BDF8" name="Water (glasses)" strokeWidth={2} />
  ) : null}
  {selectedHabit === 'all' || selectedHabit === '3' ? (
    <Line type="monotone" dataKey="exercise" stroke="#FB923C" name="Exercise (minutes)" strokeWidth={2} />
  ) : null}
  {selectedHabit === 'all' || selectedHabit === '4' ? (
    <Line type="monotone" dataKey="meditation" stroke="#A855F7" name="Meditation (minutes)" strokeWidth={2} />
  ) : null}
  {selectedHabit === 'all' || selectedHabit === '5' ? (
    <Line type="monotone" dataKey="reading" stroke="#14B8A6" name="Reading (minutes)" strokeWidth={2} />
  ) : null}
</LineChart>
</ResponsiveContainer>
</div>
</motion.div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5, delay: 0.3 }}
className={`rounded-2xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
>
<h3 className={`text-lg font-semibold mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
<svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
</svg>
Habit Completion
</h3>
<div className="h-64">
<ResponsiveContainer width="100%" height="100%">
  <BarChart
    data={dailyProgress.map(item => ({
      name: item.habit,
      completion: (item.progress / item.target) * 100,
      color: item.color
    }))}
    margin={{ top: 5, right: 30, left: 20, bottom: 35 }}
    barSize={20}
  >
    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
    <XAxis 
      dataKey="name" 
      stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} 
      angle={-45} 
      textAnchor="end"
      tick={{ fontSize: 12 }}
    />
    <YAxis 
      stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} 
      label={{ 
        value: 'Completion %', 
        angle: -90, 
        position: 'insideLeft',
        style: { textFill: isDarkMode ? '#9CA3AF' : '#6B7280' }
      }} 
    />
    <Tooltip 
      formatter={(value) => (typeof value === 'number' ? `${Math.round(value)}%` : value)}
      contentStyle={{ 
        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        borderColor: isDarkMode ? '#374151' : '#E5E7EB',
        color: isDarkMode ? '#FFFFFF' : '#000000'
      }} 
    />
    <Bar dataKey="completion" radius={[10, 10, 0, 0]}>
      {dailyProgress.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
</div>
</motion.div>

<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5, delay: 0.4 }}
className={`rounded-2xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
>
<h3 className={`text-lg font-semibold mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
<svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
</svg>
Achievement Badges
</h3>
<div className="grid grid-cols-3 gap-4">
<motion.div 
  className="flex flex-col items-center"
  whileHover={{ scale: 1.1, rotate: 5 }}
>
  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-lg`}>
    <span className="text-2xl">🔥</span>
  </div>
  <span className={`text-sm text-center font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>5-Day Streak</span>
</motion.div>
<motion.div 
  className="flex flex-col items-center"
  whileHover={{ scale: 1.1, rotate: 5 }}
>
  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-lg`}>
    <span className="text-2xl">💧</span>
  </div>
  <span className={`text-sm text-center font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Water Champion</span>
</motion.div>
<motion.div 
  className="flex flex-col items-center"
  whileHover={{ scale: 1.1, rotate: 5 }}
>
  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-lg`}>
    <span className="text-2xl">🏃</span>
  </div>
  <span className={`text-sm text-center font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Exercise Rookie</span>
</motion.div>
<motion.div 
  className="flex flex-col items-center"
  whileHover={{ scale: 1.1, rotate: 5 }}
>
  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg`}>
    <span className="text-2xl">⭐</span>
  </div>
  <span className={`text-sm text-center font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Perfect Day</span>
</motion.div>
<motion.div 
  className="flex flex-col items-center"
  whileHover={{ scale: 1.1, rotate: 5 }}
>
  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br from-purple-300 to-purple-400 text-white shadow-lg opacity-50`}>
    <span className="text-2xl">🧘</span>
  </div>
  <span className={`text-sm text-center font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Zen Master</span>
</motion.div>
<motion.div 
  className="flex flex-col items-center"
  whileHover={{ scale: 1.1, rotate: 5 }}
>
  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br from-green-300 to-green-400 text-white shadow-lg opacity-50`}>
    <span className="text-2xl">📚</span>
  </div>
  <span className={`text-sm text-center font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Bookworm</span>
</motion.div>
</div>
</motion.div>
</div>
</div>
</div>
</div>

{/* Settings Modal */}
<AnimatePresence>
{isSettingsOpen && (
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
className="fixed z-10 inset-0 overflow-y-auto"
onClick={(e) => {
  if (e.target === e.currentTarget) {
    setIsSettingsOpen(false);
  }
}}
>
<div className="flex items-center justify-center min-h-screen p-">
              <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true">
                <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-500'} opacity-75`}></div>
              </div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`relative rounded-xl p-6 w-full max-w-lg mx-auto shadow-xl transform ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-bold mb-4 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Profile Settings
                    </h3>
                    <div className="mt-2">
                      <div className="flex items-center mb-6">
                        <div className="relative group">
                          <img className="h-20 w-20 rounded-full object-cover border-2 border-indigo-300" src={user.avatar} alt="" />
                          <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <label htmlFor="name" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                          <input
                            type="text"
                            id="name"
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                            value={user.name}
                            onChange={(e) => setUser({ ...user, name: e.target.value })}
                          />
                          <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Member since {new Date(user.joinedDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Theme</label>
                        <div className="flex space-x-2">
                          <button 
                            className={`w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 ${isDarkMode ? 'border-gray-700' : 'border-white'} shadow-md hover:opacity-90 transition-opacity`}
                            onClick={() => showToast('Theme applied!')}
                          ></button>
                          <button 
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 hover:opacity-90 transition-opacity"
                            onClick={() => showToast('Theme applied!')}
                          ></button>
                          <button 
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 hover:opacity-90 transition-opacity"
                            onClick={() => showToast('Theme applied!')}
                          ></button>
                          <button 
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 hover:opacity-90 transition-opacity"
                            onClick={() => showToast('Theme applied!')}
                          ></button>
                          <button 
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 hover:opacity-90 transition-opacity"
                            onClick={() => showToast('Theme applied!')}
                          ></button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Notification Settings</label>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="push"
                                name="push"
                                type="checkbox"
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="push" className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Push Notifications</label>
                              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Receive push notifications for reminders and achievements.</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="email"
                                name="email"
                                type="checkbox"
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="email" className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Notifications</label>
                              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Receive weekly summaries via email.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Data Export</label>
                        <button
                          type="button"
                          className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            isDarkMode 
                              ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => showToast('Data export scheduled!')}
                        >
                          <svg className="h-4 w-4 mr-1.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Export as CSV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-base font-medium text-white hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      showToast('Settings saved successfully!');
                    }}
                  >
                    Save Changes
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsSettingsOpen(false)}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Habit Modal */}
      <AnimatePresence>
        {isNewHabitModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed z-10 inset-0 overflow-y-auto"
          >
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-500'} opacity-75`}></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`inline-block align-bottom rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
              >
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <h3 className="text-lg leading-6 font-bold mb-4">Create a New Habit</h3>
                    <div className="mt-2 space-y-4">
                      <div>
                        <label htmlFor="habit-name" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Habit Name</label>
                        <input
                          type="text"
                          id="habit-name"
                          className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                          placeholder="e.g., Yoga, Journaling, etc."
                        />
                      </div>

                      <div>
                        <label htmlFor="habit-icon" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Icon</label>
                        <div className="grid grid-cols-6 gap-2">
                          {['😴', '💧', '🏃', '🧘', '📚', '📱', '🍎', '💪', '🧠', '🎯', '⏰', '🎨'].map((icon) => (
                            <motion.button
                              key={icon}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className={`w-10 h-10 flex items-center justify-center border rounded-md ${
                                isDarkMode 
                                  ? 'border-gray-600 hover:bg-gray-700' 
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {icon}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="habit-target" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Daily Target</label>
                          <input
                            type="number"
                            id="habit-target"
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                            min="1"
                            defaultValue="1"
                          />
                        </div>
                        <div>
                          <label htmlFor="habit-unit" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Unit</label>
                          <select
                            id="habit-unit"
                            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          >
                            <option>times</option>
                            <option>minutes</option>
                            <option>hours</option>
                            <option>glasses</option>
                            <option>pages</option>
                            <option>steps</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="habit-frequency" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Frequency</label>
                        <select
                          id="habit-frequency"
                          className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        >
                          <option>daily</option>
                          <option>weekdays</option>
                          <option>weekends</option>
                          <option>weekly</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="habit-color" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Color</label>
                        <div className="flex space-x-2">
                          {['#6366F1', '#38BDF8', '#FB923C', '#A855F7', '#14B8A6', '#F43F5E'].map((color) => (
                            <motion.button
                              key={color}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="w-8 h-8 rounded-full hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: color }}
                            ></motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-base font-medium text-white hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      addNewHabit({
                        name: 'Walking',
                        icon: '🚶',
                        target: 5000,
                        unit: 'steps',
                        frequency: 'daily',
                        color: '#14B8A6'
                      });
                    }}
                  >
                    Create Habit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600' 
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsNewHabitModalOpen(false)}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habit Detail Modal */}
      <AnimatePresence>
        {isHabitDetailOpen && currentDetailHabit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed z-10 inset-0 overflow-y-auto"
          >
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-500'} opacity-75`}></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`inline-block align-bottom rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
              >
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg leading-6 font-bold flex items-center">
                        <div className="flex items-center justify-center text-xl h-8 w-8 rounded-lg mr-2" style={{ backgroundColor: `${currentDetailHabit.color}30` }}>{currentDetailHabit.icon}</div>
                        {currentDetailHabit.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentDetailHabit.streak > 0 ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {currentDetailHabit.streak > 0 ? `${currentDetailHabit.streak} day streak 🔥` : 'No active streak'}
                      </span>
                    </div>

                    <div className="mb-6">
                      <div className="mb-2 flex justify-between items-center">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Daily Goal: {currentDetailHabit.target} {currentDetailHabit.unit}
                        </div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Current: {currentDetailHabit.progress} {currentDetailHabit.unit}
                        </div>
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-3 rounded-full"
                          style={{ 
                            width: `${Math.min(100, (currentDetailHabit.progress / currentDetailHabit.target) * 100)}%`,
                            backgroundColor: currentDetailHabit.color
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>30-Day History</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={currentDetailHabit.history}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { day: '2-digit' })}
                              stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            />
                            <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <Tooltip 
                              labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              formatter={(value) => [`${value} ${currentDetailHabit.unit}`, 'Value']}
                              contentStyle={{ 
                                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                                borderColor: isDarkMode ? '#374151' : '#E5E7EB',
                                color: isDarkMode ? '#FFFFFF' : '#000000'
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke={currentDetailHabit.color} 
                              activeDot={{ r: 8 }} 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-4">
                      <div>
                        <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Options</h4>
                        <div className="space-y-2">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                              isDarkMode 
                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            onClick={() => showToast('Reminders updated!')}
                          >
                            <svg className="mr-2 h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Set Reminders
                            </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                              isDarkMode 
                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            onClick={() => showToast('Notes saved!')}
                          >
                            <svg className="mr-2 h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Add Notes
                          </motion.button>
                        </div>
                      </div>
                      <div>
                        <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stats</h4>
                        <div className={`rounded-md p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current streak</div>
                          <div className="text-sm font-medium">{currentDetailHabit.streak} days</div>
                          <div className={`text-xs mb-1 mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Success rate</div>
                          <div className="text-sm font-medium">
                            {Math.round(currentDetailHabit.history.filter(h => h.value >= currentDetailHabit.target).length / currentDetailHabit.history.length * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Update Progress</h4>
                      <div className="flex items-center space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => updateHabitProgress(currentDetailHabit.id, Math.max(0, currentDetailHabit.progress - 1))}
                        >
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </motion.button>
                        <input
                          type="number"
                          className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md text-center ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          value={currentDetailHabit.progress}
                          onChange={(e) => updateHabitProgress(currentDetailHabit.id, Math.max(0, parseInt(e.target.value) || 0))}
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => updateHabitProgress(currentDetailHabit.id, currentDetailHabit.progress + 1)}
                        >
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 sm:mt-8 sm:flex sm:flex-row-reverse">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-base font-medium text-white hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setIsHabitDetailOpen(false)}
                  >
                    Close
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 hover:bg-red-700 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => deleteHabit(currentDetailHabit.id)}
                  >
                    Delete Habit
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-5 right-5 bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {toastMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t mt-10`}>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                H
              </div>
              <span className="ml-2 text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">HabitHub</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`} onClick={(e) => { e.preventDefault(); showToast('Feature coming soon!'); }}>
                Privacy Policy
              </a>
              <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`} onClick={(e) => { e.preventDefault(); showToast('Feature coming soon!'); }}>
                Terms of Service
              </a>
              <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`} onClick={(e) => { e.preventDefault(); showToast('Feature coming soon!'); }}>
                Contact
              </a>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>© 2025 HabitHub. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper function to get week number
Date.prototype.getWeek = function() {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

export default App;