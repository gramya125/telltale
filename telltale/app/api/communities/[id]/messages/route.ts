import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET messages for a community
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const communityId = params.id;

    const messages = await db
      .collection("messages")
      .find({ communityId })
      .sort({ createdAt: 1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST new message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, username, avatar, message } = await request.json();

    if (!userId || !username || !message) {
      return NextResponse.json(
        { success: false, message: "User ID, username, and message are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const communityId = params.id;

    const result = await db.collection("messages").insertOne({
      communityId,
      userId,
      username,
      avatar: avatar || null,
      message,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      messageId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
