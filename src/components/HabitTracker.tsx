/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts"
import { Activity, BarChart3, Bell, BookOpen, Calendar, Download, Droplets, Edit3, FileText, Flame, Home, Lightbulb, Loader2, Menu, Moon, MoreHorizontal, Plus, Search, Settings, Smartphone, Sun, Target, Trophy, Users, X } from 'lucide-react'

// Type definitions
type Habit = {
  id: string | { toString(): string }
  name: string
  icon: string
  target: number
  unit: string
  frequency: string
  progress: number
  streak: number
  lastUpdated?: string | null
  history: { date: string; value: number }[]
  color: string
}

type User = {
  name: string
  avatar: string
  joinedDate: string
  currentStreak: number
  longestStreak: number
}

type Reminder = {
  id: string
  habitId: string | null
  icon: string
  title: string
  message: string
  type: "warning" | "info" | "success"
  dismissed: boolean
}

type WeeklySummary = {
  day: string
  sleep: number
  Water: number
  exercise: number
  meditation: number
  reading: number
}

type DailyProgress = {
  habit: string
  progress: number
  target: number
  unit: string
  color: string
}

// Mock data
const generateWeeklyData = (): WeeklySummary[] => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  return days.map((day) => ({
    day,
    sleep: 5 + Math.random() * 4,
    Water: 1 + Math.random() * 7,
    exercise: Math.random() * 60,
    meditation: Math.random() * 30,
    reading: Math.random() * 120,
  }))
}

const App = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const [user, setUser] = useState<User>({
    name: session?.user?.name || "User",
    avatar: session?.user?.avatar || "https://randomuser.me/api/portraits/men/44.jpg",
    joinedDate: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
  })

  const [newHabitForm, setNewHabitForm] = useState({
    name: "",
    icon: "🏃",
    target: 1,
    unit: "times",
    frequency: "daily",
    color: "#6366F1"
  })

  const [habits, setHabits] = useState<Habit[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true)
  const [weeklyData] = useState<WeeklySummary[]>(generateWeeklyData())
  const [selectedPeriod, setSelectedPeriod] = useState<string>("week")
  const [selectedHabit, setSelectedHabit] = useState<string>("all")
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
  const [isNewHabitModalOpen, setIsNewHabitModalOpen] = useState<boolean>(false)
  const [isHabitDetailOpen, setIsHabitDetailOpen] = useState<boolean>(false)
  const [currentDetailHabit, setCurrentDetailHabit] = useState<Habit | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false)
  const [currentDate, setCurrentDate] = useState<string>("")

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/habits')
        if (!response.ok) {
          throw new Error('Failed to fetch habits')
        }
        const data = await response.json()
        setHabits(data.habits || [])
      } catch (error) {
        console.error("Error fetching habits:", error)
        showToast("Failed to load habits")
      } finally {
        setIsLoading(false)
      }
    }

    fetchHabits()
  }, [])

  useEffect(() => {
    updateRemindersBasedOnHabits(habits)
  }, [habits])

  useEffect(() => {
    const now = new Date()
    setCurrentDate(now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }))

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDarkMode(prefersDark)

    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        isMobileMenuOpen
      ) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetch('/api/user')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser({
            name: userData.name,
            avatar: userData.avatar,
            joinedDate: userData.joinedDate,
            currentStreak: userData.currentStreak,
            longestStreak: userData.longestStreak,
          })
        }
        
        const habitsResponse = await fetch('/api/habits')
        if (habitsResponse.ok) {
          const { habits } = await habitsResponse.json()
          setHabits(habits)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    
    if (session) {
      fetchUserData()
    }
  }, [session])

  useEffect(() => {
    if (sidebarRef.current) {
      if (isDarkMode) {
        sidebarRef.current.classList.add("bg-gray-900", "text-white", "border-gray-800")
        sidebarRef.current.classList.remove("bg-white", "text-gray-900", "border-slate-200")
      } else {
        sidebarRef.current.classList.add("bg-white", "text-gray-900", "border-slate-200")
        sidebarRef.current.classList.remove("bg-gray-900", "text-white", "border-gray-800")
      }
    }
  }, [isDarkMode, isMobileMenuOpen])

  const handleLogout = () => {
    setIsLogoutModalOpen(false)
    signOut({ callbackUrl: '/login' })
  }

  const showToast = (message: string) => {
    setToastMessage(message)
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  const updateHabitProgress = async (habitId: string, newProgress: number) => {
    try {
      if (!habitId) {
        console.error("Error: habitId is undefined")
        showToast("Error: Cannot update habit with undefined ID")
        return
      }
      
      console.log("Updating habit progress:", habitId, newProgress)
      
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ progress: newProgress }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error updating habit progress:", errorData)
        showToast(errorData.error || "Failed to update habit progress")
        return
      }
      
      const data = await response.json()
      console.log("Habit update response:", data)
      
      // Update local state with the returned habit data
      setHabits((prevHabits) =>
        prevHabits.map((h) => {
          const hId = typeof h.id === 'string' ? h.id : h.id.toString()
          if (hId === habitId) {
            console.log("Updating habit in state:", hId)
            return { ...h, ...data.habit }
          }
          return h
        })
      )
      
      showToast("Habit progress updated successfully!")
      
      // Refresh user data for updated streaks
      try {
        const userResponse = await fetch('/api/user')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(prev => ({
            ...prev,
            currentStreak: userData.currentStreak,
            longestStreak: userData.longestStreak,
          }))
        } else {
          console.error("Failed to fetch updated user data")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    } catch (error) {
      console.error("Error updating habit:", error)
      showToast("Something went wrong. Please try again.")
    }
  }

  const updateRemindersBasedOnHabits = (currentHabits: Habit[]) => {
    const newReminders: Reminder[] = []
    
    currentHabits.forEach((habit) => {
      const habitId = habit.id !== undefined && habit.id !== null
        ? (typeof habit.id === 'string' ? habit.id : habit.id.toString())
        : ""
      
      if (habit.name === "Screen Time" && habit.progress > habit.target) {
        newReminders.push({
          id: `over-${habitId}`,
          habitId: habitId,
          icon: habit.icon,
          title: `${habit.name} goal exceeded`,
          message: `You're ${habit.progress - habit.target} ${habit.unit} over your goal`,
          type: "warning",
          dismissed: false,
        })
      }
      
      if (habit.name === "Water" && habit.progress < habit.target) {
        const remaining = habit.target - habit.progress
        const glassText = remaining === 1 ? "glass" : "glasses"
        newReminders.push({
          id: `under-${habitId}`,
          habitId: habitId,
          icon: habit.icon,
          title: `Drink more water`,
          message: `${remaining} more ${glassText} needed today`,
          type: "info",
          dismissed: false,
        })
      }
      
      if (habit.name === "Exercise" && habit.streak === 0) {
        newReminders.push({
          id: `streak-${habitId}`,
          habitId: habitId,
          icon: habit.icon,
          title: `Exercise reminder`,
          message: `You haven't exercised in 2 days`,
          type: "success",
          dismissed: false,
        })
      }
    })
    
    setReminders(newReminders)
  }

  const addNewHabit = async (habit: Habit) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(habit),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error adding habit:", errorData)
        showToast(errorData.error || "Failed to add habit")
        return
      }

      const data = await response.json()
      setHabits(prevHabits => [...prevHabits, data.habit])
      setIsNewHabitModalOpen(false)
      showToast("Habit created successfully!")
    } catch (error) {
      console.error("Error adding habit:", error)
      showToast("Something went wrong. Please try again.")
    }
  }

  const deleteHabit = async (habitId: string) => {
    try {
      if (!habitId) {
        console.error("Error: habitId is undefined")
        showToast("Error: Cannot delete habit with undefined ID")
        return
      }
      
      console.log("Deleting habit:", habitId)
      
      if (window.confirm("Are you sure you want to delete this habit?")) {
        const response = await fetch(`/api/habits/${habitId}`, {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json' 
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error deleting habit:", errorData)
          showToast(errorData.error || "Failed to delete habit")
          return
        }

        // Remove the deleted habit from state
        setHabits((prevHabits) =>
          prevHabits.filter((habit) => {
            const hId = typeof habit.id === 'string' ? habit.id : habit.id.toString()
            return hId !== habitId
          })
        )
        
        setIsHabitDetailOpen(false) // Close the habit detail modal
        showToast("Habit deleted successfully!")
      }
    } catch (error) {
      console.error("Error deleting habit:", error)
      showToast("Something went wrong. Please try again.")
    }
  }

  const dismissReminder = (reminderId: string) => {
    setReminders((prevReminders) =>
      prevReminders.map((reminder) => (reminder.id === reminderId ? { ...reminder, dismissed: true } : reminder))
    )
    showToast("Reminder dismissed")
  }

  const filteredHabits = habits.filter((habit) => habit.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const dailyProgress: DailyProgress[] = habits.map((habit) => ({
    habit: habit.name,
    progress: habit.progress,
    target: habit.target,
    unit: habit.unit,
    color: habit.color,
  }))

  const completionData = [
    { name: "Completed", value: habits.filter((h) => h.progress >= h.target).length, color: "#10B981" },
    { name: "Remaining", value: habits.filter((h) => h.progress < h.target).length, color: "#E4E4E7" },
  ]

  const openHabitDetail = (habit: Habit) => {
    setCurrentDetailHabit(habit)
    setIsHabitDetailOpen(true)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  const getHabitIcon = (habitName: string, className = "h-5 w-5") => {
    switch (habitName) {
      case "Sleep":
        return <Moon className={className} />
      case "Water":
        return <Droplets className={className} />
      case "Exercise":
        return <Activity className={className} />
      case "Meditation":
        return <Loader2 className={className} />
      case "Reading":
        return <BookOpen className={className} />
      case "Screen Time":
        return <Smartphone className={className} />
      default:
        return <Target className={className} />
    }
  }

  const getReminderIcon = (type: "warning" | "info" | "success") => {
    switch (type) {
      case "warning":
        return <Bell className="h-5 w-5" />
      case "info":
        return <Lightbulb className="h-5 w-5" />
      case "success":
        return <Trophy className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  interface CustomBarTooltipProps {
    active?: boolean
    payload?: { value: number }[]
    label?: string
  }

  const CustomBarTooltip = ({ active, payload, label }: CustomBarTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-md ${isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"}`}>
          <p className="font-medium">{label}</p>
          <p className="text-sm">{`Completion: ${Math.round(payload[0].value)}%`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? "bg-gray-950 text-white" : "bg-slate-50 text-gray-900"}`}
    >
      {/* Sidebar - Desktop */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isDarkMode ? "bg-gray-900 border-gray-800 text-white " : "bg-white border-slate-200 text-gray-900"
        } border-r shadow-lg lg:shadow-none`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center space-x-3">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-lg shadow-lg"
              >
                H
              </motion.div>
              <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-600">
                Habit-Tracker
              </span>
            </div>
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  activeTab === "dashboard"
                    ? `${isDarkMode ? "bg-violet-900/30 text-violet-300" : "bg-violet-50 text-violet-700 border border-violet-200"}`
                    : `${isDarkMode ? "text-gray-400 hover:bg-gray-800 hover:text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-transparent"}`
                }`}
              >
                <Home className={`mr-3 h-5 w-5 ${activeTab === "dashboard" ? "text-violet-500" : ""}`} />
                Dashboard
              </button>

              <button
                onClick={() => {
                  setActiveTab("insights")
                  showToast("Insights coming soon!")
                }}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  activeTab === "insights"
                    ? `${isDarkMode ? "bg-violet-900/30 text-violet-300" : "bg-violet-50 text-violet-700 border border-violet-200"}`
                    : `${isDarkMode ? "text-gray-400 hover:bg-gray-800 hover:text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-transparent"}`
                }`}
              >
                <BarChart3 className={`mr-3 h-5 w-5 ${activeTab === "insights" ? "text-violet-500" : ""}`} />
                Insights
              </button>

              <button
                onClick={() => {
                  setActiveTab("community")
                  showToast("Community features coming soon!")
                }}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  activeTab === "community"
                    ? `${isDarkMode ? "bg-violet-900/30 text-violet-300" : "bg-violet-50 text-violet-700 border border-violet-200"}`
                    : `${isDarkMode ? "text-gray-400 hover:bg-gray-800 hover:text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-transparent"}`
                }`}
              >
                <Users className={`mr-3 h-5 w-5 ${activeTab === "community" ? "text-violet-500" : ""}`} />
                Community
              </button>
            </nav>

            <div className="mt-10">
              <h3
                className={`px-4 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-500" : "text-gray-600"}`}
              >
                My Habits
              </h3>
              <div className="mt-3 space-y-1">
                {habits.map((habit) => (
                  <button
                    key={habit.id ? (typeof habit.id === 'string' ? habit.id : habit.id.toString()) : `habit-${habit.name}`}
                    onClick={() => openHabitDetail(habit)}
                    className={`flex items-center justify-between w-full px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border ${
                      selectedHabit === (habit.id ? (typeof habit.id === 'string' ? habit.id : habit.id.toString()) : `habit-${habit.name}`)
                        ? `${
                            isDarkMode
                              ? "bg-gray-800 text-white border-gray-700"
                              : "bg-gray-100 text-gray-900 border-gray-300"
                          }`
                        : `${
                            isDarkMode
                              ? "text-gray-400 hover:bg-gray-800 hover:text-white border-transparent"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-transparent"
                        }`
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className="flex items-center justify-center h-8 w-8 rounded-lg mr-3"
                        style={{ backgroundColor: `${habit.color}20` }}
                      >
                        {getHabitIcon(habit.name)}
                      </div>
                      <span>{habit.name}</span>
                    </div>
                    {habit.streak > 0 && (
                      <div className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Flame className="h-3 w-3 mr-1" />
                        {habit.streak}
                      </div>
                    )}
                  </button>
                ))}
                <button
                  onClick={() => setIsNewHabitModalOpen(true)}
                  className={`flex items-center w-full px-4 py-2 mt-2 text-sm font-medium rounded-lg border ${
                    isDarkMode
                      ? "text-gray-400 hover:bg-gray-800 hover:text-white border-transparent"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-dashed border-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg mr-3 bg-violet-100 dark:bg-violet-900/30">
                    <Plus className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <span>Add New Habit</span>
                </button>
              </div>
            </div>
          </div>

          <div
            className={`p-4 border-t ${isDarkMode ? "border-gray-800" : "border-slate-200"}`}
          >
            <div className="flex items-center">
              <img
                src={user.avatar || "/placeholder.svg"}
                alt="User avatar"
                className="h-10 w-10 rounded-full object-cover border-2 border-violet-300"
              />
              <div className="ml-3">
                <p className="text-sm font-medium">{user.name.split(" ")[0]}</p>
                <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-600"}`}>
                  Member since{" "}
                  {new Date(user.joinedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className={`ml-auto p-1.5 rounded-lg ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
              >
                <Settings className="h-5 w-5 text-gray-500" />
              </button>
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className={`p-1.5 rounded-lg ${isDarkMode ? "hover:bg-gray-800 text-red-400" : "hover:bg-gray-100 text-red-500"}`}
                title="Sign out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V8.5a1 1 0 10-2 0V15H4V5h9.5a1 1 0 100-2H3z" clipRule="evenodd" />
                  <path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H7a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navigation */}
        <header
          className={`fixed top-0 left-0 right-0 z-40 ${
            isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"
          } border-b shadow-sm lg:pl-64`}
        >
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                ref={buttonRef}
                type="button"
                className="lg:hidden -ml-1 mr-3 p-2 rounded-md text-gray-500"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>

              <div className="relative max-w-md w-full lg:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className={`h-5 w-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                </div>
                <input
                  type="text"
                  placeholder="Search habits..."
                  className={`block w-full rounded-xl border ${
                    isDarkMode ? "border-gray-700" : "border-slate-200"
                  } py-2 pl-10 pr-3 ${
                    isDarkMode
                      ? "bg-gray-800 text-white placeholder-gray-400 focus:ring-violet-500"
                      : "bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-violet-500"
                  } focus:outline-none focus:ring-2 sm:text-sm`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <select
                  className={`rounded-xl border ${
                    isDarkMode ? "border-gray-700" : "border-slate-200"
                  } py-1.5 pl-3 pr-8 text-sm ${
                    isDarkMode
                      ? "bg-gray-800 text-white focus:ring-violet-500"
                      : "bg-gray-50 text-gray-900 focus:ring-violet-500"
                  } focus:outline-none focus:ring-2`}
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="day">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>

                <select
                  className={`rounded-xl border ${
                    isDarkMode ? "border-gray-700" : "border-slate-200"
                  } py-1.5 pl-3 pr-8 text-sm ${
                    isDarkMode
                      ? "bg-gray-800 text-white focus:ring-violet-500"
                      : "bg-gray-50 text-gray-900 focus:ring-violet-500"
                  } focus:outline-none focus:ring-2`}
                  value={selectedHabit}
                  onChange={(e) => setSelectedHabit(e.target.value)}
                >
                  <option value="all">All Habits Graph</option>
                  {habits.map((habit) => (
                    <option
                      key={habit.id ? (typeof habit.id === 'string' ? habit.id : habit.id.toString()) : `habit-${habit.name}`}
                      value={habit.id ? (typeof habit.id === 'string' ? habit.id : habit.id.toString()) : `habit-${habit.name}`}
                    >
                      {habit.name}
                    </option>
                  ))}
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-xl border ${
                  isDarkMode ? "bg-gray-800 text-amber-300 border-gray-700" : "bg-gray-100 text-gray-700 border-slate-200"
                }`}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </motion.button>

              <div className="relative">
                <button type="button" className="relative" onClick={() => showToast("Notifications coming soon!")}>
                  <Bell className={`h-6 w-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                  {reminders.filter((r) => !r.dismissed).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center border border-white dark:border-gray-900">
                      {reminders.filter((r) => !r.dismissed).length}
                    </span>
                  )}
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                onClick={() => setIsNewHabitModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span>New Habit</span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-bold leading-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-600">
                  Welcome back, {user.name.split(" ")[0]}!
                </h1>
                <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{currentDate}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium border ${
                    isDarkMode
                      ? "bg-violet-900/30 text-violet-300 border-violet-800"
                      : "bg-violet-50 text-violet-700 border-violet-200"
                  }`}
                >
                  <Calendar className="h-4 w-4 mr-1.5" />
                  Week {new Date().getWeek()}
                </div>

                <div
                  className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium border ${
                    isDarkMode
                      ? "bg-amber-900/30 text-amber-300 border-amber-800"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  <Flame className="h-4 w-4 mr-1.5" />
                  {user.currentStreak} Day Streak
                </div>

                <div
                  className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium border ${
                    isDarkMode
                      ? "bg-emerald-900/30 text-emerald-300 border-emerald-800"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  <Trophy className="h-4 w-4 mr-1.5" />
                  {Math.round((habits.filter((h) => h.progress >= h.target).length / habits.length) * 100)}% Complete
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <motion.div
              variants={itemVariants}
              className={`rounded-2xl shadow-sm overflow-hidden border ${
                isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="px-6 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-violet-100 dark:bg-violet-900/30 rounded-xl p-3 border border-violet-200 dark:border-violet-800">
                    <Flame className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                        Current Streak
                      </dt>
                      <dd>
                        <div className="text-2xl font-bold">{user.currentStreak} days</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-fuchsia-600"></div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className={`rounded-2xl shadow-sm overflow-hidden border ${
                isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="px-6 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800">
                    <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                        Completed Today
                      </dt>
                      <dd>
                        <div className="text-2xl font-bold">
                          {habits.filter((h) => h.progress >= h.target).length} / {habits.length}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-600"></div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className={`rounded-2xl shadow-sm overflow-hidden border ${
                isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="px-6 py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                    <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                        Longest Streak
                      </dt>
                      <dd>
                        <div className="text-2xl font-bold">{user.longestStreak} days</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-orange-600"></div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className={`rounded-2xl shadow-sm overflow-hidden border ${
                isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="px-6 py-5">
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
                      <dt className={`text-sm font-medium truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Completion Rate
                      </dt>
                      <dd>
                        <div className="text-2xl font-bold">
                          {Math.round((habits.filter((h) => h.progress >= h.target).length / habits.length) * 100)}%
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-sky-500 to-cyan-600"></div>
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
                className={`rounded-2xl shadow-sm p-6 border ${
                  isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-6 flex items-center ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  <FileText className="h-5 w-5 mr-2 text-violet-500" />
                  Today&apos;s Progress
                </h3>
                <div className="space-y-5">
                  {filteredHabits.length === 0 ? (
                    <div className={`text-center py-8 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p className="text-sm">No habits found matching your search.</p>
                      <button
                        className={`mt-4 px-4 py-2 rounded-xl text-sm font-medium border ${
                          isDarkMode
                            ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                        }`}
                        onClick={() => setSearchQuery("")}
                      >
                        Clear search
                      </button>
                    </div>
                  ) : (
                    filteredHabits.map((habit) => (
                      <motion.div
                        key={habit.id ? (typeof habit.id === 'string' ? habit.id : habit.id.toString()) : `habit-${habit.name}`}
                        className={`relative p-5 rounded-xl border ${
                          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-slate-200"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div
                              className="flex items-center justify-center h-9 w-9 rounded-lg"
                              style={{ backgroundColor: `${habit.color}20` }}
                            >
                              {getHabitIcon(habit.name, "h-5 w-5")}
                            </div>
                            <span className={`ml-3 font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                              {habit.name}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                              {habit.progress}/{habit.target} {habit.unit}
                            </span>
                            <button
                              className={`ml-2 p-1 rounded-lg ${
                                isDarkMode
                                  ? "text-gray-400 hover:text-white hover:bg-gray-700"
                                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                              }`}
                              onClick={() => openHabitDetail(habit)}
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (habit.progress / habit.target) * 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-2.5 rounded-full"
                            style={{ backgroundColor: habit.color }}
                          ></motion.div>
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                          <div className="flex items-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                habit.streak > 0
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                              }`}
                            >
                              {habit.streak > 0 ? (
                                <>
                                  <Flame className="h-3 w-3 mr-1" />
                                  {habit.streak} day streak
                                </>
                              ) : (
                                "Start a streak!"
                              )}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                              onClick={() => {
    if (!currentDetailHabit || !currentDetailHabit.id) return; // Prevent error if currentDetailHabit or id is undefined
    updateHabitProgress(
      typeof currentDetailHabit.id === 'string'
        ? currentDetailHabit.id
        : currentDetailHabit.id.toString(),
      Math.max(0, currentDetailHabit.progress - 1)
    );
  }}
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                              onClick={() => updateHabitProgress(typeof habit.id === 'string' ? habit.id : habit.id.toString(), habit.progress + 1)}
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className={`inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white ${
                                habit.progress >= habit.target
                                  ? "bg-emerald-500 hover:bg-emerald-600"
                                  : "bg-emerald-600 hover:bg-emerald-700"
                              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`}
                              onClick={() => {
                                const today = new Date().toISOString().split("T")[0]
                                if (!(habit.progress >= habit.target && habit.lastUpdated === today)) {
                                  updateHabitProgress(typeof habit.id === 'string' ? habit.id : habit.id.toString(), habit.target)
                                }
                              }}
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
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
                className={`rounded-2xl shadow-sm p-6 border ${
                  isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-6 flex items-center ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  <Bell className="h-5 w-5 mr-2 text-amber-500" />
                  Priority Reminders
                </h3>
                <div className="space-y-4">
                  {reminders.filter((r) => !r.dismissed).length === 0 ? (
                    <div className={`text-center py-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      <p className="text-sm">No active reminders right now.</p>
                      <p className="text-xs mt-1">Great job staying on track!</p>
                    </div>
                  ) : (
                    reminders
                      .filter((reminder) => !reminder.dismissed)
                      .map((reminder) => (
                        <motion.div
                          key={reminder.id}
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          className={`flex justify-between items-start p-4 rounded-xl border ${
                            reminder.type === "warning"
                              ? isDarkMode
                                ? "bg-amber-900/20 border-amber-800 text-amber-300"
                                : "bg-amber-50 border-amber-200 text-amber-800"
                              : reminder.type === "info"
                                ? isDarkMode
                                  ? "bg-sky-900/20 border-sky-800 text-sky-300"
                                  : "bg-sky-50 border-sky-200 text-sky-800"
                                : isDarkMode
                                  ? "bg-emerald-900/20 border-emerald-800 text-emerald-300"
                                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
                          }`}
                        >
                          <div className="flex items-start">
                            <div
                              className={`flex-shrink-0 p-2 rounded-lg mr-3 ${
                                reminder.type === "warning"
                                  ? isDarkMode
                                    ? "bg-amber-800/50"
                                    : "bg-amber-100"
                                  : reminder.type === "info"
                                    ? isDarkMode
                                      ? "bg-sky-800/50"
                                      : "bg-sky-100"
                                    : isDarkMode
                                      ? "bg-emerald-800/50"
                                      : "bg-emerald-100"
                              }`}
                            >
                              {getReminderIcon(reminder.type)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{reminder.title}</p>
                              <p className="text-xs mt-1">{reminder.message}</p>
                            </div>
                          </div>
                          <button
                            className={`p-1.5 rounded-lg hover:bg-opacity-20 ${
                              reminder.type === "warning"
                                ? "hover:bg-amber-200"
                                : reminder.type === "info"
                                  ? "hover:bg-sky-200"
                                  : "hover:bg-emerald-200"
                            }`}
                            onClick={() => dismissReminder(reminder.id)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </motion.div>
                      ))
                  )}
                </div>
              </motion.div>
            </div>

            {/* Middle/Right Columns - Charts */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`rounded-2xl shadow-sm p-6 border ${
                  isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className={`text-lg font-semibold flex items-center ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    <BarChart3 className="h-5 w-5 mr-2 text-violet-500" />
                    Weekly Progress
                  </h3>
                  <div className="flex space-x-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium border ${
                        isDarkMode
                          ? "bg-violet-900/30 text-violet-300 border-violet-800"
                          : "bg-violet-50 text-violet-700 border-violet-200"
                      }`}
                    >
                      Week {new Date().getWeek()}
                    </span>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#E5E7EB"} />
                      <XAxis dataKey="day" stroke={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                      <YAxis stroke={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
                          borderColor: isDarkMode ? "#374151" : "#E5E7EB",
                          color: isDarkMode ? "#FFFFFF" : "#000000",
                        }}
                      />
                      <Legend />
                      {selectedHabit === "all" || selectedHabit === "1" ? (
                        <Line
                          type="monotone"
                          dataKey="sleep"
                          stroke="#6366F1"
                          activeDot={{ r: 8 }}
                          name="Sleep (hours)"
                          strokeWidth={2}
                        />
                      ) : null}
                      {selectedHabit === "all" || selectedHabit === "2" ? (
                        <Line type="monotone" dataKey="Water" stroke="#38BDF8" name="Water (glasses)" strokeWidth={2} />
                      ) : null}
                      {selectedHabit === "all" || selectedHabit === "3" ? (
                        <Line
                          type="monotone"
                          dataKey="exercise"
                          stroke="#FB923C"
                          name="Exercise (minutes)"
                          strokeWidth={2}
                        />
                      ) : null}
                      {selectedHabit === "all" || selectedHabit === "4" ? (
                        <Line
                          type="monotone"
                          dataKey="meditation"
                          stroke="#A855F7"
                          name="Meditation (minutes)"
                          strokeWidth={2}
                        />
                      ) : null}
                      {selectedHabit === "all" || selectedHabit === "5" ? (
                        <Line
                          type="monotone"
                          dataKey="reading"
                          stroke="#14B8A6"
                          name="Reading (minutes)"
                          strokeWidth={2}
                        />
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
                  className={`rounded-2xl shadow-sm p-6 border ${
                    isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-6 flex items-center ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    <BarChart3 className="h-5 w-5 mr-2 text-violet-500" />
                    Habit Completion
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dailyProgress.map((item) => ({
                          name: item.habit,
                          completion: (item.progress / item.target) * 100,
                          color: item.color,
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 35 }}
                        barSize={20}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#E5E7EB"} />
                        <XAxis
                          dataKey="name"
                          stroke={isDarkMode ? "#9CA3AF" : "#6B7280"}
                          angle={-45}
                          textAnchor="end"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          stroke={isDarkMode ? "#9CA3AF" : "#6B7280"}
                          label={{
                            value: "Completion %",
                            angle: -90,
                            position: "insideLeft",
                            style: { textFill: isDarkMode ? "#9CA3AF" : "#6B7280" },
                          }}
                        />
                        <Tooltip content={<CustomBarTooltip />} />
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
                  className={`rounded-2xl shadow-sm p-6 border ${
                    isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-6 flex items-center ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    <Trophy className="h-5 w-5 mr-2 text-violet-500" />
                    Achievement Badges
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <motion.div className="flex flex-col items-center" whileHover={{ scale: 1.1, rotate: 5 }}>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg border border-amber-300 dark:border-amber-700">
                        <Flame className="h-8 w-8" />
                      </div>
                      <span
                        className={`text-sm text-center font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        5-Day Streak
                      </span>
                    </motion.div>
                    <motion.div className="flex flex-col items-center" whileHover={{ scale: 1.1, rotate: 5 }}>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-lg border border-sky-300 dark:border-sky-700">
                        <Droplets className="h-8 w-8" />
                      </div>
                      <span
                        className={`text-sm text-center font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Water Champion
                      </span>
                    </motion.div>
                    <motion.div className="flex flex-col items-center" whileHover={{ scale: 1.1, rotate: 5 }}>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-lg border border-gray-300 dark:border-gray-600">
                        <Activity className="h-8 w-8" />
                      </div>
                      <span
                        className={`text-sm text-center font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Exercise Rookie
                      </span>
                    </motion.div>
                    <motion.div className="flex flex-col items-center" whileHover={{ scale: 1.1, rotate: 5 }}>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg border border-yellow-300 dark:border-yellow-700">
                        <Target className="h-8 w-8" />
                      </div>
                      <span
                        className={`text-sm text-center font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Perfect Day
                      </span>
                    </motion.div>
                    <motion.div className="flex flex-col items-center" whileHover={{ scale: 1.1, rotate: 5 }}>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br from-purple-300 to-purple-400 text-white shadow-lg opacity-50 border border-purple-200 dark:border-purple-500">
                        <Loader2 className="h-8 w-8" />
                      </div>
                      <span
                        className={`text-sm text-center font-medium ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                      >
                        Zen Master
                      </span>
                    </motion.div>
                    <motion.div className="flex flex-col items-center" whileHover={{ scale: 1.1, rotate: 5 }}>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br from-green-300 to-green-400 text-white shadow-lg opacity-50 border border-green-200 dark:border-green-500">
                        <BookOpen className="h-8 w-8" />
                      </div>
                      <span
                        className={`text-sm text-center font-medium ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                      >
                        Bookworm
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className={`${
          isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"
        } border-t mt-10`}>
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex mb-4 md:mb-0">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  H
                </div>
                <span className="ml-2 text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-600">
                  Habit-Tracker
                </span>
              </div>
              <div className="flex space-x-6">
                <a
                  href="#"
                  className={`text-sm ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
                  onClick={(e) => {
                    e.preventDefault()
                    showToast("Feature coming soon!")
                  }}
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className={`text-sm ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
                  onClick={(e) => {
                    e.preventDefault()
                    showToast("Feature coming soon!")
                  }}
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className={`text-sm ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
                  onClick={(e) => {
                    e.preventDefault()
                    showToast("Feature coming soon!")
                  }}
                >
                  Contact
                </a>
              </div>
              <div className="mt-4 md:mt-0">
                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  © 2025 Habit-Tracker. All rights reserved.
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed z-50 inset-0 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsSettingsOpen(false)
              }
            }}
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" aria-hidden="true"></div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`relative rounded-2xl p-6 w-full max-w-lg mx-auto shadow-xl border ${
                  isDarkMode ? "bg-gray-900 text-white border-gray-800" : "bg-white text-gray-900 border-slate-200"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-violet-500" />
                        Profile Settings
                      </h3>
                      <button
                        onClick={() => setIsSettingsOpen(false)}
                        className={`p-1.5 rounded-lg ${isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center mb-6">
                        <div className="relative group">
                          <img
                            className="h-20 w-20 rounded-full object-cover border-2 border-violet-300"
                            src={user.avatar || "/placeholder.svg"}
                            alt=""
                          />
                          <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Edit3 className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <label
                            htmlFor="name"
                            className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                          >
                            Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            className={`shadow-sm focus:ring-violet-500 focus:border-violet-500 block w-full sm:text-sm rounded-xl border ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-700 text-white"
                                : "bg-white border-slate-200 text-gray-900"
                            }`}
                            value={user.name}
                            onChange={(e) => setUser({ ...user, name: e.target.value })}
                          />
                          <p className={`mt-1 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Member since {new Date(user.joinedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>



                      <div className="mb-6">
                        <label
                          className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          Theme
                        </label>
                        <div className="flex space-x-3">
                          <button
                            className={`w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 border-2 ${
                              isDarkMode ? "border-gray-700" : "border-white"
                            } shadow-md hover:opacity-90 transition-opacity`}
                            onClick={() => showToast("Theme applied!")}
                          ></button>
                          <button
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 hover:opacity-90 transition-opacity border border-slate-200 dark:border-gray-700"
                            onClick={() => showToast("Theme applied!")}
                          ></button>
                          <button
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 hover:opacity-90 transition-opacity border border-slate-200 dark:border-gray-700"
                            onClick={() => showToast("Theme applied!")}
                          ></button>
                          <button
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 hover:opacity-90 transition-opacity border border-slate-200 dark:border-gray-700"
                            onClick={() => showToast("Theme applied!")}
                          ></button>
                          <button
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 hover:opacity-90 transition-opacity border border-slate-200 dark:border-gray-700"
                            onClick={() => showToast("Theme applied!")}
                          ></button>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label
                          className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          Notification Settings
                        </label>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="push"
                                name="push"
                                type="checkbox"
                                className="focus:ring-violet-500 h-4 w-4 text-violet-600 border-gray-300 rounded"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="push"
                                className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                              >
                                Push Notifications
                              </label>
                              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Receive push notifications for reminders and achievements.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="email"
                                name="email"
                                type="checkbox"
                                className="focus:ring-violet-500 h-4 w-4 text-violet-600 border-gray-300 rounded"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="email"
                                className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                              >
                                Email Notifications
                              </label>
                              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Receive weekly summaries via email.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          Data Export
                        </label>
                        <button
                          type="button"
                          className={`inline-flex items-center px-3 py-2 border rounded-xl shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 ${
                            isDarkMode
                              ? "border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
                              : "border-slate-200 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => showToast("Data export scheduled!")}
                        >
                          <Download className="h-4 w-4 mr-1.5 text-violet-500" />
                          Export as CSV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 sm:flex sm:flex-row-reverse">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-base font-medium text-white hover:from-violet-600 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setIsSettingsOpen(false)
                      showToast("Settings saved successfully!")
                    }}
                  >
                    Save Changes
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className={`mt-3 w-full inline-flex justify-center rounded-xl border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 sm:mt-0 sm:w-auto sm:text-sm ${
                      isDarkMode
                        ? "border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
                        : "border-slate-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsSettingsOpen(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  type="button"
  className="mt-3 w-full inline-flex justify-center rounded-xl border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-gray-700"
  onClick={() => {
    setIsSettingsOpen(false);
    setIsLogoutModalOpen(true);
  }}
>
  Sign out
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
            className="fixed z-50 inset-0 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsNewHabitModalOpen(false)
              }
            }}
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" aria-hidden="true"></div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`relative rounded-2xl p-6 w-full max-w-lg mx-auto shadow-xl border ${
                  isDarkMode ? "bg-gray-900 text-white border-gray-800" : "bg-white text-gray-900 border-slate-200"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center">
                      <Plus className="h-5 w-5 mr-2 text-violet-500" />
                      Create a New Habit
                    </h3>
                    <button
                      onClick={() => setIsNewHabitModalOpen(false)}
                      className={`p-1.5 rounded-lg ${isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-2 space-y-5">
                    <div>
                      <label
                        htmlFor="habit-name"
                        className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Habit Name
                      </label>
                      <input
                        type="text"
                        id="habit-name"
                        value={newHabitForm.name}
                        onChange={(e) => setNewHabitForm({...newHabitForm, name: e.target.value})}
                        className={`shadow-sm focus:ring-violet-500 focus:border-violet-500 block w-full sm:text-sm rounded-xl border ${
                          isDarkMode
                            ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                            : "bg-white border-slate-200 text-gray-900 placeholder-gray-500"
                        }`}
                        placeholder="e.g., Yoga, Journaling, etc."
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="habit-icon"
                        className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Icon
                      </label>
                      <div className="grid grid-cols-6 gap-2">
                        {["😴", "💧", "🏃", "🧘", "📚", "📱", "🍎", "💪", "🧠", "🎯", "⏰", "🎨"].map((icon) => (
                          <motion.button
                            key={icon}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`w-10 h-10 flex items-center justify-center border rounded-lg ${
                              newHabitForm.icon === icon 
                                ? `border-2 ${isDarkMode 
                                    ? "border-violet-500 bg-violet-900/30" 
                                    : "border-violet-500 bg-violet-100"
                                  }`
                                : isDarkMode 
                                    ? "border-gray-700 hover:bg-gray-800" 
                                    : "border-slate-200 hover:bg-gray-50"
                            }`}
                            onClick={() => setNewHabitForm({...newHabitForm, icon: icon})}
                          >
                            {icon}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="habit-target"
                          className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          Daily Target
                        </label>
                        <input
                          id="habit-target"
                          type="number"
                          value={newHabitForm.target}
                          onChange={(e) => setNewHabitForm({...newHabitForm, target: parseInt(e.target.value) || 1})}
                          className={`shadow-sm focus:ring-violet-500 focus:border-violet-500 block w-full sm:text-sm rounded-xl border ${
                            isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-slate-200 text-gray-900"
                          }`}
                          min="1"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="habit-unit"
                          className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          Unit
                        </label>
                        <select
  id="habit-unit"
  value={newHabitForm.unit}
  onChange={(e) => setNewHabitForm({...newHabitForm, unit: e.target.value})}
  className={`shadow-sm focus:ring-violet-500 focus:border-violet-500 block w-full sm:text-sm rounded-xl border ${
    isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-slate-200 text-gray-900"
  }`}
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
                      <label
                        htmlFor="habit-frequency"
                        className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Frequency
                      </label>
                      <select
  id="habit-frequency"
  value={newHabitForm.frequency}
  onChange={(e) => setNewHabitForm({...newHabitForm, frequency: e.target.value})}
  className={`shadow-sm focus:ring-violet-500 focus:border-violet-500 block w-full sm:text-sm rounded-xl border ${
    isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-slate-200 text-gray-900"
  }`}
>
  <option>daily</option>
  <option>weekdays</option>
  <option>weekends</option>
  <option>weekly</option>
</select>
                    </div>

                    <div>
                      <label
                        htmlFor="habit-color"
                        className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Color
                      </label>
                      <div className="flex space-x-3">
  {["#6366F1", "#38BDF8", "#FB923C", "#A855F7", "#14B8A6", "#F43F5E"].map((color) => (
    <motion.button
      key={color}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`w-8 h-8 rounded-full hover:opacity-90 transition-opacity ${
        newHabitForm.color === color ? "ring-2 ring-offset-2 ring-gray-300 dark:ring-gray-700" : ""
      }`}
      style={{ backgroundColor: color }}
      onClick={() => setNewHabitForm({...newHabitForm, color: color})}
    ></motion.button>
  ))}
</div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 sm:flex sm:flex-row-reverse">
                <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  type="button"
  className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-base font-medium text-white hover:from-violet-600 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 sm:ml-3 sm:w-auto sm:text-sm"
  onClick={() => {
    if (newHabitForm.name.trim() === "") {
      showToast("Please enter a habit name");
      return;
    }
    addNewHabit({
      ...newHabitForm,
      id: crypto.randomUUID(),
      progress: 0,
      streak: 0,
      history: [],
    });
    // Reset form after creating habit
    setNewHabitForm({
      name: "",
      icon: "🏃",
      target: 1,
      unit: "times",
      frequency: "daily",
      color: "#6366F1"
    });
  }}
>
  Create Habit
</motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className={`mt-3 w-full inline-flex justify-center rounded-xl border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 sm:mt-0 sm:w-auto sm:text-sm ${
                      isDarkMode
                        ? "border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
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
            className="fixed z-50 inset-0 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsHabitDetailOpen(false)
              }
            }}
          >
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" aria-hidden="true"></div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`relative rounded-2xl p-6 w-full max-w-lg mx-auto shadow-xl ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center">
                      <div
                        className="flex items-center justify-center h-8 w-8 rounded-lg mr-2"
                        style={{ backgroundColor: `${currentDetailHabit.color}20` }}
                      >
                        {getHabitIcon(currentDetailHabit.name)}
                      </div>
                      {currentDetailHabit.name}
                    </h3>
                    <button
                      onClick={() => setIsHabitDetailOpen(false)}
                      className={`p-1.5 rounded-lg ${isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <div className="mb-2 flex justify-between items-center">
                      <div className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Daily Goal: {currentDetailHabit.target} {currentDetailHabit.unit}
                      </div>
                      <div className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Current: {currentDetailHabit.progress} {currentDetailHabit.unit}
                      </div>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${Math.min(100, (currentDetailHabit.progress / currentDetailHabit.target) * 100)}%`,
                          backgroundColor: currentDetailHabit.color,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      30-Day History
                    </h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={currentDetailHabit.history} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#E5E7EB"} />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(date) => new Date(date).toLocaleDateString("en-US", { day: "2-digit" })}
                            stroke={isDarkMode ? "#9CA3AF" : "#6B7280"}
                          />
                          <YAxis stroke={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                          <Tooltip
                            labelFormatter={(date) =>
                              new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                            }
                            formatter={(value) => [`${value} ${currentDetailHabit.unit}`, "Value"]}
                            contentStyle={{
                              backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
                              borderColor: isDarkMode ? "#374151" : "#E5E7EB",
                              color: isDarkMode ? "#FFFFFF" : "#000000",
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
                      <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Options
                      </h4>
                      <div className="space-y-2">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-xl ${
                            isDarkMode
                              ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          onClick={() => showToast("Reminders updated!")}
                        >
                          <Bell className="mr-2 h-5 w-5 text-violet-500" />
                          Set Reminders
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-xl ${
                            isDarkMode
                              ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          onClick={() => showToast("Notes saved!")}
                        >
                          <Edit3 className="mr-2 h-5 w-5 text-violet-500" />
                          Add Notes
                        </motion.button>
                      </div>
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Stats
                      </h4>
                      <div className={`rounded-xl p-4 ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                        <div className={`text-xs mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Current streak
                        </div>
                        <div className="text-sm font-medium flex items-center">
                          <Flame className="h-4 w-4 mr-1 text-amber-500" />
                          {currentDetailHabit.streak} days
                        </div>
                        <div className={`text-xs mb-1 mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Success rate
                        </div>
                        <div className="text-sm font-medium flex items-center">
                          <Target className="h-4 w-4 mr-1 text-emerald-500" />
                          {Math.round(
                            (currentDetailHabit.history.filter((h) => h.value >= currentDetailHabit.target).length /
                              currentDetailHabit.history.length) *
                              100,
                          )}
                          %
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Update Progress
                    </h4>
                    <div className="flex items-center space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                        onClick={() =>
                          updateHabitProgress(currentDetailHabit.id.toString(), Math.max(0, currentDetailHabit.progress - 1))
                        }
                      >
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.button>
                      <input
                        type="number"
                        className={`shadow-sm focus:ring-violet-500 focus:border-violet-500 block w-full sm:text-sm rounded-xl text-center ${
                          isDarkMode
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                        value={currentDetailHabit.progress}
                        onChange={(e) => {
    if (!currentDetailHabit.id) return;
    updateHabitProgress(
      typeof currentDetailHabit.id === 'string'
        ? currentDetailHabit.id
        : currentDetailHabit.id.toString(),
      Math.max(0, Number.parseInt(e.target.value) || 0)
    );
  }}
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                          onClick={() => {
    if (!currentDetailHabit.id) return;
    updateHabitProgress(
      typeof currentDetailHabit.id === 'string'
        ? currentDetailHabit.id
        : currentDetailHabit.id.toString(),
      currentDetailHabit.progress + 1
    );
  }}
                          >
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </div>
                <div className="mt-6 sm:mt-8 sm:flex sm:flex-row-reverse">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-base font-medium text-white hover:from-violet-600 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setIsHabitDetailOpen(false)}
                  >
                    Close
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-rose-600 hover:bg-rose-700 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => {
    if (!currentDetailHabit.id) return;
    deleteHabit(
      typeof currentDetailHabit.id === 'string'
        ? currentDetailHabit.id
        : currentDetailHabit.id.toString()
    );
  }}
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
            className="fixed bottom-5 right-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 flex items-center"
          >
            <svg
              className="h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
<AnimatePresence>
  {isLogoutModalOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed z-50 inset-0 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsLogoutModalOpen(false);
        }
      }}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" aria-hidden="true"></div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`relative rounded-2xl p-6 w-full max-w-sm mx-auto shadow-xl border ${
            isDarkMode ? "bg-gray-900 text-white border-gray-800" : "bg-white text-gray-900 border-slate-200"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <svg 
              className="mx-auto h-12 w-12 text-red-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium">Sign out from HabitHub?</h3>
            <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Your progress is saved. You can sign back in anytime.
            </p>
          </div>
          <div className="mt-6 sm:flex sm:flex-row-reverse">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleLogout}
            >
              Sign out
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className={`mt-3 w-full inline-flex justify-center rounded-xl border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 sm:mt-0 sm:w-auto sm:text-sm ${
                isDarkMode
                  ? "border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
                  : "border-slate-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  )
}

// Helper function to get week number
Date.prototype.getWeek = function () {
  const date = new Date(this.getTime())
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

export default App
