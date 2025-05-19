// src/app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import Habit from "@/models/Habit";

export async function POST(req:NextRequest) {
  try {
    const { name, email, password, goals } = await req.json();
    
    await dbConnect();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99)}.jpg`,
    });

    // Create default habits based on selected goals if any were provided
    if (goals && goals.length > 0) {
      // Predefined habits for different goals
      const goalHabits = {
        fitness: [
          { name: 'Daily Exercise', icon: '🏋️', target: 30, unit: 'minutes', frequency: 'daily', color: '#FF5733' },
          { name: 'Drink Water', icon: '💧', target: 8, unit: 'glasses', frequency: 'daily', color: '#33A1FD' },
          { name: 'Walk Steps', icon: '👣', target: 10000, unit: 'steps', frequency: 'daily', color: '#4CAF50' }
        ],
        productivity: [
          { name: 'Deep Work', icon: '🧠', target: 2, unit: 'hours', frequency: 'daily', color: '#9C27B0' },
          { name: 'No Social Media', icon: '📵', target: 1, unit: 'day', frequency: 'daily', color: '#607D8B' },
          { name: 'Read', icon: '📚', target: 20, unit: 'pages', frequency: 'daily', color: '#FF9800' }
        ],
        mindfulness: [
          { name: 'Meditation', icon: '🧘', target: 10, unit: 'minutes', frequency: 'daily', color: '#673AB7' },
          { name: 'Gratitude Journal', icon: '📓', target: 3, unit: 'items', frequency: 'daily', color: '#E91E63' },
          { name: 'Sleep', icon: '😴', target: 8, unit: 'hours', frequency: 'daily', color: '#3F51B5' }
        ],
        learning: [
          { name: 'Study', icon: '📝', target: 1, unit: 'hour', frequency: 'daily', color: '#009688' },
          { name: 'New Skill Practice', icon: '🔧', target: 30, unit: 'minutes', frequency: 'daily', color: '#795548' },
          { name: 'Listen to Podcast', icon: '🎧', target: 1, unit: 'episode', frequency: 'daily', color: '#CDDC39' }
        ]
      };

      // Define the allowed goal keys and habit type
      type GoalKey = keyof typeof goalHabits;
      type HabitType = typeof goalHabits[GoalKey][number];

      // Create a flat array of habits for selected goals
      const habitsToCreate = goals.flatMap((goalId: GoalKey) => {
        if (goalHabits[goalId]) {
          return goalHabits[goalId].map((habit: HabitType) => ({
            ...habit,
            userId: user._id
          }));
        }
        return [];
      });

      // Create all habits for the user
      if (habitsToCreate.length > 0) {
        await Habit.insertMany(habitsToCreate);
      }
    }
    
    return NextResponse.json(
      { user: { id: user._id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}