import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

// GET user's notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    const notifications = await db
      .collection("notifications")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create notification
export async function POST(request: NextRequest) {
  try {
    const { userId, type, title, message, link } = await request.json();

    if (!userId || !type || !message) {
      return NextResponse.json(
        { success: false, message: "User ID, type, and message are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const result = await db.collection("notifications").insertOne({
      userId,
      type,
      title: title || "New Notification",
      message,
      link: link || null,
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Notification created successfully",
      notificationId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
