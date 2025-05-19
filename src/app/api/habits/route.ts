// src/app/api/habits/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/utils/dbConnect";
import Habit from "@/models/Habit";
import { authOptions } from "../auth/[...nextauth]/route";

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
    return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { name, icon, target, unit, frequency, color } = await req.json();
    
    await dbConnect();
    
    // Generate 30 days of history with random values
    const history = Array(30).fill(0).map((_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      value: Math.random() * target,
    }));
    
    const habit = await Habit.create({
      name,
      icon,
      target,
      unit,
      frequency,
      color,
      userId: session.user.id,
      history,
    });
    
    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 });
  }
}