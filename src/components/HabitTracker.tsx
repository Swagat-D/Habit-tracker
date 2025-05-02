"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      color: '#8884d8'
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
      color: '#82ca9d'
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
      color: '#ffc658'
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
      color: '#ff8042'
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
      color: '#8dd1e1'
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
      color: '#a4de6c'
    }
  ];
};

const App = () => {
  // State
  const [user, setUser] = useState<User>({
    name: 'Swagat Kumar Dash',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
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

  // Effect to show today's date
  const [currentDate, setCurrentDate] = useState<string>('');
  
  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  // Helper function to display toast
  const showToast = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Function to update habit progress
  const updateHabitProgress = (habitId: string, newProgress: number) => {
    setHabits(prevHabits => 
      prevHabits.map(habit => 
        habit.id === habitId 
          ? { 
              ...habit, 
              progress: newProgress,
              streak: newProgress >= habit.target ? habit.streak + 1 : 0,
              history: [
                ...habit.history.slice(0, -1),
                { ...habit.history[habit.history.length - 1], value: newProgress }
              ]
            } 
          : habit
      )
    );
    
    const habitName = habits.find(h => h.id === habitId)?.name;
    showToast(`Updated ${habitName} progress!`);
  };

  // Function to add a new habit
  const addNewHabit = (newHabit: Omit<Habit, 'id' | 'history' | 'streak' | 'progress'>) => {
    const id = (habits.length + 1).toString();
    const newHabitComplete: Habit = {
      ...newHabit,
      id,
      progress: 0,
      streak: 0,
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

  // Function to open habit details
  const openHabitDetail = (habit: Habit) => {
    setCurrentDetailHabit(habit);
    setIsHabitDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="h-8 w-8 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-lg"
                >
                  H
                </motion.div>
                <span className="ml-2 text-xl font-bold text-gray-900">HabitTrack</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#"
                  className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('Insights coming soon!');
                  }}
                >
                  Insights
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('Community features coming soon!');
                  }}
                >
                  Community
                </motion.a>
              </div>
            </div>
            <div className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="ml-3 relative"
              >
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <img className="h-8 w-8 rounded-full" src={user.avatar} alt="" />
                  </button>
                </div>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="ml-4 relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setIsNewHabitModalOpen(true)}
              >
                <span>New Habit</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Hello, {user.name}!
            </h2>
            <p className="mt-1 text-sm text-gray-500">{currentDate}</p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <motion.select
              whileHover={{ scale: 1.05 }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </motion.select>

            <motion.select
              whileHover={{ scale: 1.05 }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedHabit}
              onChange={(e) => setSelectedHabit(e.target.value)}
            >
              <option value="all">All Habits</option>
              {habits.map(habit => (
                <option key={habit.id} value={habit.id}>{habit.name}</option>
              ))}
            </motion.select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Current Streak</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{user.currentStreak} days</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed Today</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {habits.filter(h => h.progress >= h.target).length} / {habits.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Longest Streak</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{user.longestStreak} days</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Daily Check-ins */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white shadow rounded-lg p-6 mb-6"
            >
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Today&#39;s Progress</h3>
              <div className="space-y-6">
                {filteredHabits.map(habit => (
                  <div key={habit.id} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{habit.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{habit.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {habit.progress}/{habit.target} {habit.unit}
                        </span>
                        <button 
                          className="ml-2 text-indigo-600 hover:text-indigo-900"
                          onClick={() => openHabitDetail(habit)}
                        >
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (habit.progress / habit.target) * 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-2.5 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      ></motion.div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Streak: {habit.streak} days
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => updateHabitProgress(habit.id, Math.max(0, habit.progress - 1))}
                        >
                          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => updateHabitProgress(habit.id, habit.progress + 1)}
                        >
                          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          onClick={() => updateHabitProgress(habit.id, habit.target)}
                        >
                          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white shadow rounded-lg p-6"
            >
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Reminders</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 text-yellow-400 text-xl">⚠️</div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-800">Screen time goal exceeded</p>
                      <p className="text-xs text-yellow-700">You&#39;re 60 minutes over your goal</p>
                    </div>
                  </div>
                  <button className="text-yellow-600 hover:text-yellow-900">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 text-blue-400 text-xl">💧</div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-800">Drink more water</p>
                      <p className="text-xs text-blue-700">2 more glasses needed today</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-900">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 text-green-400 text-xl">🏃</div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">Exercise reminder</p>
                      <p className="text-xs text-green-700">You haven&#39;t exercised in 2 days</p>
                    </div>
                  </div>
                  <button className="text-green-600 hover:text-green-900">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Middle Column - Weekly Charts */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white shadow rounded-lg p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Weekly Progress</h3>
                <div className="flex space-x-3">
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
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
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedHabit === 'all' || selectedHabit === '1' ? (
                      <Line type="monotone" dataKey="sleep" stroke="#8884d8" activeDot={{ r: 8 }} name="Sleep (hours)" />
                    ) : null}
                    {selectedHabit === 'all' || selectedHabit === '2' ? (
                      <Line type="monotone" dataKey="water" stroke="#82ca9d" name="Water (glasses)" />
                    ) : null}
                    {selectedHabit === 'all' || selectedHabit === '3' ? (
                      <Line type="monotone" dataKey="exercise" stroke="#ffc658" name="Exercise (minutes)" />
                    ) : null}
                    {selectedHabit === 'all' || selectedHabit === '4' ? (
                      <Line type="monotone" dataKey="meditation" stroke="#ff8042" name="Meditation (minutes)" />
                    ) : null}
                    {selectedHabit === 'all' || selectedHabit === '5' ? (
                      <Line type="monotone" dataKey="reading" stroke="#8dd1e1" name="Reading (minutes)" />
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
                className="bg-white shadow rounded-lg p-6"
              >
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Habit Completion Rate</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyProgress.map(item => ({
                        name: item.habit,
                        completion: (item.progress / item.target) * 100,
                        color: item.color
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Completion %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => (typeof value === 'number' ? `${Math.round(value)}%` : value)} />
                      <Bar dataKey="completion" fill="#8884d8">
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
                className="bg-white shadow rounded-lg p-6"
              >
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Achievement Badges</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-2"
                    >
                      <span className="text-2xl">🔥</span>
                    </motion.div>
                    <span className="text-sm text-center font-medium text-gray-700">5-Day Streak</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2"
                    >
                      <span className="text-2xl">💧</span>
                    </motion.div>
                    <span className="text-sm text-center font-medium text-gray-700">Water Champion</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2"
                    >
                      <span className="text-2xl">🏃</span>
                    </motion.div>
                    <span className="text-sm text-center font-medium text-gray-700">Exercise Rookie</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-2"
                    >
                      <span className="text-2xl">⭐</span>
                    </motion.div>
                    <span className="text-sm text-center font-medium text-gray-700">Perfect Day</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-2 opacity-50"
                    >
                      <span className="text-2xl">🧘</span>
                    </motion.div>
                    <span className="text-sm text-center font-medium text-gray-400">Zen Master (Locked)</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2 opacity-50"
                    >
                      <span className="text-2xl">📚</span>
                    </motion.div>
                    <span className="text-sm text-center font-medium text-gray-400">Bookworm (Locked)</span>
                  </div>
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
          >
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
              >
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Profile Settings</h3>
                    <div className="mt-2">
                      <div className="flex items-center mb-6">
                        <img className="h-20 w-20 rounded-full mr-4" src={user.avatar} alt="" />
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            id="name"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={user.name}
                            onChange={(e) => setUser({ ...user, name: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                        <div className="flex space-x-2">
                          <button className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white shadow-md hover:opacity-90 transition-opacity"></button>
                          <button className="w-8 h-8 rounded-full bg-blue-600 hover:opacity-90 transition-opacity"></button>
                          <button className="w-8 h-8 rounded-full bg-green-600 hover:opacity-90 transition-opacity"></button>
                          <button className="w-8 h-8 rounded-full bg-purple-600 hover:opacity-90 transition-opacity"></button>
                          <button className="w-8 h-8 rounded-full bg-yellow-600 hover:opacity-90 transition-opacity"></button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notification Settings</label>
                        <div className="space-y-2">
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
                              <label htmlFor="push" className="font-medium text-gray-700">Push Notifications</label>
                              <p className="text-gray-500">Receive push notifications for reminders and achievements.</p>
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
                              <label htmlFor="email" className="font-medium text-gray-700">Email Notifications</label>
                              <p className="text-gray-500">Receive weekly summaries via email.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Export</label>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => showToast('Data export scheduled!')}
                        >
                          Export as CSV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      showToast('Settings saved successfully!');
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setIsSettingsOpen(false)}
                  >
                    Cancel
                  </button>
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
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
              >
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Habit</h3>
                    <div className="mt-2 space-y-4">
                      <div>
                        <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700 mb-1">Habit Name</label>
                        <input
                          type="text"
                          id="habit-name"
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="e.g., Yoga, Journaling, etc."
                        />
                      </div>

                      <div>
                        <label htmlFor="habit-icon" className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                        <div className="grid grid-cols-6 gap-2">
                          {['😴', '💧', '🏃', '🧘', '📚', '📱', '🍎', '💪', '🧠', '🎯', '⏰', '🎨'].map((icon) => (
                            <button
                              key={icon}
                              className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="habit-target" className="block text-sm font-medium text-gray-700 mb-1">Daily Target</label>
                          <input
                            type="number"
                            id="habit-target"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            min="1"
                            defaultValue="1"
                          />
                        </div>
                        <div>
                          <label htmlFor="habit-unit" className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                          <select
                            id="habit-unit"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            <option>times</option>
                            <option>minutes</option>
                            <option>hours</option>
                            <option>glasses</option>
                            <option>pages</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="habit-frequency" className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                        <select
                          id="habit-frequency"
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                          <option>daily</option>
                          <option>weekdays</option>
                          <option>weekends</option>
                          <option>weekly</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="habit-color" className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                        <div className="flex space-x-2">
                          {['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'].map((color) => (
                            <button
                              key={color}
                              className="w-8 h-8 rounded-full hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: color }}
                            ></button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      addNewHabit({
                        name: 'Walking',
                        icon: '🚶',
                        target: 5000,
                        unit: 'steps',
                        frequency: 'daily',
                        color: '#a4de6c'
                      });
                    }}
                  >
                    Create Habit
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setIsNewHabitModalOpen(false)}
                  >
                    Cancel
                  </button>
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
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
              >
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">

<span className="text-2xl mr-2">{currentDetailHabit.icon}</span>
{currentDetailHabit.name}
</h3>
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
{currentDetailHabit.streak} day streak
</span>
</div>

<div className="mb-6">
<div className="mb-2 flex justify-between items-center">
<div className="text-sm font-medium text-gray-700">
  Daily Goal: {currentDetailHabit.target} {currentDetailHabit.unit}
</div>
<div className="text-sm font-medium text-gray-700">
  Current: {currentDetailHabit.progress} {currentDetailHabit.unit}
</div>
</div>
<div className="w-full bg-gray-200 rounded-full h-2.5">
<div 
  className="h-2.5 rounded-full"
  style={{ 
    width: `${Math.min(100, (currentDetailHabit.progress / currentDetailHabit.target) * 100)}%`,
    backgroundColor: currentDetailHabit.color
  }}
></div>
</div>
</div>

<div className="mb-6">
<h4 className="text-sm font-medium text-gray-700 mb-2">30-Day History</h4>
<div className="h-48">
<ResponsiveContainer width="100%" height="100%">
  <LineChart
    data={currentDetailHabit.history}
    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis 
      dataKey="date" 
      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { day: '2-digit' })}
    />
    <YAxis />
    <Tooltip 
      labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      formatter={(value) => [`${value} ${currentDetailHabit.unit}`, 'Value']}
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
<h4 className="text-sm font-medium text-gray-700 mb-2">Options</h4>
<div className="space-y-2">
  <button
    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 w-full"
    onClick={() => showToast('Reminders updated!')}
  >
    <svg className="mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
    </svg>
    Set Reminders
  </button>
  <button
    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 w-full"
    onClick={() => showToast('Notes saved!')}
  >
    <svg className="mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
    Add Notes
  </button>
</div>
</div>
<div>
<h4 className="text-sm font-medium text-gray-700 mb-2">Stats</h4>
<div className="bg-gray-50 rounded-md p-3">
  <div className="text-xs text-gray-500 mb-1">Current streak</div>
  <div className="text-sm font-medium">{currentDetailHabit.streak} days</div>
  <div className="text-xs text-gray-500 mb-1 mt-2">Success rate</div>
  <div className="text-sm font-medium">
    {Math.round(currentDetailHabit.history.filter(h => h.value >= currentDetailHabit.target).length / currentDetailHabit.history.length * 100)}%
  </div>
</div>
</div>
</div>

<div>
<h4 className="text-sm font-medium text-gray-700 mb-2">Update Progress</h4>
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
  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-center"
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
<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
<button
type="button"
className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
onClick={() => setIsHabitDetailOpen(false)}
>
Close
</button>
<button
type="button"
className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:w-auto sm:text-sm"
onClick={() => deleteHabit(currentDetailHabit.id)}
>
Delete Habit
</button>
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
className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg"
>
<div className="flex items-center">
<svg className="h-6 w-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
</svg>
{toastMessage}
</div>
</motion.div>
)}
</AnimatePresence>

{/* Footer */}
<footer className="bg-white shadow-inner mt-10">
<div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
<div className="flex flex-col md:flex-row justify-between items-center">
<div className="flex mb-4 md:mb-0">
<motion.div 
initial={{ rotate: 0 }}
animate={{ rotate: 360 }}
transition={{ duration: 2, ease: "easeInOut" }}
className="h-8 w-8 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-lg"
>
H
</motion.div>
<span className="ml-2 text-xl font-bold text-gray-900">HabitTrack</span>
</div>
<div className="flex space-x-6">
<a href="#" className="text-gray-500 hover:text-gray-900" onClick={(e) => { e.preventDefault(); showToast('Feature coming soon!'); }}>
Privacy Policy
</a>
<a href="#" className="text-gray-500 hover:text-gray-900" onClick={(e) => { e.preventDefault(); showToast('Feature coming soon!'); }}>
Terms of Service
</a>
<a href="#" className="text-gray-500 hover:text-gray-900" onClick={(e) => { e.preventDefault(); showToast('Feature coming soon!'); }}>
Contact
</a>
</div>
<div className="mt-4 md:mt-0">
<span className="text-gray-500 text-sm">© 2025 HabitTrack. All rights reserved.</span>
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