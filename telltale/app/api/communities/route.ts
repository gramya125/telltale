import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all communities
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Fetch all communities
    const communities = await db
      .collection("communities")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // If userId provided, check which communities the user has joined
    let userCommunities: string[] = [];
    if (userId) {
      const userCommunitiesData = await db
        .collection("community_members")
        .find({ userId })
        .toArray();
      userCommunities = userCommunitiesData.map((cm: any) => cm.communityId.toString());
    }

    // Serialize and add isJoined flag
    const serialized = communities.map((community: any) => ({
      ...community,
      _id: community._id.toString(),
      isJoined: userId ? userCommunities.includes(community._id.toString()) : false,
    }));

    return NextResponse.json({
      success: true,
      communities: serialized,
    });
  } catch (error) {
    console.error("Get communities error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new community
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, bookId, coverImage, genre, category } = body;

    if (!name || !description) {
      return NextResponse.json(
        { success: false, message: "Name and description are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Create community
    const result = await db.collection("communities").insertOne({
      name,
      description,
      bookId: bookId ? new ObjectId(bookId) : null,
      coverImage: coverImage || null,
      genre: genre || null,
      category: category || "General",
      createdBy: session.user.id,
      members: [session.user.id],
      memberCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Add creator as first member
    await db.collection("community_members").insertOne({
      communityId: result.insertedId,
      userId: session.user.id,
      role: "admin",
      joinedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Community created successfully",
      communityId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Create community error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
