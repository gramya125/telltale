import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const communityId = params.id;

    let community: any = null;

    // Try fetching by ObjectId first, fall back to custom id field
    try {
      community = await db
        .collection("communities")
        .findOne({ _id: new ObjectId(communityId) });
    } catch {
      community = await db
        .collection("communities")
        .findOne({ id: communityId });
    }

    if (!community) {
      return NextResponse.json(
        { success: false, message: "Community not found" },
        { status: 404 }
      );
    }

    // Serialize _id to string
    const serialized = {
      ...community,
      _id: community._id.toString(),
    };

    return NextResponse.json({ success: true, community: serialized });
  } catch (error) {
    console.error("Get community error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
