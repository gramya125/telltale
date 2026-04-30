import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const conversationId = params.id;

    const messages = await db
      .collection("messages")
      .find({ conversationId })
      .sort({ createdAt: 1 })
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
    const { userId, username, message, avatar } = await request.json();

    if (!userId || !message) {
      return NextResponse.json(
        { success: false, message: "User ID and message are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const conversationId = params.id;

    const result = await db.collection("messages").insertOne({
      conversationId,
      userId,
      username: username || "Anonymous",
      avatar: avatar || null,
      message,
      createdAt: new Date(),
    });

    // Update conversation's last message
    await db.collection("conversations").updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $set: {
          lastMessage: message,
          updatedAt: new Date(),
        },
      }
    );

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
