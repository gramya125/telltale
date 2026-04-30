import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const communityId = params.id;

    // Check if user is already a member
    const community = await db
      .collection("communities")
      .findOne({ _id: new ObjectId(communityId) });

    if (!community) {
      return NextResponse.json(
        { success: false, message: "Community not found" },
        { status: 404 }
      );
    }

    if (community.members.includes(userId)) {
      return NextResponse.json(
        { success: false, message: "Already a member" },
        { status: 400 }
      );
    }

    // Add user to community
    await db.collection("communities").updateOne(
      { _id: new ObjectId(communityId) },
      {
        $push: { members: userId },
        $inc: { memberCount: 1 },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Joined community successfully",
    });
  } catch (error) {
    console.error("Join community error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
