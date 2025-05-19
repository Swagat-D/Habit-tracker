// src/app/api/habits/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/utils/dbConnect";
import Habit from "@/models/Habit";
import User from "@/models/User";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await dbConnect();
    
    const { progress } = await req.json();
    const habitId = params.id;
    
    // Find the habit and verify ownership
    const habit = await Habit.findOne({ _id: habitId, userId: session.user.id });
    
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const wasCompleted = habit.progress >= habit.target;
    const isNowCompleted = progress >= habit.target;
    
    let newStreak = habit.streak;
    let shouldUpdateUserStreak = false;
    
    // Update streak logic
    if (isNowCompleted && (!wasCompleted || !habit.lastUpdated || new Date(habit.lastUpdated).toDateString() !== today.toDateString())) {
      newStreak = habit.streak + 1;
      shouldUpdateUserStreak = true;
    } else if (progress === 0) {
      newStreak = 0;
      shouldUpdateUserStreak = true;
    }
    
    // Update history for today
    const historyIndex = habit.history.findIndex(
      (entry) => new Date(entry.date).toDateString() === today.toDateString()
    );
    
    if (historyIndex >= 0) {
      habit.history[historyIndex].value = progress;
    } else {
      habit.history.push({ date: today, value: progress });
    }
    
    // Update habit
    habit.progress = progress;
    habit.streak = newStreak;
    habit.lastUpdated = today;
    
    await habit.save();
    
    // Update user streak if necessary
    if (shouldUpdateUserStreak) {
      const user = await User.findById(session.user.id);
      
      if (user) {
        // Check if user was active today
        const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
        const isActiveToday = lastActive && lastActive.toDateString() === today.toDateString();
        
        // If completed all habits for today
        const allHabits = await Habit.find({ userId: session.user.id });
        const allCompleted = allHabits.every(h => h.progress >= h.target);
        
        if (allCompleted && !isActiveToday) {
          user.currentStreak += 1;
          
          if (user.currentStreak > user.longestStreak) {
            user.longestStreak = user.currentStreak;
          }
        } else if (!allCompleted) {
          // Reset streak if any habit is not completed
          user.currentStreak = 0;
        }
        
        user.lastActiveDate = today;
        await user.save();
      }
    }
    
    return NextResponse.json({ habit }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update habit" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await dbConnect();
    
    const habitId = params.id;
    
    // Find the habit and verify ownership
    const habit = await Habit.findOne({ _id: habitId, userId: session.user.id });
    
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }
    
    await Habit.deleteOne({ _id: habitId });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete habit" }, { status: 500 });
  }
}