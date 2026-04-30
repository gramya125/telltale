import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET community by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const communityId = params.id;

    let community: any = null;

    // Try fetching by ObjectId first
    try {
      community = await db
        .collection("communities")
        .findOne({ _id: new ObjectId(communityId) });
    } catch (err) {
      // If invalid ObjectId, fallback to string id
      community = await db
        .collection("communities")
        .findOne({ _id: communityId });
    }

    if (!community) {
      return NextResponse.json(
        { success: false, message: "Community not found" },
        { status: 404 }
      );
    }

    // Convert _id to string
    const serialized = {
      ...community,
      _id: community._id.toString(),
    };

    return NextResponse.json({
      success: true,
      community: serialized,
    });
  } catch (error) {
    console.error("Get community error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}