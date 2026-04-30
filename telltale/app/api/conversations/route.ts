import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET user's conversations
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
    
    const conversations = await db
      .collection("conversations")
      .find({ participants: userId })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new conversation
export async function POST(request: NextRequest) {
  try {
    const { participants, bookId, title } = await request.json();

    if (!participants || participants.length < 2) {
      return NextResponse.json(
        { success: false, message: "At least 2 participants required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const result = await db.collection("conversations").insertOne({
      participants,
      bookId: bookId || null,
      title: title || "Book Discussion",
      lastMessage: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Conversation created successfully",
      conversationId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
