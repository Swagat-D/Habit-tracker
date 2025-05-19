// src/app/api/habits/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/utils/dbConnect";
import Habit from "@/models/Habit";
import { authOptions } from "@/lib/authOptions";


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await dbConnect();
    
    const habits = await Habit.find({ userId: session.user.id });
    
    return NextResponse.json({ habits }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { name, icon, target, unit, frequency, color } = await req.json();
    
    await dbConnect();
    
    const today = new Date();
    today.setHours(0,0,0,0);

    const history = [{
      date: today,
      value: 0,
    }]

    const habit = await Habit.create({
      name,
      icon,
      target,
      unit,
      frequency,
      color,
      userId: session.user.id,
      history,
      progress: 0,
      streak: 0,
      lastUpdated: today,
    });

    const savedHabit = await Habit.findById(habit._id);
    
    return NextResponse.json({ habit: savedHabit }, { status: 201 });
  } catch (error) {
    console.error("Error Creating Habit: ", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to create habit", details: errorMessage }, { status: 500 });
  }
}